import redis from "@config/redis";
import logger from "@utils/logger";
import { TicketCleanupJobData } from "@utils/queues/ticketQueue";
import { Job, Worker } from "bullmq";

export const ticketWorker = new Worker<TicketCleanupJobData>(
	"ticket",
	async (job: Job<TicketCleanupJobData>): Promise<void> => {
        logger.debug(`Processing ticket cleanup job ${job.id}`);

        try {

        } catch (err) {
            logger.error();
            throw err;
        }
    }, {
        connection: redis,
        concurrency: 5,
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

ticketWorker.on("ready", () => {
	logger.info("Ticket worker is ready and listening for jobs");
});