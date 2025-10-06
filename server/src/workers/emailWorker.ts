import { Worker, Job } from "bullmq";
import redis from "../config/redis";
import { EmailJobData } from "../queues/emailQueue";
import logger from "../utils/logger";
import { sendEmail } from "../services/emailService";

export const emailWorker = new Worker<EmailJobData>(
	"email",
	async (job: Job<EmailJobData>): Promise<void> => {        
        logger.info("Email worker started");

		logger.info(`Processing email job ${job.id} to ${job.data.to}`);

		try {
			await sendEmail(job.data);
			logger.info(`Email sent successfully to ${job.data.to}`);
		} catch (error) {
			logger.error(
				`Email Worker Error: Failed to send email to ${job.data.to}: ${error}`
			);
			throw error;
		}
	},
	{
		connection: redis,
		concurrency: 5,
	}
);

emailWorker.on("completed", (job) => {
	logger.info(`Job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
	logger.info(`Job ${job?.id} failed:`, err);
});
