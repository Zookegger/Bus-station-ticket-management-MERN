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
import { userInfoValidation, updateProfileValidation, validateUserIdParam } from "@middlewares/validators/userValidator";
import { loginValidation, registerValidation } from "@middlewares/validators/authValidator";
import { handleValidationResult } from "@middlewares/validateRequest";
import { csrfProtectionRoute } from "@middlewares/csrf";

/**
 * User management router instance.
 *
 * Handles user-related operations such as profile updates and user data retrieval.
 */
const userRoutes = Router();

// POST /users/update-profile - Update authenticated user's profile
userRoutes.post("/update-profile", updateProfileValidation, handleValidationResult, userController.updateProfile, errorHandler);

// GET /users - Get all users (Admin only)
userRoutes.get("/", csrfProtectionRoute, userController.getAllUsers, errorHandler);

// PUT /users/:id - Update user by ID (Admin only)
userRoutes.put("/:id", csrfProtectionRoute, validateUserIdParam, handleValidationResult, userController.updateUser, errorHandler);

// DELETE /users/:id - Delete user by ID (Admin only)
userRoutes.delete("/:id", csrfProtectionRoute, validateUserIdParam, handleValidationResult, userController.deleteUser, errorHandler);

export default userRoutes;
