import { NextFunction, Request, Response } from "express";
import { addCleanupJob } from "@utils/queues/paymentQueue";
import logger from "@utils/logger";

/**
 * Manually trigger payment cleanup job (admin/debug only).
 * This endpoint allows testing the payment cleanup worker without waiting for the scheduled time.
 * 
 * @route POST /api/debug/trigger-payment-cleanup
 * @access Admin
 */
export const TriggerPaymentCleanup = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { batchSize = 100, dryRun = true, delay = 0 } = req.body;

		logger.info(`[Debug] Manually triggering payment cleanup (dryRun: ${dryRun}, batchSize: ${batchSize})`);

		// Add job to queue
		const job = await addCleanupJob(
			{ batchSize, dryRun },
			{ delay } // run immediately or with specified delay
		);

		res.status(200).json({
			success: true,
			message: "Payment cleanup job queued successfully.",
			data: {
				jobId: job.id,
				batchSize,
				dryRun,
				delay,
				estimatedRunTime: new Date(Date.now() + delay).toISOString(),
			},
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Get payment queue statistics and job counts.
 * 
 * @route GET /api/debug/payment-queue-stats
 * @access Admin
 */
export const GetPaymentQueueStats = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { paymentQueue } = await import("@utils/queues/paymentQueue");

		const [waiting, active, completed, failed, delayed, repeatable] = await Promise.all([
			paymentQueue.getWaitingCount(),
			paymentQueue.getActiveCount(),
			paymentQueue.getCompletedCount(),
			paymentQueue.getFailedCount(),
			paymentQueue.getDelayedCount(),
			paymentQueue.getRepeatableJobs(),
		]);

		res.status(200).json({
			success: true,
			data: {
				waiting,
				active,
				completed,
				failed,
				delayed,
				repeatableJobs: repeatable.map(job => ({
					name: job.name,
					pattern: job.pattern,
					nextRun: job.next,
					key: job.key,
				})),
			},
		});
	} catch (err) {
		next(err);
	}
};
