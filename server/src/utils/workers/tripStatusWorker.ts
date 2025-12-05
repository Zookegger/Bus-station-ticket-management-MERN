import { Worker, Job } from "bullmq";
import redis from "@config/redis";
import logger from "@utils/logger";
import { TripStatusJobData } from "@utils/queues/tripStatusQueue";
import { Trip } from "@models/trip";
import { Route } from "@models/route";
import { TripStatus } from "@my_types/trip";
import { Op } from "sequelize";

const tripStatusWorker = new Worker<TripStatusJobData>(
	"trip-status",
	async (job: Job<TripStatusJobData>) => {
		logger.info(`Processing trip status update job ${job.id}`);
		const now = new Date();

		try {
			// 1. Update SCHEDULED -> DEPARTED
			// Find trips where status is SCHEDULED and startTime <= now
			const tripsToDepart = await Trip.findAll({
				where: {
					status: TripStatus.SCHEDULED,
					startTime: {
						[Op.lte]: now,
					},
				},
			});

			if (tripsToDepart.length > 0) {
				logger.info(`Found ${tripsToDepart.length} trips to depart.`);
				await Trip.update(
					{ status: TripStatus.DEPARTED },
					{
						where: {
							id: {
								[Op.in]: tripsToDepart.map((t) => t.id),
							},
						},
					}
				);
				logger.info(`Updated ${tripsToDepart.length} trips to DEPARTED.`);
			}

			// 2. Update DEPARTED -> COMPLETED
			// Find trips where status is DEPARTED and (startTime + duration) <= now
			const tripsToComplete = await Trip.findAll({
				where: {
					status: TripStatus.DEPARTED,
				},
				include: [
					{
						model: Route,
						as: "route",
						required: true,
					},
				],
			});

			const completedTripIds: number[] = [];

			for (const trip of tripsToComplete) {
				if (trip.route && trip.route.duration) {
					const durationMs = trip.route.duration * 60 * 60 * 1000; // duration is in hours
					const arrivalTime = new Date(trip.startTime.getTime() + durationMs);

					if (arrivalTime <= now) {
						completedTripIds.push(trip.id);
					}
				}
			}

			if (completedTripIds.length > 0) {
				logger.info(`Found ${completedTripIds.length} trips to complete.`);
				await Trip.update(
					{ status: TripStatus.COMPLETED },
					{
						where: {
							id: {
								[Op.in]: completedTripIds,
							},
						},
					}
				);
				logger.info(`Updated ${completedTripIds.length} trips to COMPLETED.`);
			}

			// 3. Update PENDING -> CANCELLED (Expired drafts)
			// Find trips where status is PENDING and startTime <= now
			const expiredPendingTrips = await Trip.findAll({
				where: {
					status: TripStatus.PENDING,
					startTime: {
						[Op.lte]: now,
					},
				},
			});

			if (expiredPendingTrips.length > 0) {
				logger.info(
					`Found ${expiredPendingTrips.length} expired PENDING trips.`
				);
				await Trip.update(
					{ status: TripStatus.CANCELLED },
					{
						where: {
							id: {
								[Op.in]: expiredPendingTrips.map((t) => t.id),
							},
						},
					}
				);
				logger.info(
					`Updated ${expiredPendingTrips.length} PENDING trips to CANCELLED.`
				);
			}
		} catch (err: any) {
			logger.error(`Failed to update trip statuses: ${err.message}`);
			throw err;
		}
	},
	{
		connection: redis,
		concurrency: 1, // Run one at a time to avoid race conditions
	}
);

tripStatusWorker.on("completed", (job) => {
	logger.info(`Trip status update job ${job.id} completed`);
});

tripStatusWorker.on("failed", (job, err) => {
	logger.error(`Trip status update job ${job?.id} failed:`, err);
});

export default tripStatusWorker;
