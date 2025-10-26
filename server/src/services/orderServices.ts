import { Coupon } from "@models/coupon";
import { CouponUsage } from "@models/couponUsage";
import db from "@models/index";
import { Order, OrderStatus } from "@models/orders";
import { Seat } from "@models/seat";
import { Ticket, TicketStatus } from "@models/ticket";
import { Trip } from "@models/trip";
import { CouponTypes } from "@my_types/coupon";
import {
	CreateOrderDTO,
	CreateOrderResult,
	RefundTicketDTO,
} from "@my_types/order";
import { SeatStatus } from "@my_types/seat";
import logger from "@utils/logger";
import { initiatePayment, processRefund } from "@services/paymentServices";

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

		const { paymentUrl } = await initiatePayment(
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
			await processRefund(
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
					status: TicketStatus.COMPLETED,
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
