import { Job, JobsOptions, Queue } from "bullmq";
import redis from "@config/redis";

/**
 * Data structure for payment cleanup jobs.
 * @interface PaymentCleanupJobData
 * @property {number} [batchSize] - Number of records to process per batch (default: 100)
 * @property {boolean} [dryRun] - If true, only log what would be cleaned without actual deletion
 */
export interface PaymentCleanupJobData {
	batchSize?: number;
	dryRun?: boolean;
}

/**
 * Adds a cleanup job to the payment queue.
 * @param {PaymentCleanupJobData} data - Job configuration data
 * @param {JobsOptions} opts - Bull job options (delay, repeat, etc.)
 * @returns {Promise<Job>} The created job instance
 */
export const addCleanupJob = async (
	data: PaymentCleanupJobData = {},
	opts: JobsOptions
): Promise<Job<PaymentCleanupJobData>> => {
    const job = await paymentQueue.add("cleanup", data, {
        // Default delay: run after 5 minutes (can be overridden)
        delay: opts.delay ?? 5 * 60 * 1000,
		jobId: `cleanup-${Date.now()}`,
		...opts,
	});

	return job;
};

/**
 * Adds a recurring cleanup job that runs daily.
 * Cleans up expired/stale payment records automatically.
 * Uses a fixed jobId to prevent duplicate recurring jobs.
 * @param {PaymentCleanupJobData} data - Job configuration
 * @returns {Promise<Job>} The scheduled recurring job
 */
export const scheduleRecurringCleanup = async (
    data: PaymentCleanupJobData = { batchSize: 100, dryRun: false }
): Promise<Job<PaymentCleanupJobData>> => {
    // Remove existing recurring job if present (prevents duplicates on restart)
    try {
        const repeatable_jobs = await paymentQueue.getRepeatableJobs();
        for (const job of repeatable_jobs) {
            if (job.name === "cleanup") {
                await paymentQueue.removeRepeatableByKey(job.key);
            }
        }
    } catch (err) {
        // Job may not exist, ignore error
    }

    const job = await paymentQueue.add("cleanup", data, {
        repeat: {
            // Run daily at 2 AM server time
            pattern: "0 2 * * *", // cron: minute hour day month weekday
        },
        removeOnComplete: true, // auto-remove job after completion
        removeOnFail: false, // keep failed jobs for debugging
    });

    return job;
};

/**
 * Bull queue for payment-related background jobs.
 * Handles cleanup of expired/failed payment records.
 */
export const paymentQueue = new Queue<PaymentCleanupJobData>("payment", {
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
