import db from "@models/index";
import { Ticket, TicketStatus } from "@models/ticket";
import { BookTicketDTO } from "@my_types/ticket";
import { SeatStatus } from "@my_types/seat";
import { COMPUTED } from "@constants";

export const bookTicket = async (dto: BookTicketDTO): Promise<Ticket> => {
	// Start a transaction for atomicity
	const transaction = await db.sequelize.transaction();

	try {
		// Lock the seat row to prevent race conditions
		const seat = await db.seat.findByPk(dto.seatId!, {
			include: [{ model: db.trip, as: "trip" }],
			lock: transaction.LOCK.UPDATE,
			transaction,
		});

		// Validate seat exists and has trip data
		if (!seat || !seat.trip)
			throw { status: 500, message: "Failed to get seat data" };

		// Check seat availability via status
		if (
			seat.status === SeatStatus.DISABLED ||
			seat.status === SeatStatus.MAINTENANCE
		)
			throw { status: 409, message: "Seat is inactive" };
		if (seat.status !== SeatStatus.AVAILABLE)
			throw { status: 409, message: "Seat is already taken or reserved" };

		// Validate trip price
		if (!seat.trip.price || seat.trip.price <= 0)
			throw { status: 500, message: "Invalid trip price" };

		const existing_ticket = await db.ticket.findOne({
			where: {
				seatId: dto.seatId!,
				userId: dto.userId!,
			},
			transaction,
		});

		if (existing_ticket)
			throw {
				status: 409,
				message: "You already have a ticket for this seat",
			};

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
				paymentId: null,
				status: TicketStatus.PENDING,
			},
			{ transaction }
		);

		if (!new_ticket)
			throw { status: 500, message: "Failed to create new ticket" };

		// Mark seat as reserved
		const reservedUntil = new Date(Date.now() + COMPUTED.TICKET_RESERVATION_MILLISECONDS);
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

// export const refundTicket = async (): Promise<> => {};


export const cleanUpTicket = async () => {
	
}