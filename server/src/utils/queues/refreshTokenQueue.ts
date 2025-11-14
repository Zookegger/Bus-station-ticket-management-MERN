import { JobsOptions, Queue } from "bullmq";
import redis from "@config/redis";

/**
 * Payload for the refresh token cleanup job.
 * Currently empty, but can be extended later (e.g. limit, dry-run flag).
 */
export interface RefreshTokenCleanupJobData {
	// No fields for now – the job simply cleans all expired tokens
	batchSize: number;
}

/**
 * Enqueues a refresh token cleanup job.
 *
 * Call this from a scheduler (e.g., cron-based job) to periodically
 * remove expired refresh tokens from the database.
 */
export const addCleanupJob = async () => {
	// We don't need any specific data for now – the worker will
	// simply delete all expired tokens it finds.
	const job_options: JobsOptions = {
		jobId: `refresh-token-cleanup-${Date.now()}`,
	};
	
	const job_data: RefreshTokenCleanupJobData = {
		batchSize: 500,
	};

	await refreshTokenQueue.add(
		"refresh-token-cleanup-job",
		job_data,
		job_options
	);
};

export const refreshTokenQueue = new Queue<RefreshTokenCleanupJobData>(
	"refresh-token-cleanup",
	{
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
	}
);
