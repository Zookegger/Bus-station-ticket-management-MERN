/**
 * Authentication routes configuration.
 *
 * This module defines all routes related to user authentication including
 * login, registration, and other auth-related endpoints. It applies
 * validation middleware and error handling to ensure secure and reliable
 * authentication flows.
 */

import { Router } from "express";
import { errorHandler } from "../../middlewares/errorHandler";
import { loginValidation, registerValidation } from "../../validators/authValidator";
import { login, register } from "../../controllers/authController";
import { handleValidationResult } from "../../middlewares/validateRequest";

/**
 * Authentication router instance.
 *
 * Handles all authentication-related HTTP requests with proper validation
 * and error handling middleware applied to each route.
 */
const authRoutes = Router();

// POST /auth/login - Authenticate user credentials
authRoutes.post("/login", loginValidation, handleValidationResult, login, errorHandler);

// POST /auth/register - Create new user account
authRoutes.post("/register", registerValidation, handleValidationResult, register, errorHandler);

export default authRoutes;