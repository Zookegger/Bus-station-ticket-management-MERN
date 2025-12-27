import db from "@models";
import { ReviewCreationAttributes } from "@models/review";
import { TicketStatus } from "@my_types/ticket";
import { Op } from "sequelize";

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

    static async getUnreviewedTrips(userId: string) {
        // 1. Get all trips the user has taken (via Tickets)
        const tickets = await db.Ticket.findAll({
            where: {
                userId,
                status: { [Op.in]: [TicketStatus.COMPLETED, TicketStatus.BOOKED] }
            },
            include: [
                {
                    model: db.Seat,
                    as: "seat",
                    required: true,
                    include: [
                        {
                            model: db.Trip,
                            as: "trip",
                            required: true,
                            where: {
                                startTime: { [Op.lt]: new Date() } // Trip must be in the past
                            },
                            include: [
                                { model: db.Route, as: "route" },
                                { model: db.Vehicle, as: "vehicle" }
                            ]
                        }
                    ]
                }
            ]
        });

        // Extract unique trips
        const tripsMap = new Map();
        tickets.forEach((t: any) => {
            if (t.seat && t.seat.trip) {
                tripsMap.set(t.seat.trip.id, t.seat.trip);
            }
        });

        // 2. Get all reviews by the user
        const reviews = await db.Review.findAll({
            where: { userId },
            attributes: ['tripId']
        });
        const reviewedTripIds = new Set(reviews.map(r => r.tripId));

        // 3. Filter out reviewed trips
        const unreviewedTrips = [];
        for (const [tripId, trip] of tripsMap) {
            if (!reviewedTripIds.has(tripId)) {
                unreviewedTrips.push(trip);
            }
        }

        return unreviewedTrips;
    }

    static async getAllReviews() {
        return await db.Review.findAll({
            include: [
                {
                    model: db.User,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "email", "avatar"],
                },
                {
                    model: db.Trip,
                    as: "trip",
                    include: [
                        { model: db.Route, as: "route" }
                    ]
                }
            ],
            order: [["createdAt", "DESC"]],
        });
    }

    static async updateReview(userId: string, reviewId: number, data: { rating?: number; comment?: string }) {
        const review = await db.Review.findOne({
            where: { id: reviewId, userId },
        });

        if (!review) {
            throw new Error("Review not found or you are not authorized to edit it.");
        }

        return await review.update(data);
    }

    static async deleteReview(userId: string, reviewId: number) {
        const review = await db.Review.findOne({
            where: { id: reviewId, userId },
        });

        if (!review) {
            throw new Error("Review not found or you are not authorized to delete it.");
        }

        return await review.destroy();
    }
}
