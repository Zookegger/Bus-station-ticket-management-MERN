import db from "@models/index";
import { Ticket, TicketAttributes, TicketStatus } from "@models/ticket";
import { TicketQueryOptions } from "@my_types/ticket";
import { SeatStatus } from "@my_types/seat";
import { Op, Transaction } from "sequelize";
import logger from "@utils/logger";
import { TripStatus } from "@my_types/trip";

/*
export const bookTicket = async (
	dto: BookTicketDTO
): Promise<BookTicketResult> => {
	// Normalize seatIds to an array, meaning turn single ticket to an array
	const requestedSeatIds: number[] =
		dto.seatIds == null
			? []
			: Array.isArray(dto.seatIds)
			? dto.seatIds
			: [dto.seatIds];

	if (requestedSeatIds.length === 0)
		throw { status: 400, message: "At least one seatId is required" };

	// Start a transaction for atomicity
	const transaction = await db.sequelize.transaction();

	try {
		// Lock the seat row to prevent race conditions
		const seats: Seat[] = await db.seat.findAll({
			where: { id: requestedSeatIds },
			include: [{ model: Trip, as: "trip" }],
			lock: transaction.LOCK.UPDATE,
			transaction,
		});

		if (seats.length !== requestedSeatIds.length)
			throw { status: 404, message: "Some seats not found" };

		// Validate availability and pricing
		for (const s of seats) {
			if (!s.trip?.price || s.trip.price <= 0) throw { status: 500, message: `Invalid trip price for seat ${s.id}`, };
			if (s.status !== SeatStatus.AVAILABLE) throw { status: 409, message: `Seat ${s.id} is not available` };
		}

		const existing_ticket = await db.ticket.findOne({
			where: {
				userId: dto.userId,
				seatId: requestedSeatIds,
				status: TicketStatus.BOOKED,
			},
			transaction,
		});

		if (existing_ticket) throw { status: 409, message: "You already have a ticket for this seat", };

	

		let base_price: number = seat.trip?.price;
		let final_price = base_price;
		let coupon_usage_id = null;

		// TODO: Implement with coupon logic

		// Create ticket
		const new_ticket = await db.ticket.create(
			{
				...dto,
				basePrice: base_price,
				finalPrice: final_price,
				status: TicketStatus.PENDING,
			},
			{ transaction }
		);

		if (!new_ticket)
			throw { status: 500, message: "Failed to create new ticket" };

		// Mark seat as reserved
		const reservedUntil = new Date(
			Date.now() + COMPUTED.TICKET_RESERVATION_MILLISECONDS
		);
		await seat.update(
			{
				status: SeatStatus.RESERVED,
				reservedBy: dto.userId,
				reservedUntil,
			},
			{ transaction }
		);

		// Commit transaction
		await transaction.commit();

		return new_ticket;
	} catch (err) {
		// Rollback on any error
		await transaction.rollback();
		throw err;
	}
};
*/

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
		// TODO: Implement cleanup for expired tickets
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
							required: true ,
							as: "trip", 
						}
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
				throw { status: 400, message: `Ticket ${ticket.id} cannot be confirmed.` };
			}
			if (ticket.seat!.trip!.status === TripStatus.CANCELLED) {
				throw { status: 400, message: `Trip ${ticket.seat?.tripId} is cancelled.`};
			}
			if (ticket.seat!.trip!.status === TripStatus.COMPLETED) {
				throw { status: 400, message: `Cannot check-in ticket ${ticket.id} for a trip that has already completed.`};
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
