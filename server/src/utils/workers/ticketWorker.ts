import redis from "@config/redis";
import logger from "@utils/logger";
import { TicketCleanupJobData } from "@utils/queues/ticketQueue";
import { Job, Worker } from "bullmq";
import {
	cleanUpExpiredTickets,
	cleanUpMissedTripTickets,
} from "@services/ticketServices";

const ticketWorker = new Worker<TicketCleanupJobData>(
	"ticket",
	async (job: Job<TicketCleanupJobData>): Promise<void> => {
		logger.debug(`Processing ticket cleanup job ${job.id}`);

		try {
			// 1. Clean up pending orders where payment window has expired
			await cleanUpExpiredTickets();

			// 2. Mark booked tickets as 'missed' if trip is completed (no-show handling)
			await cleanUpMissedTripTickets();
		} catch (err: any) {
			logger.error(`Ticket cleanup job ${job.id} failed:`, err);
			throw err;
		}
	},
	{
		connection: redis,
		concurrency: 1, // Run sequentially to avoid DB lock contention
	}
);

ticketWorker.on("completed", (job) => {
	logger.info(`Job ${job.id} completed`);
});

ticketWorker.on("failed", (job, err) => {
	logger.info(`Job ${job?.id} failed:`, err);
});

ticketWorker.on("error", (err) => {
	logger.error("Ticket worker error:", err);
});

export default ticketWorker;