import db from "@models/index";
import { Ticket, TicketAttributes } from "@models/ticket";
import {
	AdminUpdateTicketDTO,
	TicketQueryOptions,
	TicketStatus,
} from "@my_types/ticket";
import { SeatStatus } from "@my_types/seat";
import { Op, Transaction } from "sequelize";
import logger from "@utils/logger";
import { TripStatus } from "@my_types/trip";
import { COMPUTED } from "@constants/config";
import { OrderStatus } from "@models/orders";
import { PaymentStatus } from "@my_types/payments";
import * as couponServices from "@services/couponServices";

export const updateTicketAdmin = async (
	ticket_id: number,
	dto: AdminUpdateTicketDTO
): Promise<Ticket> => {
	if (!dto || (dto.status == null && dto.seatId == null)) {
		throw { status: 400, message: "Nothing to update." };
	}

	const transaction = await db.sequelize.transaction();

	try {
		const ticket = await db.Ticket.findByPk(ticket_id, {
			include: [
				{
					model: db.Seat,
					as: "seat",
					required: true,
					include: [
						{
							model: db.Trip,
							required: true,
							as: "trip",
						},
					],
				},
			],
			lock: transaction.LOCK.UPDATE,
			transaction,
		});

		if (!ticket)
			throw {
				status: 404,
				message: `Ticket with ID ${ticket_id} cannot be found`,
			};

		const current_status = ticket.status;

		// Disallow edits after trip completed
		if (ticket.seat?.trip?.status === TripStatus.COMPLETED)
			throw {
				status: 409,
				message: "Cannot modify ticket after trip completion.",
			};

		// Validate status transition
		if (dto.status && dto.status !== current_status) {
			// Changable statuses based on current status
			const allowed: Record<TicketStatus, TicketStatus[]> = {
				PENDING: ["CANCELLED", "EXPIRED", "BOOKED"],
				BOOKED: ["CANCELLED", "INVALID", "COMPLETED"],
				CANCELLED: [],
				EXPIRED: [],
				INVALID: [],
				COMPLETED: [],
			} as any;

			if (!(allowed[current_status] || []).includes(dto.status)) {
				throw {
					status: 400,
					message: `Illegal status change ${current_status} -> ${dto.status}`,
				};
			}
			ticket.status = dto.status;
		}

		// Handle seat reassignment
		if (dto.seatId != null && dto.seatId !== ticket.seatId) {
			// Only allow reassignment for PENDING or BOOKED tickets
			if (
				![TicketStatus.PENDING, TicketStatus.BOOKED].includes(
					ticket.status
				)
			) {
				throw {
					status: 409,
					message:
						"Seat can be changed only for PENDING or BOOKED tickets.",
				};
			}

			// Lock target seat
			const target_seat = await db.Seat.findByPk(dto.seatId, {
				include: [{ model: db.Trip, as: "trip" }],
				lock: transaction.LOCK.UPDATE,
				transaction,
			});

			// Require target seat available
			if (!target_seat)
				throw { status: 404, message: "Target seat not found" };
			if (ticket.seat && target_seat.tripId !== ticket.seat.tripId)
				throw {
					status: 400,
					message: "Seat must belong to the same trip.",
				};
			if (target_seat.status !== "available")
				throw { status: 409, message: "Target seat is not available." };

			// Release old seat
			if (ticket.seatId) {
				await db.Seat.update(
					{
						status: SeatStatus.AVAILABLE,
						reservedUntil: null,
						reservedBy: null,
					},
					{ where: { id: ticket.seatId }, transaction }
				);
			}
			// Set target seat status consistent with the ticket status
			const next_seat_status =
				ticket.status === TicketStatus.BOOKED
					? SeatStatus.BOOKED
					: SeatStatus.RESERVED;

			// Assign new seat and reserve if ticket not completed
			await target_seat.update(
				{
					status: next_seat_status,
					reservedBy:
						next_seat_status === SeatStatus.RESERVED
							? (ticket as any).userId ?? null
							: null,
					reservedUntil:
						next_seat_status === SeatStatus.RESERVED
							? new Date(
									Date.now() +
										COMPUTED.TICKET_RESERVATION_MILLISECONDS
							  )
							: null,
				},
				{ transaction }
			);
			// Persist new seat on the ticket
			await ticket.update({ seatId: target_seat.id }, { transaction });
		}

		await transaction.commit();
		return ticket;
	} catch (err) {
		await transaction.rollback();
		throw err;
	}
};

// User and Admin can do this, so implement authorization later
/**
 * Voids a ticket and releases its seat without processing a refund.
 * This is a low-level utility for non-financial cancellations.
 *
 * @param ticketId - The ID of the ticket to void.
 * @param transaction - The Sequelize transaction.
 * @returns Promise resolving to the updated ticket.
 */
export const voidTicket = async (
	ticketId: number,
	transaction: Transaction
): Promise<Ticket> => {
	const ticket = await db.Ticket.findByPk(ticketId, {
		transaction,
		lock: transaction.LOCK.UPDATE,
	});

	if (!ticket) throw { status: 404, message: "No ticket found" };
	if (ticket.status !== TicketStatus.BOOKED)
		throw {
			status: 409,
			message: "Cannot cancel ticket in current status",
		};

	const updated_ticket = await ticket.update(
		{ status: TicketStatus.CANCELLED },
		{ transaction }
	);

	if (ticket.seatId) {
		await db.Seat.update(
			{
				status: SeatStatus.AVAILABLE,
				reservedBy: null,
				reservedUntil: null,
			},
			{ where: { id: ticket.seatId }, transaction }
		);
	}

	// TODO: Add notifications websocket, etc.

	return updated_ticket;
};

/**
 * Cleans up expired tickets and releases associated seats.
 *
 * @returns Promise resolving when cleanup is complete.
 */
export const cleanUpExpiredTickets = async (): Promise<void> => {
	const transaction = await db.sequelize.transaction();

	try {
		const expirationTime = new Date(
			Date.now() - COMPUTED.TICKET_RESERVATION_MILLISECONDS + 2000
		);

		// Find expired pending orders
		const expiredOrders = await db.Order.findAll({
			where: {
				status: OrderStatus.PENDING,
				createdAt: { [Op.lte]: expirationTime },
			},
			include: [
				{
					model: db.Ticket,
					as: "tickets",
					required: true,
					attributes: ["id", "seatId"],
				},
				{
					model: db.Payment,
					as: "payment",
					required: true,
					attributes: ["paymentStatus"],
				},
			],
			transaction,
		});

		if (expiredOrders.length === 0) {
			logger.info("No expired pending orders to clean up");
			await transaction.commit();
			return;
		}

		logger.info(`Found ${expiredOrders.length} expired orders to clean up`);

		for (const order of expiredOrders) {
			if (order.tickets && order.payment) {
				if (
					order.payment.paymentStatus === PaymentStatus.PENDING ||
					order.payment.paymentStatus === PaymentStatus.EXPIRED ||
					order.payment.paymentStatus === PaymentStatus.FAILED
				) {
					const ticketIds = order.tickets.map((t) => t.id);
					const seatIds = order.tickets
						.map((t) => t.seatId)
						.filter((id) => id != null);

					// 1. Update Order status to EXPIRED
					await order.update(
						{ status: OrderStatus.EXPIRED },
						{ transaction }
					);

					// 2. Update associated Tickets to EXPIRED
					if (ticketIds.length > 0) {
						await db.Ticket.update(
							{ status: TicketStatus.EXPIRED },
							{ where: { id: ticketIds }, transaction }
						);
					}

					// 3. Release associated Seats
					if (seatIds.length > 0) {
						await db.Seat.update(
							{
								status: SeatStatus.AVAILABLE,
								reservedBy: null,
								reservedUntil: null,
							},
							{ where: { id: seatIds }, transaction }
						);
					}

					// 4. Release coupon usage
					await couponServices.releaseCouponUsage(
						order.id,
						transaction
					);
				}
			}
		}

		await transaction.commit();
		logger.info(
			`Successfully cleaned up ${expiredOrders.length} expired orders.`
		);
	} catch (err) {
		await transaction.rollback();
		logger.error(err);
		throw err;
	}
};

export const cleanUpMissedTripTickets = async (): Promise<void> => {
	const transaction = await db.sequelize.transaction();

	try {
		const missedTickets = await db.Ticket.findAll({
			where: { status: TicketStatus.BOOKED },
			include: [
				{
					model: db.Seat,
					as: "seat",
					include: [
						{
							model: db.Trip,
							as: "trip",
							required: true,
							where: { status: TripStatus.COMPLETED },
						},
					],
				},
			],
			lock: transaction.LOCK.UPDATE,
			transaction,
		});

		if (missedTickets.length === 0) {
			logger.info("No missed trip tickets to clean up.");
			await transaction.commit();
			return;
		}

		// Mark each missed ticket as INVALID (no-show), but do NOT release the seat
		// Seat remains BOOKED since payment was completed
		for (const ticket of missedTickets) {
			await ticket.update(
				{ status: TicketStatus.INVALID },
				{ transaction }
			);
			logger.info(
				`Marked missed ticket ${ticket.id} as INVALID for completed trip.`
			);
		}

		await transaction.commit();
		logger.info(`Cleaned up ${missedTickets.length} missed trip tickets.`);
	} catch (err) {
		await transaction.rollback();
		logger.error("Failed to clean up missed trip tickets:", err);
		throw err;
	}
};

/**
 * Retrieves tickets by their IDs with optional filtering.
 *
 * @param id - Single ticket ID or array of ticket IDs.
 * @param options - Additional query options.
 * @returns Promise resolving to tickets and count.
 */
export const getTicketsByIds = async (
	id: string | string[],
	options: any = {}
): Promise<{ rows: Ticket[] | null; count: number }> => {
	const finalOptions = {
		...options,
		where: {
			...options.where,
			id: id,
		},
	};

	return await Ticket.findAndCountAll(finalOptions);
};

/**
 * Searches for tickets based on criteria.
 *
 * @returns Promise resolving to search results.
 */
export const searchTicket = async (
	options: TicketQueryOptions,
	...attributes: (keyof TicketAttributes)[]
): Promise<{ rows: Ticket[]; count: number }> => {
	const queryOptions = buildTicketQueryOptions(options, {}, attributes);
	return await db.Ticket.findAndCountAll(queryOptions);
};

/**
 * Confirms a ticket (e.g., for check-in).
 *
 * @returns Promise resolving when ticket is confirmed.
 */
export const confirmTickets = async (
	ticketIds: number[]
	// ): Promise<Ticket[]> => {
): Promise<void> => {
	if (!ticketIds || ticketIds.length === 0)
		throw { status: 400, message: "An array of ticket IDs is required." };

	const transaction = await db.sequelize.transaction();
	try {
		const tickets = await db.Ticket.findAll({
			where: { id: ticketIds },
			include: [
				{
					model: db.Seat,
					required: true,
					as: "seat",
					include: [
						{
							model: db.Trip,
							required: true,
							as: "trip",
						},
					],
				},
			],
			lock: transaction.LOCK.UPDATE,
			transaction,
		});

		// Step 2: Validate all tickets in memory before performing any updates.
		if (tickets.length !== ticketIds.length) {
			throw {
				status: 404,
				message: "One or more tickets were not found.",
			};
		}

		for (const ticket of tickets) {
			if (ticket.status !== TicketStatus.BOOKED) {
				throw {
					status: 400,
					message: `Ticket ${ticket.id} cannot be confirmed.`,
				};
			}
			if (ticket.seat!.trip!.status === TripStatus.CANCELLED) {
				throw {
					status: 400,
					message: `Trip ${ticket.seat?.tripId} is cancelled.`,
				};
			}
			if (ticket.seat!.trip!.status === TripStatus.COMPLETED) {
				throw {
					status: 400,
					message: `Cannot check-in ticket ${ticket.id} for a trip that has already completed.`,
				};
			}
		}

		// Step 3: Perform a single, performant bulk update.
		await db.Ticket.update(
			{ status: TicketStatus.COMPLETED },
			{ where: { id: ticketIds }, transaction }
		);

		await transaction.commit();

		// for (const ticket of tickets) {
		//     ticket.status = TicketStatus.COMPLETED;
		// }

		// return tickets;
	} catch (err) {
		await transaction.rollback();
		logger.error(err);
		throw err;
	}
};

/**
 * Builds a Sequelize query options object from the provided TicketQueryOptions.
 * This centralizes the logic for filtering, sorting, pagination, and including associations.
 *
 * @param options - The query options DTO.
 * @param initialWhere - An optional base where clause to build upon.
 * @param attributes - An optional array of attributes to select.
 * @returns A complete FindOptions object for Sequelize.
 */
const buildTicketQueryOptions = (
	options: TicketQueryOptions,
	initialWhere: any = {},
	attributes?: (keyof TicketAttributes)[]
) => {
	const whereClause: any = { ...initialWhere };

	// Dynamically build the where clause from options
	if (options.status) whereClause.status = options.status;
	if (options.orderId) whereClause.orderId = options.orderId;
	if (options.seatId) whereClause.seatId = options.seatId;

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

	if (options.minBasePrice || options.maxBasePrice) {
		whereClause.basePrice = {};
		if (options.minBasePrice)
			whereClause.basePrice[Op.gte] = options.minBasePrice;
		if (options.maxBasePrice)
			whereClause.basePrice[Op.lte] = options.maxBasePrice;
	}

	if (options.minFinalPrice || options.maxFinalPrice) {
		whereClause.finalPrice = {};
		if (options.minFinalPrice)
			whereClause.finalPrice[Op.gte] = options.minFinalPrice;
		if (options.maxFinalPrice)
			whereClause.finalPrice[Op.lte] = options.maxFinalPrice;
	}

	// Build the include clause for associations
	const includeClause = options.include
		?.map((assoc) => {
			if (assoc === "user") return { model: db.User, as: "user" };
			if (assoc === "seat")
				return {
					model: db.Seat,
					as: "seat",
					include: [{ model: db.Trip, as: "trip" }],
				};
			if (assoc === "order") return { model: db.Order, as: "order" };
			if (assoc === "payments")
				return { model: db.Payment, as: "payments" };
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
