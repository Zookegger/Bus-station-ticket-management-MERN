import { Request, Response, NextFunction } from "express";
import * as authServices from "@services/authServices";
import * as verificationServices from "@services/verificationServices";
import { ChangePasswordDTO, ResetPasswordDTO } from "@my_types/user";
import { getCsrfToken, isValidCsrfToken } from "@middlewares/csrf";
import { CONFIG, COMPUTED } from "@constants";
import logger from "@utils/logger";
import { encryptToken } from "@utils/encryption";

/**
 * Helper function to set access and refresh tokens in secure, httpOnly cookies.
 */
const setCookieTokens = (
	res: Response,
	accessToken: string,
	refreshToken: string,
) => {
	if (!accessToken) {
		throw { status: 500, message: "Access token was not provided." };
	}
	if (!refreshToken) {
		throw { status: 500, message: "Refresh token was not provided." };
	}

	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		path: "/",
	};

	const accessMaxAge = (CONFIG.JWT_EXPIRY_HOURS || 1) * 60 * 60 * 1000;
	const encryptedSecret = process.env.COOKIE_ENCRYPTION_KEY || "cookie_encryption_key";
	const encryptedAccessToken = encryptToken(accessToken, encryptedSecret);
	
	res.cookie("accessToken", encryptedAccessToken, {
		...cookieOptions,
		maxAge: accessMaxAge,
	});
	
	const encryptedRefreshToken = encryptToken(refreshToken, encryptedSecret);
	res.cookie("refreshToken", encryptedRefreshToken, {
		...cookieOptions,
		maxAge: COMPUTED.REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
	});
};

/**
 * Registers a new user account.
 *
 * Validates input data and creates a new user in the database.
 * Sends a verification email for account activation.
 *
 * @param req - Express request object containing user registration data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /auth/register
 * @access Public
 *
 * @throws {Error} When registration fails or validation errors occur
 */
export const Register = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { username, email, phoneNumber, password, confirmPassword } =
			req.body;
		const result = await authServices.register({
			username,
			email,
			phoneNumber,
			password,
			confirmPassword,
		});

		if (!result) {
			throw {
				status: 500,
				message: "Failed to create a new account due to a server error.",
			};
		}

		setCookieTokens(res, result.accessToken, result.refreshToken);

		// On successful registration, also return a CSRF token for the new session.
		const csrfToken = getCsrfToken(req, res);

		res.status(201).json({
			user: result.user,
			message: result.message,
			csrfToken,
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Authenticates a user and issues access/refresh tokens.
 *
 * Validates user credentials and generates JWT tokens for session management.
 * Returns tokens for client-side storage and API access.
 *
 * @param req - Express request object containing login credentials
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /auth/login
 * @access Public
 *
 * @throws {Error} When authentication fails or credentials are invalid
 */
export const Login = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { login, password } = req.body;
		const result = await authServices.login({
			username: login,
			password,
		});

		if (!result) {
			throw {
				status: 500,
				message: "An unexpected error occurred during login.",
			};
		}

		setCookieTokens(res, result.accessToken, result.refreshToken);

		// Return the public CSRF token in the response body for the client to use.
		const csrfToken = getCsrfToken(req, res);

		res.status(200).json({
			user: result.user,
			message: result.message,
			csrfToken,
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Refreshes an expired access token using a refresh token.
 *
 * Validates the refresh token and issues a new access token pair.
 * Used to maintain user sessions without re-authentication.
 *
 * @param req - Express request object containing refresh token
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /auth/refresh
 * @access Public
 *
 * @throws {Error} When refresh token is invalid or expired
 */
export const RefreshToken = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const incomingRefresh =
			(req as any).cookies?.refreshToken || req.body.refreshToken;

		if (!incomingRefresh) {
			throw { status: 400, message: "Refresh token is required." };
		}

		const result = await authServices.refreshAccessToken(incomingRefresh);
		if (!result) {
			throw {
				status: 500,
				message: "Failed to refresh access token.",
			};
		}

		// The service returns the raw refresh token value, not the object
		setCookieTokens(res, result.accessToken, result.refreshToken.value);

		// Also return a new CSRF token to ensure the client stays in sync
		const csrfToken = getCsrfToken(req, res);

		res.status(200).json({
			message: "Access token refreshed successfully.",
			csrfToken,
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Revokes a refresh token on logout.
 *
 * Invalidates the refresh token to prevent further token refresh.
 * Clears server-side session data for security.
 *
 * @param req - Express request object containing refresh token
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /auth/logout
 * @access Authenticated
 *
 * @throws {Error} When logout fails or token is invalid
 */
export const Logout = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		// Prefer refresh token from cookie; fallback to body
		const incomingRefresh =
			(req as any).cookies?.refreshToken || req.body.refreshToken;
		if (!incomingRefresh) {
			throw { status: 400, message: "Refresh token is required for logout." };
		}
		const result = await authServices.revokeRefreshToken(incomingRefresh);
		if (result === 0) {
			// This can happen if the token is already revoked, which is not a critical error.
			// Proceed to clear cookies anyway.
			logger.warn("Logout attempt with an invalid or already revoked token.");
		}

		// Clear cookies client-side
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax" as const,
			path: "/",
		};
		res.clearCookie("accessToken", cookieOptions as any);
		res.clearCookie("refreshToken", cookieOptions as any);
		// Also clear the CSRF secret cookie
		res.clearCookie("_csrfSecret", cookieOptions as any);

		res.status(200).json({ message: "Logged out successfully." });
	} catch (err) {
		next(err);
	}
};

/**
 * Returns the authenticated user's profile.
 *
 * Retrieves and returns the current user's profile information.
 * Requires valid JWT token for authentication.
 *
 * @param req - Express request object (user ID extracted from JWT)
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route GET /auth/me
 * @access Authenticated
 *
 * @throws {Error} When user not found or authentication fails
 */
export const GetMe = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const userId = (req as any).user?.id;
		if (!userId) {
			throw {
				status: 401,
				message: "Unauthorized: No valid user session found.",
			};
		}

		const user = await authServices.getMe(userId);
		if (!user) {
			throw { status: 404, message: "User profile not found." };
		}

		// Return user profile and a fresh CSRF token
		const csrfToken = getCsrfToken(req, res);
		res.status(200).json({ user, csrfToken });
	} catch (err) {
		next(err);
	}
};

/**
 * Verifies a user's email address.
 *
 * Validates the email verification token and activates the user account.
 * Allows users to complete registration and access the system.
 *
 * @param req - Express request object containing verification token
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /auth/verify-email
 * @access Public
 *
 * @throws {Error} When token is invalid or verification fails
 */
export const VerifyEmail = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { token } = req.body;

		if (!token) {
			throw { status: 400, message: "Verification token is required." };
		}

		const isVerified = await verificationServices.verifyEmail(token);

		if (isVerified) {
			res.status(200).json({
				message: "Email verified successfully! You can now log in.",
			});
		} else {
			throw {
				status: 400,
				message: "Email verification failed. The token may be invalid or expired.",
			};
		}
	} catch (err) {
		next(err);
	}
};

/**
 * Initiates password reset by sending a reset link to the user's email.
 *
 * Validates the email and triggers the forgot password service.
 * Sends a generic response to prevent email enumeration.
 *
 * @param req - Express request object containing email
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /auth/forgot-password
 * @access Public
 *
 * @throws {Error} When email is missing or service fails
 */
export const ForgotPassword = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { email } = req.body;

		if (!email) {
			throw { status: 400, message: "Email is required." };
		}

		await authServices.forgotPassword(email);

		res.status(200).json({
			message:
				"If an account with this email exists, a password reset link has been sent. Please check your inbox and spam folder.",
		});
	} catch (err) {
		next(err);
	}
};

export const ResetPassword = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { token } = req.params;
		if (!token) {
			throw { status: 400, message: "Password reset token is required." };
		}

		const payload: ResetPasswordDTO = req.body;
		if (!payload.newPassword || !payload.newConfirmPassword) {
			throw {
				status: 400,
				message: "New password and confirmation password are required.",
			};
		}

		// The service needs the token to find the correct user/request
		await authServices.resetPassword({ ...payload, token });

		res.status(200).json({ message: "Password has been reset successfully." });
	} catch (err) {
		next(err);
	}
};

export const GetCsrfToken = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	try {
		const csrfToken = getCsrfToken(req, res);
		res.status(200).json({ csrfToken });
	} catch (err) {
		next(err);
	}
};

export const VerifyCsrfToken = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	try {
		const isValid = isValidCsrfToken(req);
		if (!isValid) {
			res.status(403).json({
				isValid: false,
				error: "Invalid CSRF token.",
			});
			return;
		}
		res.status(200).json({ isValid: true });
	} catch (err) {
		next(err);
	}
};

export const ChangePassword = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { id: userIdFromParams } = req.params;
		const authenticatedUserId = (req as any).user?.id;
		const dto: ChangePasswordDTO = req.body;

		// Ensure the authenticated user is changing their own password
		if (
			!authenticatedUserId ||
			authenticatedUserId.toString() !== userIdFromParams
		) {
			throw {
				status: 403,
				message: "Access denied. You can only change your own password.",
			};
		}

		if (!dto.currentPassword || !dto.newPassword || !dto.newConfirmPassword) {
			throw {
				status: 400,
				message: "Current password, new password, and confirmation are required.",
			};
		}

		// The service should handle the logic of verifying the old password
		await authServices.changePassword({ ...dto, userId: authenticatedUserId });

		res.status(200).json({
			message: "Your password has been changed successfully.",
		});
	} catch (err) {
		next(err);
	}
};