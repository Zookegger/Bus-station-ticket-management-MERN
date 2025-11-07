import { Job, Worker } from "bullmq";
import redis from "@config/redis";
import { PaymentCleanupJobData } from "@utils/queues/paymentQueue";
import * as paymentCleanupServices from "@services/paymentServices";
import logger from "@utils/logger";

/**
 * Worker that processes payment cleanup jobs from the Bull queue.
 * Handles:
 * - Expired payment cleanup
 * - Old payment archival
 * - Coupon usage release
 * - Order cancellation
 */
export const paymentWorker = new Worker<PaymentCleanupJobData>(
	"payment",
	async (job: Job<PaymentCleanupJobData>) => {
		const { batchSize = 100, dryRun = false } = job.data;

		logger.info(
			`[Payment Worker] Starting cleanup job ${job.id} (batchSize: ${batchSize}, dryRun: ${dryRun})`
		);

		try {
			// 1. Clean up expired payments
			const cleanup_result =
				await paymentCleanupServices.cleanupExpiredPayments({
					expiryThresholdMinutes: 30, // payments older than 30 min
					batchSize,
					dryRun,
				});

			logger.info(
				`[Payment Worker] Cleanup completed: ${cleanup_result.expiredPayments} expired, ${cleanup_result.cancelledOrders} orders cancelled, ${cleanup_result.releasedCoupons} coupons released`
			);

			// Return result for Bull dashboard
			return {
				success: true,
				...cleanup_result,
			};
		} catch (err) {
			logger.error(`[Payment Worker] Job ${job.id} failed:`, err);
			throw err; // Bull will retry based on queue config
		}
	},
	{
		connection: redis,
		concurrency: 1, // Process one job at a time to avoid race conditions
		limiter: {
			// Rate limiting: max 10 jobs per minute
			max: 10,
			duration: 60 * 1000,
		},
	}
);

/**
 * Event listeners for payment worker monitoring.
 */
paymentWorker.on("completed", (job: Job) => {
	logger.info(
		`[Payment Worker] Job ${job.id} completed successfully after ${
			job.processedOn ? Date.now() - job.processedOn : 0
		}ms`
	);
});

paymentWorker.on("failed", (job: Job | undefined, err: Error) => {
	logger.error(
		`[Payment Worker] Job ${job?.id} failed after ${job?.attemptsMade} attempts:`,
		err
	);
});

paymentWorker.on("error", (err: Error) => {
	logger.error("[Payment Worker] Worker error:", err);
});

paymentWorker.on("active", (job: Job) => {
	logger.info(`[Payment Worker] Job ${job.id} started processing`);
});

paymentWorker.on("stalled", (jobId: string) => {
	logger.warn(`[Payment Worker] Job ${jobId} has stalled`);
});

// Log worker startup
logger.info("[Payment Worker] Worker initialized and ready to process jobs");

export default paymentWorker;
