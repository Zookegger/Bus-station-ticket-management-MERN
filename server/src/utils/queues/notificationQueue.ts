import { Queue } from "bullmq";
import redis from "@config/redis";
import { BroadcastNotificationDTO } from "@my_types/notifications";

/**
 * Payload structure for the broadcast job.
 */
export interface BroadcastJobPayload {
	userIds: string[];
	notificationData: Omit<BroadcastNotificationDTO, "filter">;
}

/**
 * Notification queue instance.
 * Handles background processing for heavy notification tasks like broadcasting.
 */
export const notificationQueue = new Queue<BroadcastJobPayload>(
	"notification-queue",
	{
		connection: redis,
		defaultJobOptions: {
			attempts: 3,
			backoff: {
				type: "exponential",
				delay: 1000, // 1s delay
			},
			removeOnComplete: {
				count: 100,
				age: 24 * 3600, // Lives only for a day
			},
			removeOnFail: {
				count: 1000,
			},
		},
	}
);