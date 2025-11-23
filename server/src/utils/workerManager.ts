import logger from "@utils/logger";
import emailWorker from "@utils/workers/emailWorker";
import paymentWorker from "@utils/workers/paymentWorker";
import ticketWorker from "@utils/workers/ticketWorker";
import tripSchedulingWorker from "@utils/workers/tripSchedulingWorker";
import notificationWorker from "@utils/workers/notificationWorker";

/**
 * Initializes all background workers and schedules recurring maintenance jobs.
 *
 * Workers:
 * - Email Worker
 * - Ticket Worker
 * - Trip Scheduling Worker
 * - Payment Worker
 * - Refresh Token Cleanup Worker
 *
 * Scheduling:
 * - Payment cleanup (via payment queue's built-in scheduler)
 * - Refresh token cleanup (enqueue initial job and optional interval)
 */
export const initializeWorkersAndSchedules = async (): Promise<void> => {
	// Dynamically import workers to avoid circular imports at server startup
	const emailWorker = await import("@utils/workers/emailWorker");
	const ticketWorker = await import("@utils/workers/ticketWorker");
	const tripSchedulingWorker = await import(
		"@utils/workers/tripSchedulingWorker"
	);
	const paymentWorker = await import("@utils/workers/paymentWorker");
	const refreshTokenWorker = await import(
		"@utils/workers/refreshTokenWorker"
	);

	// Wait until all workers are connected and ready to process jobs
	await emailWorker.default.waitUntilReady();
	logger.info("✓ Email worker ready");

	await ticketWorker.default.waitUntilReady();
	logger.info("✓ Ticket worker ready");

	await tripSchedulingWorker.default.waitUntilReady();
	logger.info("✓ Trip scheduling worker ready");

	await paymentWorker.default.waitUntilReady();
	logger.info("✓ Payment worker ready");

	await refreshTokenWorker.default.waitUntilReady();
	logger.info("✓ Refresh token cleanup worker ready");

	// Schedule recurring payment cleanup (provided by payment queue utilities)
	try {
		const { scheduleRecurringCleanup, addCleanupJob } = await import(
			"@utils/queues/paymentQueue"
		);

		// Start daily recurring cleanup (implementation resides in the payment queue module)
		await scheduleRecurringCleanup({ batchSize: 100, dryRun: false });
		logger.info("✓ Scheduled recurring payment cleanup job");

		// Optionally enqueue a one-off test cleanup job with small batch size
		await addCleanupJob({ batchSize: 10, dryRun: true }, { delay: 30000 });
		logger.info("✓ Enqueued one-off payment cleanup test job");
	} catch (err) {
		logger.error(
			`✗ Failed to schedule payment cleanup: ${(err as Error).message}`
		);
	}

	// Enqueue ticket cleanup jobs
	try {
		const { addCleanupJob: addTicketCleanupJob } = await import(
			"@utils/queues/ticketQueue"
		);

		// Enqueue an immediate ticket cleanup job at startup
		await addTicketCleanupJob(
			{ batchSize: 100, dryRun: false },
			{ delay: 0 }
		);
		logger.info("✓ Enqueued initial ticket cleanup job");

		// Schedule periodic ticket cleanup using interval (configurable)
		const t_minutes = Number(process.env.TICKET_CLEANUP_INTERVAL_MIN || 30);
		const t_interval_ms = Math.max(1, t_minutes) * 60 * 1000;

		setInterval(async () => {
			try {
				await addTicketCleanupJob(
					{ batchSize: 100, dryRun: false },
					{ delay: 0 }
				);
				logger.info("→ Periodic ticket cleanup job enqueued");
			} catch (e) {
				logger.error(
					`✗ Failed to enqueue periodic ticket cleanup: ${
						(e as Error).message
					}`
				);
			}
		}, t_interval_ms);

		logger.info(
			`✓ Scheduled periodic ticket cleanup every ${t_minutes} minute(s)`
		);
	} catch (err) {
		logger.error(
			`✗ Failed to schedule ticket cleanup: ${(err as Error).message}`
		);
	}

	// Enqueue refresh token cleanup jobs
	try {
		const { addCleanupJob: addRefreshCleanupJob } = await import(
			"@utils/queues/refreshTokenQueue"
		);

		// Enqueue an immediate cleanup job to ensure initial maintenance at startup
		await addRefreshCleanupJob();
		logger.info("✓ Enqueued initial refresh token cleanup job");

		// Optionally schedule a periodic cleanup using a simple interval.
		// For production-grade scheduling, prefer BullMQ repeatable jobs or your existing cron scheduler.
		const minutes = Number(
			process.env.REFRESH_TOKEN_CLEANUP_INTERVAL_MIN || 15
		);
		const interval_ms = Math.max(1, minutes) * 60 * 1000;

		setInterval(async () => {
			try {
				await addRefreshCleanupJob();
				logger.info("→ Periodic refresh token cleanup job enqueued");
			} catch (e) {
				logger.error(
					`✗ Failed to enqueue periodic refresh cleanup: ${
						(e as Error).message
					}`
				);
			}
		}, interval_ms);

		logger.info(
			`✓ Scheduled periodic refresh token cleanup every ${minutes} minute(s)`
		);
	} catch (err) {
		logger.error(
			`✗ Failed to schedule refresh token cleanup: ${
				(err as Error).message
			}`
		);
	}
};

/**
 * Gracefully closes all background workers.
 */
export const closeAllWorkers = async () => {
	logger.info("Closing background workers...");

	try {
		await Promise.all([
			emailWorker.close(),
			ticketWorker.close(),
			tripSchedulingWorker.close(),
			paymentWorker.close(),
			notificationWorker.close(),
		]);
		logger.info("All workers closed successfully");
	} catch (err) {
		logger.error("Error closing workers:", err);
		throw err;
	}
};
