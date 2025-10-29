import { Coupon } from "@models/coupon";
import { CouponUsage } from "@models/couponUsage";
import db from "@models/index";
import { Order, OrderAttributes, OrderStatus } from "@models/orders";
import { Seat } from "@models/seat";
import { Ticket, TicketStatus } from "@models/ticket";
import { Trip } from "@models/trip";
import { CouponTypes } from "@my_types/coupon";
import {
	CreateOrderDTO,
	CreateOrderResult,
	OrderQueryOptions,
	RefundTicketDTO,
} from "@my_types/order";
import { SeatStatus } from "@my_types/seat";
import logger from "@utils/logger";
import * as paymentServices from "@services/paymentServices";
import * as userServices from "@services/userServices";
import { Op } from "sequelize";
import { PaymentStatus } from "@my_types/payments";
import { TripStatus } from "@my_types/trip";
import * as ticketServices from "@services/ticketServices";

/**
 * Creates an order, reserves seats, applies coupons, and initiates payment.
 * Handles both registered users and guest checkouts within a single transaction.
 *
 * @param dto - The data transfer object for creating an order.
 * @returns The created order and a payment URL for client redirection.
 */
export const createOrder = async (
	dto: CreateOrderDTO
): Promise<CreateOrderResult> => {
	if (!dto.userId && !dto.guestInfo?.email)
		throw {
			status: 400,
			message: "Either userId or guest email is required.",
		};

	const transaction = await db.sequelize.transaction();

	try {
		// 1. Validate Seats
		const seats = await Seat.findAll({
			where: { id: dto.seatIds },
			include: [{ model: Trip, as: "trip", required: true }],
			lock: transaction.LOCK.UPDATE,
			transaction,
		});

		if (seats.length !== dto.seatIds.length)
			throw { status: 404, message: "One or more seats not found." };

		// 2. Calculate Price & Validate Coupon
		const seatsWithPricing = seats.map((seat) => {
			if (seat.status !== SeatStatus.AVAILABLE)
				throw {
					status: 409,
					message: `Seat ${seat.number} is not available.`,
				};

			if (!seat.trip)
				throw {
					status: 500,
					message: `Trip data missing for seat ${seat.number}.`,
				};

			const tripPrice = Number(seat.trip.price ?? 0);
			if (!Number.isFinite(tripPrice) || tripPrice <= 0)
				throw {
					status: 500,
					message: `Invalid price for trip associated with seat ${seat.number}.`,
				};

			return { seat, price: tripPrice };
		});

		const totalBasePrice = seatsWithPricing.reduce(
			(sum, { price }) => sum + price,
			0
		);
		let totalDiscount = 0;
		let coupon: Coupon | null = null;

		if (dto.couponCode) {
			coupon = await Coupon.findOne({
				where: { code: dto.couponCode },
				transaction,
				lock: transaction.LOCK.UPDATE,
			});
			if (!coupon) throw { status: 404, message: "Coupon not found." };
			if (!coupon.isActive)
				throw { status: 400, message: "Coupon is not active." };

			const now = new Date();
			if (coupon.startPeriod && coupon.startPeriod > now)
				throw {
					status: 400,
					message: "Coupon is not yet valid.",
				};
			if (coupon.endPeriod && coupon.endPeriod < now)
				throw {
					status: 400,
					message: "Coupon has expired.",
				};

			const hasUsageLimit =
				typeof coupon.maxUsage === "number" && coupon.maxUsage > 0;
			if (hasUsageLimit && coupon.currentUsageCount >= coupon.maxUsage)
				throw {
					status: 400,
					message: "Coupon has reached its usage limit.",
				};

			if (hasUsageLimit && dto.userId) {
				const userUsage = await CouponUsage.count({
					where: { couponId: coupon.id, userId: dto.userId },
					transaction,
				});
				if (userUsage >= coupon.maxUsage)
					throw {
						status: 400,
						message:
							"You have already used this coupon the maximum number of times.",
					};
			}

			const couponValue = Number(coupon.value ?? 0);
			if (!Number.isFinite(couponValue) || couponValue <= 0)
				throw {
					status: 400,
					message: "Invalid coupon configuration.",
				};

			if (coupon.type === CouponTypes.FIXED) {
				totalDiscount = couponValue;
			} else if (coupon.type === CouponTypes.PERCENTAGE) {
				totalDiscount = (totalBasePrice * couponValue) / 100;
			}

			totalDiscount = Math.min(totalDiscount, totalBasePrice);
		}

		// Limit to 0 instead of negative price
		const totalFinalPrice = Math.max(0, totalBasePrice - totalDiscount);

		// 3. Create Order
		const order = await Order.create(
			{
				userId: dto.userId ?? null,
				guestPurchaserEmail: dto.guestInfo?.email ?? null,
				guestPurchaserName: dto.guestInfo?.name ?? null,
				guestPurchaserPhone: dto.guestInfo?.phone ?? null,
				totalBasePrice,
				totalDiscount,
				totalFinalPrice,
				status: OrderStatus.PENDING,
			},
			{ transaction }
		);

		// 4. Create Tickets
		const createdTickets = await Ticket.bulkCreate(
			seatsWithPricing.map(({ seat, price }) => ({
				orderId: order.id,
				userId: dto.userId ?? null,
				seatId: seat.id,
				basePrice: price,
				finalPrice: price, // Simplified; discount distribution could be more complex
				status: TicketStatus.PENDING,
			})),
			{ transaction }
		);

		if (createdTickets.length <= 0)
			throw new Error("Something went wrong while creating new tickets");

		// 5. Create CouponUsage & Update Coupon
		if (coupon) {
			if (dto.userId) {
				await CouponUsage.create(
					{
						couponId: coupon.id,
						orderId: order.id,
						userId: dto.userId,
						discountAmount: totalDiscount,
					},
					{ transaction }
				);
			}
			await coupon.increment("currentUsageCount", { by: 1, transaction });
		}

		// 6. Reserve Seats
		const reservedBy = dto.userId ?? order.guestPurchaserEmail!;
		await Seat.update(
			{ status: SeatStatus.RESERVED, reservedBy },
			{ where: { id: dto.seatIds }, transaction }
		);

		// 7. Initiate Payment
		const paymentRequest = dto.additionalData
			? {
					orderId: order.id,
					paymentMethodCode: dto.paymentMethodCode,
					additionalData: dto.additionalData,
			  }
			: {
					orderId: order.id,
					paymentMethodCode: dto.paymentMethodCode,
			  };

		const { paymentUrl } = await paymentServices.initiatePayment(
			paymentRequest,
			transaction
		);

		const transactionState = (
			transaction as unknown as { finished?: string }
		).finished;
		if (!transactionState) {
			await transaction.commit();
		}

		// Reload order with tickets to return
		const finalOrder = await Order.findByPk(order.id, {
			include: [{ model: Ticket, as: "tickets" }],
		});

		if (!finalOrder) {
			throw new Error("Something went wrong while creating order");
		}

		return {
			order: {
				id: finalOrder.id,
				status: finalOrder.status,
				tickets: (finalOrder.tickets ?? []) as Ticket[],
				totalFinalPrice: Number(finalOrder.totalFinalPrice),
			},
			paymentUrl,
		};
	} catch (err) {
		const transactionState = (
			transaction as unknown as { finished?: string }
		).finished;
		if (!transactionState) {
			await transaction.rollback();
		}
		logger.error("Order creation failed: ", err);
		throw err;
	}
};

/**
 * Refunds specific tickets within an order, processes payment gateway refund,
 * and updates the status of all related entities within a transaction.
 *
 * @param dto - The data transfer object for refunding tickets.
 * @returns The updated order object.
 */
export const refundTickets = async (dto: RefundTicketDTO): Promise<Order> => {
	const transaction = await db.sequelize.transaction();

	try {
		const order = await Order.findByPk(dto.orderId, {
			include: [
				{ model: db.Ticket, as: "tickets" },
				{ model: db.Ticket, as: "payment" },
				{
					model: db.Ticket,
					as: "couponUsage",
					include: [{ model: db.Coupon }],
				},
			],
		});

		if (!order) throw { status: 404, message: "Order not found" };

		// 2. Validate Ticket for refund
		const ticketsToRefund: Ticket[] = order.tickets!.filter((t) =>
			dto.ticketIds.includes(t.id)
		);
		if (ticketsToRefund.length !== dto.ticketIds.length)
			throw {
				status: 404,
				message: "Some tickets do not belong to this order.",
			};

		for (const ticket of ticketsToRefund) {
			if (ticket.status !== TicketStatus.BOOKED)
				throw {
					status: 400,
					message: `Ticket ${ticket.id} is not in a refundable state.`,
				};
		}

		// 3. Process Payment Gateway Refund
		const totalRefundAmount = ticketsToRefund.reduce(
			(sum, t) => sum + t.finalPrice,
			0
		);
		if (totalRefundAmount > 0 && order.payment) {
			await paymentServices.processRefund(
				{
					paymentId: order.payment.id,
					amount: totalRefundAmount,
					reason: dto.refundReason || "Customer request",
				},
				transaction
			);
		}

		// 4. Update Tickets and Seats
		const ticketIdsToUpdate: number[] = ticketsToRefund.map((t) => t.id);
		const seatIdsToRelease: number[] = ticketsToRefund.map((t) => t.seatId);

		await Ticket.update(
			{ status: TicketStatus.REFUNDED },
			{
				where: {
					id: ticketIdsToUpdate,
					status: TicketStatus.BOOKED,
				},
				transaction,
			}
		);

		await Seat.update(
			{
				status: SeatStatus.AVAILABLE,
				reservedUntil: null,
				reservedBy: null,
			},
			{ where: { id: seatIdsToRelease }, transaction }
		);

		// 5. Determine new Order Status
		const remainingTickets = order.tickets?.filter(
			(t) => !ticketIdsToUpdate.includes(t.id)
		);
		const allRefundableTicketsAreRefunded = remainingTickets!.every(
			(t) =>
				![TicketStatus.BOOKED, TicketStatus.PENDING].includes(t.status)
		);

		let newOrderStatus = OrderStatus.PARTIALLY_REFUNDED;
		if (allRefundableTicketsAreRefunded) {
			newOrderStatus = OrderStatus.REFUNDED;

			// 5.1 Revert Coupon Usage on full refund
			if (order.couponUsage && order.couponUsage.coupon) {
				await order.couponUsage.coupon.decrement(`currentUsageCount`, {
					by: 1,
					transaction,
				});
				await order.couponUsage.destroy();
			}
		}
		await order.update({ status: newOrderStatus }, { transaction });

		await transaction.commit();

		return (await Order.findByPk(order.id, {
			include: [{ model: db.Ticket, as: "tickets" }],
		}))!;
	} catch (err) {
		await transaction.rollback();
		logger.error(`Refund for order ${dto.orderId} failed: `, err);
		throw err;
	}
};

/**
 * Handles a user's request to cancel one or more tickets within an order.
 *
 * This service orchestrates the cancellation process. It determines if a
 * refund is applicable based on the order's payment status and then calls
 * either the refund service or a simple void service.
 *
 * @param dto - The data transfer object containing order and ticket IDs.
 * @returns The updated order object.
 */
export const cancelTickets = async (dto: RefundTicketDTO): Promise<Order> => {
	// Step 1: Fetch the order and all related data needed for validation.
	// This includes the payment status, and the full path from tickets to seats to the trip,
	// which is required to check if the trip has been completed.
	const order = await Order.findByPk(dto.orderId, {
		include: [
			{ model: db.Payment, as: "payment" },
			{
				model: db.Ticket,
				as: "tickets",
				include: [
					{
						model: db.Seat,
						as: "seat",
						include: [{ model: db.Trip, as: "trip" }],
					},
				],
			},
		],
	});

	// Business Logic: Decide if this is a financial refund or a simple void.
	// If the order has a completed payment, it's a refund.
	if (!order) throw { status: 404, message: "Order not found" };

	// Step 2: Find the specific tickets to be cancelled from the order.
	// First, filter the order's tickets to get only the ones specified in the DTO.
	const ticketsToCancel =
		order.tickets?.filter((ticket) => dto.ticketIds.includes(ticket.id)) ??
		[];

	// Ensure that all tickets requested for cancellation were actually found in the order.
	// This prevents trying to cancel tickets that don't belong to this order.
	if (ticketsToCancel.length !== dto.ticketIds.length)
		throw {
			status: 404,
			message: "One or more tickets do not belong to this order.",
		};

	// Step 3: Enforce critical business rules.
	// Loop through each ticket and check if its associated trip has already been completed.
	// This prevents users from cancelling tickets for a service that has already been rendered.
	for (const ticket of ticketsToCancel) {
		if (ticket.seat?.trip?.status === TripStatus.COMPLETED) {
			throw {
				status: 409,
				message: `Cannot cancel ticket ${ticket.id} for a trip that has already been completed.`,
			};
		}
	}

	// Step 4: Orchestrate the cancellation based on payment status.
	// This is the core logic of the orchestrator.
	if (
		order.payment &&
		order.payment.paymentStatus === PaymentStatus.COMPLETED
	) {
		// If the order has a completed payment, delegate to the `refundTickets` service.
		// This handles the financial transaction of returning money to the customer.
		return refundTickets(dto);
	} else {
		// If there's no completed payment, perform a non-financial "void" operation.
		// This simply marks the tickets as cancelled and makes the seats available again.
		const transaction = await db.sequelize.transaction();
		try {
			for (const ticketId of dto.ticketIds) {
				// Call the low-level utility service to void each ticket.
				await ticketServices.voidTicket(ticketId, transaction);
			}

			await transaction.commit();

			// Re-fetch the order to return its updated state to the caller.
			const new_order = await db.Order.findByPk(dto.orderId, {
				include: [{ model: db.Ticket, as: "tickets" }],
			});

			// Defensive check to ensure the order still exists after the transaction.
			if (!new_order)
				throw {
					status: 500,
					message: `Failed to refetch order ${dto.orderId} after cancellation.`,
				};

			return new_order;
		} catch (err) {
			await transaction.rollback();
			throw err;
		}
	}
};

// Admin-Only
export const listAllOrders = async (
	options: OrderQueryOptions,
	...attributes: (keyof OrderAttributes)[]
): Promise<Order[] | null> => {
	const queryOptions = buildOrderQueryOptions(options, {}, attributes);
	return await db.Order.findAll(queryOptions);
};

export const getOrderById = async (
	orderId: string,
	options: OrderQueryOptions,
	...attributes: (keyof OrderAttributes)[]
): Promise<Order | null> => {
	if (!orderId) throw { status: 400, message: "No ID was provided" };

	const queryOptions = buildOrderQueryOptions(
		options,
		{ id: orderId },
		attributes
	);
	return await db.Order.findOne(queryOptions);
};

/**
 * Retrieves orders for a specific user with optional filtering and pagination.
 * Supports filtering by status, date ranges, and sorting.
 *
 * @param userId - The UUID of the user.
 * @param options - Optional query options for filtering, sorting, and pagination.
 * @param attributes - Optional list of attributes to select.
 * @returns A list of orders matching the criteria, or null if user not found.
 * @throws {status: 400} If userId is invalid or options are malformed.
 * @throws {status: 404} If user not found.
 */
export const getUserOrders = async (
	userId: string,
	options: OrderQueryOptions,
	...attributes: (keyof OrderAttributes)[]
): Promise<Order[] | null> => {
	if (!userId) throw { status: 400, message: "No ID was provided" };

	const user = await userServices.getUserById(userId, "id");
	if (!user) throw { status: 404, message: "No user found with this ID" };

	const queryOptions = buildOrderQueryOptions(
		options,
		{ userId: user.id },
		attributes
	);
	return await db.Order.findAll(queryOptions);
};

/**
 * Retrieves orders for a guest user by email or phone number with optional filtering and pagination.
 * Supports filtering by status, date ranges, and sorting.
 *
 * @param guestPurchaserEmail - The email of the guest purchaser.
 * @param guestPurchaserPhone - The phone of the guest purchaser.
 * @param options - Optional query options for filtering, sorting, and pagination.
 * @param attributes - Optional list of attributes to select.
 * @returns A list of orders matching the criteria.
 * @throws {status: 400} If guestEmail is invalid or options are malformed.
 */
export const getGuestOrders = async (
	guestPurchaserEmail: string,
	guestPurchaserPhone: string,
	options: OrderQueryOptions,
	...attributes: (keyof OrderAttributes)[]
): Promise<Order[] | null> => {
	if (!guestPurchaserEmail && !guestPurchaserPhone)
		throw {
			status: 400,
			message: "Must provide either an Email or Phone number.",
		};

	const initialWhere: any = {};
	if (guestPurchaserEmail)
		initialWhere.guestPurchaserEmail = guestPurchaserEmail;
	if (guestPurchaserPhone)
		initialWhere.guestPurchaserPhone = guestPurchaserPhone;

	const queryOptions = buildOrderQueryOptions(
		options,
		initialWhere,
		attributes
	);
	return await db.Order.findAll(queryOptions);
};

export const checkInTicketsByOrder = async (
	orderId: string
): Promise<Order> => {
	// Step 1: Fetch the order and its tickets to identify which ones to check in.
	const order = await db.Order.findByPk(orderId, {
		include: [
			{
				model: db.Ticket,
				required: true,
				as: "tickets",
			},
		],
	});

	if (!order) throw { status: 404, message: "Order not found." };

	// Step 2: Filter for tickets that are in 'BOOKED' status.
	// This creates an array of IDs, which can have one or many items.
	const bookedTicketIds =
		order.tickets
			?.filter((ticket) => ticket.status === TicketStatus.BOOKED)
			.map((ticket) => ticket.id) ?? [];

	if (bookedTicketIds.length === 0)
		throw {
			status: 400,
			message: "This order has no tickets eligible for check-in.",
		};

	// Step 3: ALWAYS delegate to the batch confirmation service.
	// It handles arrays of any size (1 or more) safely and efficiently.
	await ticketServices.confirmTickets(bookedTicketIds);

	// Step 4: Re-fetch the order with all nested data to return the final result.
	const updatedOrder = await getOrderById(orderId, {
		include: ["tickets", "payment"],
	});

	if (!updatedOrder) throw { status: 500, message: "Failed to retrieve updated order after check-in.", };
    
	return updatedOrder;
};

/**
 * Builds a Sequelize query options object from the provided OrderQueryOptions.
 * This centralizes the logic for filtering, sorting, pagination, and including associations.
 *
 * @param options - The query options DTO.
 * @param initialWhere - An optional base where clause to build upon.
 * @param attributes - An optional array of attributes to select.
 * @returns A complete FindOptions object for Sequelize.
 */
const buildOrderQueryOptions = (
	options: OrderQueryOptions,
	initialWhere: any = {},
	attributes?: (keyof OrderAttributes)[]
): any => {
	const whereClause: any = { ...initialWhere };

	// Dynamically build the where clause from options
	if (options.status) whereClause.status = options.status;
	if (options.dateFrom || options.dateTo) {
		whereClause.createdAt = {};
		if (options.dateFrom) whereClause.createdAt[Op.gte] = options.dateFrom;
		if (options.dateTo) whereClause.createdAt[Op.lte] = options.dateTo;
	}
	if (options.updatedFrom || options.updatedTo) {
		whereClause.updatedAt = {};
		if (options.updatedFrom)
			whereClause.updatedAt[Op.gte] = options.updatedFrom;
		if (options.updatedTo)
			whereClause.updatedAt[Op.lte] = options.updatedTo;
	}

	// Build the include clause for associations
	const includeClause = options.include
		?.map((assoc) => {
			if (assoc === "tickets") return { model: db.Ticket, as: "tickets" };
			if (assoc === "payment")
				return { model: db.Payment, as: "payment" };
			if (assoc === "couponUsage") {
				return {
					model: db.CouponUsage,
					as: "couponUsage",
					include: [{ model: db.Coupon, as: "coupon" }],
				};
			}
			return null;
		})
		.filter((item): item is NonNullable<typeof item> => item !== null);

	// Build the order clause for sorting
	const orderClause: any = options.sortBy
		? [[options.sortBy, options.sortOrder || "DESC"]]
		: [["createdAt", "DESC"]];

	const queryOptions: any = {
		where: whereClause,
		order: orderClause,
	};

	if (options.limit) queryOptions.limit = options.limit;
	if (options.offset) queryOptions.offset = options.offset;

	if (includeClause && includeClause.length > 0) {
		queryOptions.include = includeClause;
	}

	if (attributes && attributes.length > 0) {
		queryOptions.attributes = attributes;
	}

	return queryOptions;
};
