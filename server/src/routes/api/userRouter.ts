/**
 * User management routes configuration.
 *
 * This module defines routes for user profile management and other
 * user-related operations. It includes validation and authentication
 * middleware to ensure secure access to user data.
 */

import { Router } from "express";
import * as userController from "@controllers/userController";
import { errorHandler } from "@middlewares/errorHandler";
import {
	changeEmailValidation,
	updateProfileValidation,
	validateUserIdParam,
	verifyEmailValidation,
} from "@middlewares/validators/userValidator";
import { handleValidationResult } from "@middlewares/validateRequest";
import {
	csrfAdminProtectionRoute,
	csrfUserProtectionRoute,
} from "@middlewares/csrf";
import { createUploadMiddleware } from "@middlewares/upload";

/**
 * User management router instance.
 *
 * Handles user-related operations such as profile updates and user data retrieval.
 */
const userRouter = Router();
const avatarUpload = createUploadMiddleware("avatars");

// PUT /users/profile/:id - Update authenticated user's profile
userRouter.put(
	"/profile/:id",
	avatarUpload.single("avatar"),
	csrfUserProtectionRoute,
	updateProfileValidation,
	handleValidationResult,
	userController.UpdateProfile,
	errorHandler
);

// GET /users/profile - Get user profile
userRouter.get(
	"/profile/:id",
	csrfUserProtectionRoute,
	userController.GetProfile,
	errorHandler
);

// POST /profile/verify-email/:id - Request email verification from Profile
userRouter.post(
	"/profile/verify-email/:id",
	csrfUserProtectionRoute,
	verifyEmailValidation,
	handleValidationResult,
	userController.SendVerificationEmail,
	errorHandler
);

// POST /profile/verify-email/:id - Request email verification from Profile
userRouter.post(
	"/profile/change-email/:id",
	csrfUserProtectionRoute,
	changeEmailValidation,
	handleValidationResult,
	userController.ChangeEmail,
	errorHandler
);

// POST /users/websocket-token/:id - Get WebSocket auth token
userRouter.post(
	"/websocket-token/:id",
	csrfUserProtectionRoute,
	validateUserIdParam,
	handleValidationResult,
	userController.GetWebsocketToken,
	errorHandler
);

// GET /users - Get all users (Admin only)
userRouter.get(
	"/",
	csrfAdminProtectionRoute,
	userController.GetAllUsers,
	errorHandler
);

// PUT /users/:id - Update user by ID
userRouter.put(
	"/:id",
	csrfAdminProtectionRoute,
	validateUserIdParam,
	handleValidationResult,
	userController.UpdateUser,
	errorHandler
);

// DELETE /users/profile/:id - Delete user by ID (User only)
userRouter.delete(
	"/profile/:id",
	csrfUserProtectionRoute,
	validateUserIdParam,
	handleValidationResult,
	userController.DeleteUser,
	errorHandler
);

// DELETE /users/admin/:id - Delete user by ID (Admin only)
userRouter.delete(
	"/:id",
	csrfAdminProtectionRoute,
	validateUserIdParam,
	handleValidationResult,
	userController.DeleteUserAdmin,
	errorHandler
);

export default userRouter;
