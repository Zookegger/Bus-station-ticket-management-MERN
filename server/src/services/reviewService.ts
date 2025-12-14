import db from "@models";
import { ReviewCreationAttributes } from "@models/review";
import { TicketStatus } from "@my_types/ticket";

export class ReviewService {
    static async createReview(data: ReviewCreationAttributes) {
        // Check if user has a completed ticket for this trip
        // We check for COMPLETED status.
        const ticket = await db.Ticket.findOne({
            where: {
                userId: data.userId,
                status: TicketStatus.COMPLETED,
            },
            include: [
                {
                    model: db.Seat,
                    as: "seat",
                    where: { tripId: data.tripId },
                },
            ],
        });

        if (!ticket) {
             // If no COMPLETED ticket, check if they have a BOOKED ticket and the trip is in the past?
             // For strictness, let's require COMPLETED.
             // But maybe the system doesn't auto-update to COMPLETED?
             // Let's allow BOOKED as well if the trip start time is in the past.
             const bookedTicket = await db.Ticket.findOne({
                where: { userId: data.userId, status: TicketStatus.BOOKED },
                include: [{ model: db.Seat, as: "seat", where: { tripId: data.tripId } }]
             });

             if (bookedTicket) {
                 const trip = await db.Trip.findByPk(data.tripId);
                 if (trip && new Date(trip.startTime) < new Date()) {
                     // Allow review
                 } else {
                     throw new Error("You can only review trips you have completed.");
                 }
             } else {
                 throw new Error("You can only review trips you have completed.");
             }
        }

        // Check if already reviewed
        const existingReview = await db.Review.findOne({
            where: {
                userId: data.userId,
                tripId: data.tripId,
            },
        });

        if (existingReview) {
            throw new Error("User has already reviewed this trip.");
        }

        return await db.Review.create(data);
    }

    static async getReviewsByTrip(tripId: number) {
        return await db.Review.findAll({
            where: { tripId },
            include: [
                {
                    model: db.User,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "avatar"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });
    }

    static async getReviewsByUser(userId: string) {
        return await db.Review.findAll({
            where: { userId },
            include: [
                {
                    model: db.Trip,
                    as: "trip",
                    include: [
                        { model: db.Route, as: "route" },
                        { model: db.Vehicle, as: "vehicle" }
                    ]
                },
            ],
            order: [["createdAt", "DESC"]],
        });
    }
}
