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
import { updateProfileValidation, validateUserIdParam } from "@middlewares/validators/userValidator";
import { handleValidationResult } from "@middlewares/validateRequest";
import { csrfAdminProtectionRoute, csrfUserProtectionRoute } from "@middlewares/csrf";

/**
 * User management router instance.
 *
 * Handles user-related operations such as profile updates and user data retrieval.
 */
const userRouter = Router();

// PUT /users/profile - Update authenticated user's profile
userRouter.put("/profile/:id", csrfUserProtectionRoute, updateProfileValidation, handleValidationResult, userController.UpdateProfile, errorHandler);

// GET /users/profile - Get user profile
userRouter.get("/profile/:id", csrfUserProtectionRoute, userController.GetProfile, errorHandler);

// GET /users - Get all users (Admin only)
userRouter.get("/", csrfAdminProtectionRoute, userController.GetAllUsers, errorHandler);

// PUT /users/:id - Update user by ID
userRouter.put("/:id", csrfAdminProtectionRoute, validateUserIdParam, handleValidationResult, userController.UpdateUser, errorHandler);

// DELETE /users/:id - Delete user by ID (Admin only)
userRouter.delete("/:id", csrfAdminProtectionRoute, validateUserIdParam, handleValidationResult, userController.DeleteUser, errorHandler);

export default userRouter;
