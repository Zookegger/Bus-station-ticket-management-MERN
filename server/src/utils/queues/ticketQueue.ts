import { COMPUTED } from "@constants";
import redis from "@config/redis";
import { Queue, JobsOptions, Job, RepeatOptions } from "bullmq";

export interface TicketCleanupJobData {
	batchSize?: number;
	dryRun?: boolean;
}

export const addCleanupJob = async (
	data: TicketCleanupJobData = {},
	opts: JobsOptions
): Promise<Job<TicketCleanupJobData | null>> => {
    const job = await ticketQueue.add("cleanup", data, {
        delay: COMPUTED.PAYMENT_WINDOW_SECONDS,
		jobId: `cleanup-${Date.now()}`,
		...opts,
	});

	return job;
};

export const ticketQueue = new Queue<TicketCleanupJobData>("ticket", {
	connection: redis,

	defaultJobOptions: {
		// Retry a job up to 3 times if it fails (e.g., SMTP error, timeout, etc.)
		attempts: 3,

		// Wait strategy for retries
		backoff: {
			type: "exponential", // delay increases exponentially
			delay: 2000, // first retry after 2s, then 4s, then 8s, etc.
		},

		// Auto-cleanup successful jobs
		removeOnComplete: {
			count: 100, // keep at most the last 100 successful jobs
			age: 24 * 3600, // or remove if older than 24 hours (in seconds)
		},

		// Auto-cleanup failed jobs
		removeOnFail: {
			count: 1000, // keep at most 1000 failed jobs, delete older ones
		},
	},
});
