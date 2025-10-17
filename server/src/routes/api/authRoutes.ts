/**
 * Authentication routes configuration.
 *
 * This module defines all routes related to user authentication including
 * login, registration, and other auth-related endpoints. It applies
 * validation middleware and error handling to ensure secure and reliable
 * authentication flows.
 */

import { Request, Response, Router } from "express";
import { errorHandler } from "@middlewares/errorHandler";
import * as authValidator from "@middlewares/validators/authValidator";
import * as authController from "@controllers/authController";
import { handleValidationResult } from "@middlewares/validateRequest";
import { getCsrfToken } from "@middlewares/csrf";
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
	windowMs: 5 * 60 * 1000, // 15 minutes
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
    max: 3, // limit each IP to 3 requests per 15 minutes
	message: {
        status: 429,
        error: "Too many verification attempts. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for forgot password
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per 15 minutes
	message: {
        status: 429,
        error: "Too many request. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for forgot password
const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 3 requests per 15 minutes
	message: {
        status: 429,
        error: "Too many request. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// CSRF token endpoint
authRoutes.get("/csrf-token", (req: Request, res: Response): void => {
	const csrfToken = getCsrfToken(req, res);
	res.json({ csrfToken });
});

/**
 * POST /auth/login
 * Authenticates user credentials and issues access/refresh tokens.
 */
authRoutes.post("/login", loginRateLimiter, authValidator.loginValidation, handleValidationResult, authController.Login, errorHandler);

/**
 * POST /auth/register
 * Creates a new user account and sends verification email.
 */
authRoutes.post("/register", authValidator.registerValidation, handleValidationResult, authController.Register, errorHandler);

/**
 * POST /auth/logout
 * Revokes the refresh token to log out the current session.
 */
authRoutes.post("/logout", authValidator.logoutValidation, handleValidationResult, authController.Logout, errorHandler);

/**
 * GET /auth/me
 * Retrieves the authenticated user's profile information.
 */
authRoutes.get("/me", authMeLimiter, authenticateJwt, authController.GetMe, errorHandler);

/**
 * POST /auth/verify-email
 * Verifies the user's email address using a token.
 */
authRoutes.post("/verify-email", verifyEmailLimiter, authController.VerifyEmail, errorHandler);

/**
 * POST /auth/forgot-password
 * Initiates the password reset process by sending a reset link to the user's email.
 */
authRoutes.post("/forgot-password", forgotPasswordLimiter, authValidator.forgotPasswordValidation, handleValidationResult, authController.ForgotPassword, errorHandler);

/**
 * POST /auth/reset-password/:token
 * Resets the user's password using a valid reset token.
 */
authRoutes.post("/reset-password/:token", resetPasswordLimiter, authValidator.resetPasswordValidation, handleValidationResult, authController.ResetPassword, errorHandler);

export default authRoutes;