import { Request, Response, NextFunction } from "express";
import * as notificationService from "@services/notificationServices";
import { CreateNotificationDTO, NotificationQueryOptions } from "@my_types/notifications";

/**
 * Create a new notification
 */
export const createNotification = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data: CreateNotificationDTO = req.body;
		const notification = await notificationService.createNotification(data);
		res.status(201).json(notification);
	} catch (error) {
		next(error);
	}
};

/**
 * Get notifications for the current user
 */
export const getUserNotifications = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId: string | undefined =
			(req as any).user?.userId ?? (req as any).user?.id;
		if (!userId) {
			res.status(401).json({ message: "Unauthorized" });
			return;
		}

		const options: NotificationQueryOptions = {
			page: req.query.page ? Number(req.query.page) : 1,
			per_page: req.query.per_page ? Number(req.query.per_page) : 10,
			status: req.query.status as any,
		};

		const result = await notificationService.getUserNotifications(userId, options);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId: string | undefined =
			(req as any).user?.userId ?? (req as any).user?.id;
		const notificationId = Number(req.params.id);

		if (!userId) {
			res.status(401).json({ message: "Unauthorized" });
			return;
		}

		const notification = await notificationService.markAsRead(userId, notificationId);
		res.status(200).json(notification);
	} catch (error) {
		next(error);
	}
};

/**
 * Mark all notifications as read for the current user
 */
export const markAllRead = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId: string | undefined =
			(req as any).user?.userId ?? (req as any).user?.id;
		if (!userId) {
			res.status(401).json({ message: "Unauthorized" });
			return;
		}

		const count = await notificationService.markAllRead(userId);
		res.status(200).json({ message: "All notifications marked as read", count });
	} catch (error) {
		next(error);
	}
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId: string | undefined =
			(req as any).user?.userId ?? (req as any).user?.id;
		const notificationId = Number(req.params.id);

		if (!userId) {
			res.status(401).json({ message: "Unauthorized" });
			return;
		}

		const success = await notificationService.deleteNotification(userId, notificationId);
		if (success) {
			res.status(200).json({ message: "Notification deleted successfully" });
		} else {
			res.status(404).json({ message: "Notification not found" });
		}
	} catch (error) {
		next(error);
	}
};
