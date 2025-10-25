import db from "@models/index";
import { Ticket, TicketStatus } from "@models/ticket";
import { BookTicketDTO, BookTicketResult } from "@my_types/ticket";
import { SeatStatus } from "@my_types/seat";
import { COMPUTED } from "@constants";
import { Op } from "sequelize";
import { Seat } from "@models/seat";
import { Trip } from "@models/trip";

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
export const cancelTicket = async (
	id: number,
	userId: string
): Promise<Ticket> => {
	const transaction = await db.sequelize.transaction();

	try {
		const ticket = await db.ticket.findOne({
			where: { id, userId },
			transaction,
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
			await db.seat.update(
				{
					status: SeatStatus.AVAILABLE,
					reservedBy: null,
					reservedUntil: null,
				},
				{ where: { id: ticket.seatId }, transaction }
			);
		}

		// TODO: Add refund processing, notifications, etc.

		await transaction.commit();
		return updated_ticket;
	} catch (err) {
		await transaction.rollback();
		throw err;
	}
};

export const refundTicket = async () => {};

export const cleanUpExpiredTickets = async () => {};

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

export const searchTicket = async () => {};

export const getTicketsByTrip = async () => {};

export const getUserTickets = async () => {};

export const confirmTicket = async () => {};
