/**
 * Authentication routes configuration.
 *
 * This module defines all routes related to user authentication including
 * login, registration, and other auth-related endpoints. It applies
 * validation middleware and error handling to ensure secure and reliable
 * authentication flows.
 */

import { Request, Response, Router } from "express";
import { errorHandler } from "../../middlewares/errorHandler";
import { loginValidation, registerValidation } from "../../validators/authValidator";
import * as authController from "../../controllers/authController";
import { handleValidationResult } from "../../middlewares/validateRequest";
import { getCsrfToken } from "../../middlewares/csrf";
import { authenticateJwt } from "@middlewares/auth";
import rateLimit from "express-rate-limit";

/**
 * Authentication router instance.
 *
 * Handles all authentication-related HTTP requests with proper validation
 * and error handling middleware applied to each route.
 */
const authRoutes = Router();

// Rate limiter for login
const loginRateLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, 
	limit: 5,
	message: "Too many login attempts, please try again later."
});

// Rate limiter for auth
const authMeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for email verification
const verifyEmailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 100 requests per windowMs
	message: {
        status: 429,
        error: "Too many verification attempts. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// CSRF token endpoint
authRoutes.get("/csrf-token", (req: Request, res: Response): void => {
	const csrfToken = getCsrfToken(req, res);
	res.json({ csrfToken });
});

// POST /auth/login - Authenticate user credentials
authRoutes.post("/login", loginRateLimiter, loginValidation, handleValidationResult, authController.Login, errorHandler);

// POST /auth/register - Create new user account
authRoutes.post("/register", registerValidation, handleValidationResult, authController.Register, errorHandler);

// POST /auth/logout - Log current user account session out
authRoutes.post("/logout", authController.Logout, errorHandler);

// GET /auth/me - Fetch authenticated user's profile
authRoutes.get("/me", authMeLimiter, authenticateJwt, authController.GetMe, errorHandler);

// POST /auth/verify-email - Verify user's email
authRoutes.post("/verify-email", verifyEmailLimiter, authController.VerifyEmail, errorHandler);

export default authRoutes;