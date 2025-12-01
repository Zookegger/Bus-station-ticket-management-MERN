import { Queue } from "bullmq";
import redis from "@config/redis";

/**
 * Job data structure for trip status updates.
 * @interface TripStatusJobData
 */
export interface TripStatusJobData {
	batchSize?: number;
}

/**
 * Queue for processing trip status updates.
 * Handles background status transitions (SCHEDULED -> DEPARTED -> COMPLETED).
 */
export const tripStatusQueue = new Queue<TripStatusJobData>("trip-status", {
	connection: redis,
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: 5000,
		},
		removeOnComplete: {
			count: 100,
		},
		removeOnFail: {
			count: 100,
		},
	},
});

/**
 * Adds a job to the trip status queue.
 * @param data - Job data
 * @param opts - Job options
 */
export const addStatusUpdateJob = async (data: TripStatusJobData = {}, opts?: any) => {
	return await tripStatusQueue.add("update-status", data, opts);
};

/**
 * Schedules a recurring job to update trip statuses.
 * Runs every minute to check for trips that need status updates.
 * @param data - Job data
 */
export const scheduleRecurringStatusUpdate = async (
	data: TripStatusJobData = {}
): Promise<void> => {
	// Remove existing recurring job if present
	const repeatable_jobs = await tripStatusQueue.getRepeatableJobs();
	for (const job of repeatable_jobs) {
		if (job.name === "update-status") {
			await tripStatusQueue.removeRepeatableByKey(job.key);
		}
	}

	await tripStatusQueue.add("update-status", data, {
		repeat: {
			every: 60 * 1000, // Run every minute
		},
		removeOnComplete: true,
		removeOnFail: false,
	});
};
