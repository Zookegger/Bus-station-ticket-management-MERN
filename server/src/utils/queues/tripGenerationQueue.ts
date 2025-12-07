import { Queue } from "bullmq";
import redis from "@config/redis";

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
