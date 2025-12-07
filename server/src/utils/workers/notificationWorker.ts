import { Worker, Job } from "bullmq";
import redis from "@config/redis";
import { Notification } from "@models/notification";
import { NotificationStatuses } from "@my_types/notifications";
import logger from "@utils/logger";
import type { BroadcastJobPayload } from "@utils/queues/notificationQueue";

/**
 * Notification worker.
 * Processes bulk notification creation jobs.
 */
const notificationWorker = new Worker<BroadcastJobPayload>(
	"notification",
	async (job: Job<BroadcastJobPayload>) => {
		const { userIds, notificationData } = job.data;

		logger.info(
			`Processing broadcast job ${job.id} for ${userIds.length} users.`
		);

		if (!userIds || userIds.length === 0) {
			return;
		}

		try {
			// Map user IDs to notification objects
			const notifications = userIds.map((userId) => ({
				userId,
				title: notificationData.title,
				content: notificationData.content,
				type: notificationData.type,
				priority: notificationData.priority,
				metadata: notificationData.metadata ?? {},
				status: NotificationStatuses.UNREAD,
			}));

			// Bulk insert into database
			await Notification.bulkCreate(notifications, { validate: true });

			logger.info(
				`Successfully created ${notifications.length} notifications for job ${job.id}`
			);
		} catch (error) {
			logger.error(`Notification Worker Error (Job ${job.id}):`, error);
			throw error;
		}
	},
	{
		connection: redis,
		concurrency: 5, // Adjust based on DB load capacity
	}
);

// Monitoring events
notificationWorker.on("completed", (job) => {
	logger.info(`Notification job ${job.id} completed`);
});

notificationWorker.on("failed", (job, err) => {
	logger.error(`Notification job ${job?.id} failed:`, err);
});

export default notificationWorker;
