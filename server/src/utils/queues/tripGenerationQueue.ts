import { Queue } from "bullmq";
import redis from "@config/redis";
import logger from "@utils/logger";

export interface TripGenerationJobData {
	date?: string; // Optional: Force generation for a specific date
}

/**
 * Queue for generating trip instances from templates.
 * Typically runs once daily (e.g., at midnight).
 */
export const tripGenerationQueue = new Queue<TripGenerationJobData>(
	"trip-generation",
	{
		connection: redis,
		defaultJobOptions: {
			attempts: 3,
			backoff: { type: "exponential", delay: 10000 },
			removeOnComplete: { count: 100 },
			removeOnFail: { count: 100 },
		},
	}
);

/**
 * Schedules the daily trip generation job.
 * This should be called at server startup.
 */
export const scheduleRecurringTripGeneration = async () => {
	try {
		// Remove existing repeatable jobs to prevent duplicates if pattern changes
		const repeatableJobs = await tripGenerationQueue.getRepeatableJobs();
		for (const job of repeatableJobs) {
			await tripGenerationQueue.removeRepeatableByKey(job.key);
		}

		// Add new repeatable job (Runs daily at 00:00)
		await tripGenerationQueue.add(
			"daily-trip-generation",
			{},
			{
				repeat: {
					pattern: "0 0 * * *", // Every day at midnight
				},
			}
		);
		logger.info("Scheduled recurring trip generation job (Daily at 00:00)");
	} catch (error) {
		logger.error(
			`Failed to schedule trip generation: ${(error as Error).message}`
		);
	}
};

