/**
 * Authentication routes configuration.
 *
 * This module defines all routes related to user authentication including
 * login, registration, and other auth-related endpoints. It applies
 * validation middleware and error handling to ensure secure and reliable
 * authentication flows.
 */

import { Router } from "express";
import { errorHandler } from "@middlewares/errorHandler";
import * as authValidator from "@middlewares/validators/authValidator";
import * as authController from "@controllers/authController";
import { handleValidationResult } from "@middlewares/validateRequest";
import { authenticateJwt } from "@middlewares/auth";
import { authRateLimiter } from "@middlewares/rateLimiter";
import { csrfUserProtectionRoute } from "@middlewares/csrf";

/**
 * Authentication router instance.
 *
 * Handles all authentication-related HTTP requests with proper validation
 * and error handling middleware applied to each route.
 */
const authRouter = Router();

// CSRF token endpoint
authRouter.get(
	"/csrf-token",
	authRateLimiter,
	csrfUserProtectionRoute,
	authValidator.getCsrfTokenValidator,
	authController.GetCsrfToken,
	errorHandler,
);

authRouter.post(
	"/csrf-token",
	authRateLimiter,
	csrfUserProtectionRoute,
	authController.VerifyCsrfToken,
	errorHandler,
);

authRouter.post(
	"/refresh",
	authRateLimiter,
	csrfUserProtectionRoute,
	authController.RefreshToken,
	errorHandler,
);

/**
 * POST /auth/login
 * Authenticates user credentials and issues access/refresh tokens.
 */
authRouter.post(
	"/login",
	authRateLimiter,
	authValidator.loginValidation,
	handleValidationResult,
	authController.Login,
	errorHandler,
);

/**
 * POST /auth/register
 * Creates a new user account and sends verification email.
 */
authRouter.post(
	"/register",
	authRateLimiter,
	authValidator.registerValidation,
	handleValidationResult,
	authController.Register,
	errorHandler,
);

/**
 * POST /auth/logout
 * Revokes the refresh token to log out the current session.
 */
authRouter.post(
	"/logout",
	authRateLimiter,
	csrfUserProtectionRoute,
	authValidator.logoutValidation,
	handleValidationResult,
	authController.Logout,
	errorHandler,
);

/**
 * GET /auth/me
 * Retrieves the authenticated user's profile information.
 */
authRouter.get(
	"/me",
	authRateLimiter,
	csrfUserProtectionRoute,
	authenticateJwt,
	authController.GetMe,
	errorHandler,
);

/**
 * POST /auth/verify-email
 * Verifies the user's email address using a token.
 */
authRouter.post(
	"/verify-email",
	authRateLimiter,
	csrfUserProtectionRoute,
	authController.VerifyEmail,
	errorHandler,
);

/**
 * POST /auth/change-password
 * Changes the user's password inside their profile.
 */
authRouter.post(
	"/change-password/:id",
	authRateLimiter,
	csrfUserProtectionRoute,
	authValidator.changePasswordValidation,
	authController.ChangePassword,
	errorHandler,
);

/**
 * POST /auth/forgot-password
 * Initiates the password reset process by sending a reset link to the user's email.
 */
authRouter.post(
	"/forgot-password",
	authRateLimiter,
	authValidator.forgotPasswordValidation,
	handleValidationResult,
	authController.ForgotPassword,
	errorHandler,
);

/**
 * POST /auth/reset-password/:token
 * Resets the user's password using a valid reset token.
 */
authRouter.post(
	"/reset-password/:token",
	authRateLimiter,
	authValidator.resetPasswordValidation,
	handleValidationResult,
	authController.ResetPassword,
	errorHandler,
);

export default authRouter;