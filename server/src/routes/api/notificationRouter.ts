import { Router } from "express";
import * as notificationController from "@controllers/notificationController";
import { csrfUserProtectionRoute } from "@middlewares/csrf";
import { errorHandler } from "@middlewares/errorHandler";

const notificationRouter = Router();

// GET /notifications - Get user notifications
notificationRouter.get(
	"/",
	csrfUserProtectionRoute,
	notificationController.getUserNotifications,
	errorHandler
);

// PUT /notifications/read-all - Mark all notifications as read
notificationRouter.put(
	"/read-all",
	csrfUserProtectionRoute,
	notificationController.markAllRead,
	errorHandler
);

// PUT /notifications/:id/read - Mark a specific notification as read
notificationRouter.put(
	"/:id/read",
	csrfUserProtectionRoute,
	notificationController.markAsRead,
	errorHandler
);

// DELETE /notifications/:id - Delete a notification
notificationRouter.delete(
	"/:id",
	csrfUserProtectionRoute,
	notificationController.deleteNotification,
	errorHandler
);

export default notificationRouter;
