import { Worker, Job } from "bullmq";
import redis from "@config/redis";
import { RefreshTokenCleanupJobData } from "@utils/queues/refreshTokenQueue";
import logger from "@utils/logger";
import db from "@models/index";
import { Op } from "sequelize";

const refreshTokenWorker = new Worker<RefreshTokenCleanupJobData>(
	"refresh-token-cleanup",
	/**
	 * Processes a single refresh token cleanup job.
	 *
	 * @param job - The BullMQ job containing cleanup instructions (currently unused).
	 */
	async (job: Job<RefreshTokenCleanupJobData>): Promise<void> => {
		logger.debug(
			`[RefreshTokenCleanup] Starting cleanup job (id=${job.id}).`
		);

		let total_deleted = 0;

		// Loop until there are no more expired tokens to delete
		// This makes the job safe to run even if there are many old records.
		while (true) {
			const transaction = await db.sequelize.transaction();
			try {
				// Find a batch of expired tokens
				const expired_tokens = await db.RefreshToken.findAll({
					where: { expiresAt: { [Op.lt]: new Date() } }, // Expired at < Now
				});

				// If there are none, break loop
				if (expired_tokens.length === 0) {
					await transaction.commit();
					break;
				}

				// Delete batch
				const ids_to_delete = expired_tokens.map((token) => token.id);

				const deleted_count = await db.RefreshToken.destroy({
					where: { id: ids_to_delete },
					transaction,
				});

				total_deleted += deleted_count;
				await transaction.commit();
			} catch (err) {
				await transaction.rollback();
				logger.error(`[RefreshTokenCleanup] Error during cleanup batch: ${(err as Error).message}`);
			}
		}
		logger.info(`[RefreshTokenCleanup] Cleanup job (id=${job.id}) completed. Deleted ${total_deleted} expired refresh tokens.`);
	},
	{ connection: redis, concurrency: 5 }
);

refreshTokenWorker.on("completed", (job) => {
	logger.info(`Job ${job.id} completed`);
});

refreshTokenWorker.on("failed", (job, err) => {
	logger.info(`Job ${job?.id} failed:`, err);
});

export default refreshTokenWorker;