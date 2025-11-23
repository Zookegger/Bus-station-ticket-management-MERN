import db from "@models/index";
import { Notification } from "@models/notification";
import {
	BroadcastNotificationDTO,
	CreateNotificationDTO,
	NotificationQueryOptions,
	NotificationStatuses,
	PaginatedNotifications,
} from "@my_types/notifications";
import { notificationQueue } from "@utils/queues/notificationQueue";
import { WhereOptions } from "sequelize";

/**
 * Creates a single notification for a specific user.
 * * @param {CreateNotificationDTO} data - The notification data.
 * @returns {Promise<Notification>} The created notification.
 */
export const createNotification = async (
	data: CreateNotificationDTO
): Promise<Notification> => {
	const notification = await db.Notification.create({
		userId: data.userId,
		title: data.title,
		content: data.content,
		type: data.type,
		priority: data.priority,
		metadata: data.metadata ?? {},
		status: NotificationStatuses.UNREAD,
	});

	if (!notification)
		throw { status: 500, message: "Failed to create new notification" };

	return notification;
};

/**
 * Retrieves a paginated list of notifications for a user.
 * Sorted by creation date descending (newest first).
 * * @param {string} userId - The ID of the user.
 * @param {NotificationQueryOptions} options - Pagination and filtering options.
 * @returns {Promise<PaginatedNotifications>} Paginated result.
 */
export const getUserNotifications = async (
	userId: string,
	options: NotificationQueryOptions
): Promise<PaginatedNotifications> => {
	const page = Math.max(1, options.page || 1);
	const limit = Math.max(1, options.per_page || 10);
	const offset = (page - 1) * limit;

	const whereClause: WhereOptions = { userId };

	if (options.status) {
		whereClause.status = options.status;
	}

	const { rows, count } = await Notification.findAndCountAll({
		where: whereClause,
		limit,
		offset,
		order: [["createdAt", "DESC"]],
	});

	return {
		data: rows,
		pagination: {
			total: count,
			currentPage: page,
			totalPages: Math.ceil(count / limit),
			perPage: limit,
		},
	};
};

/**
 * Retrieves a specific notification by ID, ensuring it belongs to the user.
 * * @param {string} userId - The ID of the user.
 * @param {number} id - The notification ID.
 * @returns {Promise<Notification | null>} The notification or null.
 */
export const getNotificationById = async (
	id: number,
	userId: string
): Promise<Notification | null> => {
	return await db.Notification.findOne({ where: { id, userId } });
};

/**
 * Marks a specific notification as read.
 * @param {string} userId - The ID of the user.
 * @param {number} id - The notification ID.
 * @returns {Promise<Notification>} The updated notification.
 * @throws {Error} If notification is not found.
 */
export const markAsRead = async (
	userId: string,
	id: number
): Promise<Notification> => {
	const notification = await db.Notification.findOne({
		where: { userId, id },
	});

	if (!notification)
		throw { status: 404, message: "Notification not found." };

	if (notification.status !== NotificationStatuses.READ)
		await notification.update({
			status: NotificationStatuses.READ,
			readAt: new Date(),
		});

	return notification;
};

/**
 * Marks all unread notifications for a user as read.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<number>} The number of updated notifications.
 */
export const markAllRead = async (userId: string): Promise<number> => {
	const [updatedCount] = await db.Notification.update(
		{
			status: NotificationStatuses.READ,
			readAt: new Date(),
		},
		{
			where: {
				userId,
				status: NotificationStatuses.UNREAD,
			},
		}
	);

	return updatedCount;
};

/**
 * Deletes a notification.
 * @param {string} userId - The ID of the user.
 * @param {number} id - The notification ID.
 * @returns {Promise<boolean>} True if deleted, false otherwise.
 */
export const deleteNotification = async (
	userId: string,
	id: number
): Promise<boolean> => {
	const deletedCount = await db.Notification.destroy({
		where: { id, userId },
	});

	return deletedCount > 0;
};

/**
 * Helper to split array into chunks
 */
const chunkArray = <T>(array: T[], size: number): T[][] => {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
};

/**
 * Broadcasts a notification to multiple users based on a filter.
 * For large datasets, this should delegate to a message queue.
 * @param {BroadcastNotificationDTO} data - The broadcast details.
 * @returns {Promise<{ message: string; count?: number }>} Result summary.
 */
export const broadcastNotification = async (
	data: BroadcastNotificationDTO
): Promise<{ message: string; count?: number }> => {
	// 1. Build the user filter
	const userFilter: WhereOptions = {};
	if (data.filter?.role) {
		userFilter.role = data.filter.role;
	}

	// 2. Fetch target user IDs
	const users = await db.User.findAll({
		where: userFilter,
		attributes: ["id"],
		raw: true,
	});

	if (!users || users.length === 0) {
		return { message: "No users matched the broadcast filter." };
	}

	// Tune this threshold based on memory / DB limits / infra
	const THRESHOLD_FOR_QUEUE = 100;
	// Map to simple array of IDs
	const user_ids = users.map((u: any) => u.id);

	// small broadcast: create notifications directly
	if (user_ids.length <= THRESHOLD_FOR_QUEUE) {
		const notificationsToCreate = user_ids.map((uid: string) => ({
			userId: uid,
			title: data.title,
			content: data.content,
			type: data.type,
			priority: data.priority,
			metadata: data.metadata ?? {},
			status: NotificationStatuses.UNREAD,
		}));

		await db.Notification.bulkCreate(notificationsToCreate);

		return {
			message: "Broadcast sent successfully.",
			count: user_ids.length,
		};
	}

	// large broadcast: enqueue background jobs
	// 1) split user_ids into chunks (e.g., 200)
	// 2) for each chunk add job to notifications:broadcast queue with { chunk, data }
	// 3) worker processes each job: bulkCreate notifications + emit sockets
	const BATCH_SIZE = 500;
	const chunks = chunkArray(user_ids, BATCH_SIZE);

	const jobPromises = chunks.map((chunk) =>
		notificationQueue.add("broadcast-chunk", {
			userIds: chunk,
			notificationData: {
				title: data.title,
				content: data.content,
				type: data.type,
				priority: data.priority,
				metadata: data.metadata ?? {},
			},
		})
	);

	// Wait for all job promises to finish adding
	await Promise.all(jobPromises);

	return {
		message: `Broadcast queued for ${users.length} users across ${chunks.length} jobs.`,
		count: user_ids.length,
	};
};
