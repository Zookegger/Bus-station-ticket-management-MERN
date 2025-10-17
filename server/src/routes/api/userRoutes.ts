/**
 * User management routes configuration.
 *
 * This module defines routes for user profile management and other
 * user-related operations. It includes validation and authentication
 * middleware to ensure secure access to user data.
 */

import { Router } from "express";
import { updateProfile } from "@controllers/userController";
import { errorHandler } from "@middlewares/errorHandler";
import { userInfoValidation, updateProfileValidation } from "@middlewares/validators/userValidator";
import { loginValidation, registerValidation } from "@middlewares/validators/authValidator";
import { handleValidationResult } from "@middlewares/validateRequest";

/**
 * User management router instance.
 *
 * Handles user-related operations such as profile updates and user data retrieval.
 */
const userRoutes = Router();

// POST /users/update-profile - Update authenticated user's profile
userRoutes.post("/update-profile", updateProfileValidation, handleValidationResult, updateProfile, errorHandler);

// GET /users/ - Health check endpoint for user routes
userRoutes.get("/", (req, res) => {
	res.json("It's working");
});

export default userRoutes;
