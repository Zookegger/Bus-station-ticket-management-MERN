import { Router } from "express";
import * as notificationController from "@controllers/notificationController";
import { csrfUserProtectionRoute } from "@middlewares/csrf";
import { errorHandler } from "@middlewares/errorHandler";
import { handleValidationResult } from "@middlewares/validateRequest";
import * as notificationValidators from "@middlewares/validators/notificationValidators";

const notificationRouter = Router();

// GET /notifications - Get user notifications
notificationRouter.get(
	"/",
	csrfUserProtectionRoute,
	notificationValidators.getUserNotificationsValidation,
	handleValidationResult,
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
	notificationValidators.markAsReadValidation,
	handleValidationResult,
	notificationController.markAsRead,
	errorHandler
);

// DELETE /notifications/:id - Delete a notification
notificationRouter.delete(
	"/:id",
	csrfUserProtectionRoute,
	notificationValidators.deleteNotificationValidation,
	handleValidationResult,
	notificationController.deleteNotification,
	errorHandler
);

export default notificationRouter;
