import { Request, Response, NextFunction } from "express";
import * as authServices from "@services/authServices";
import * as verificationServices from "@services/verificationServices";
import { ChangePasswordDTO, ResetPasswordDTO } from "@my_types/user";
import { getCsrfToken, isValidCsrfToken } from "@middlewares/csrf";
import { CONFIG, COMPUTED } from "@constants";

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
	next: NextFunction
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
			throw new Error("Something went wrong while creating new account");
		}

		// Set tokens as httpOnly cookies and return minimal user info
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax" as const,
			path: "/",
		};

		// Access token lifetime (ms)
		const accessMaxAge = (CONFIG.JWT_EXPIRY_HOURS || 1) * 60 * 60 * 1000;
		res.cookie("accessToken", result.accessToken, {
			...cookieOptions,
			maxAge: accessMaxAge,
		});

		// Refresh token expiry from computed config
		res.cookie("refreshToken", result.refreshToken, {
			...cookieOptions,
			maxAge: COMPUTED.REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
		});

		res.status(200).json({ user: result.user, message: result.message });
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
	next: NextFunction
): Promise<void> => {
	try {
		const { login, password } = req.body;
		const result = await authServices.login({
			username: login,
			password,
		});

		if (!result) {
			throw new Error("An error has occured while trying to log you in");
		}

		// Set httpOnly cookies and return user info only
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax" as const,
			path: "/",
		};

		const accessMaxAge = (CONFIG.JWT_EXPIRY_HOURS || 1) * 60 * 60 * 1000;
		res.cookie("accessToken", result.accessToken, {
			...cookieOptions,
			maxAge: accessMaxAge,
		});

		res.cookie("refreshToken", result.refreshToken, {
			...cookieOptions,
			maxAge: COMPUTED.REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
		});

		const csrfToken = getCsrfToken(req, res);

		res.cookie("csrfToken", csrfToken, {
			httpOnly: false,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
		});

		res.status(200).json({ user: result.user, message: result.message });
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
export const Refresh = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Prefer token from cookie, fallback to body
		const incomingRefresh =
			(req as any).cookies?.refreshToken || req.body.refreshToken;
		if (!incomingRefresh)
			throw { status: 400, message: "Refresh token is required" };
		const result = await authServices.refreshAccessToken(incomingRefresh);
		if (!result) {
			throw new Error(
				"Something went wrong while refreshing access token"
			);
		}

		setCookieTokens(res, result.accessToken, result.refreshToken.value);

		res.status(200).json({ accessToken: true });
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
	next: NextFunction
): Promise<void> => {
	try {
		// Prefer refresh token from cookie; fallback to body
		const incomingRefresh =
			(req as any).cookies?.refreshToken || req.body.refreshToken;
		if (!incomingRefresh) {
			throw { status: 400, message: "Refresh token is required" };
		}
		const result = await authServices.revokeRefreshToken(incomingRefresh);
		if (result === 0) {
			throw {
				status: 400,
				message: "Invalid or already revoked refresh token",
			};
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

		res.status(200).json({ message: "Logged out successfully" });
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
	next: NextFunction
): Promise<void> => {
	try {
		const userId = (req as any).user?.id;
		if (!userId) throw { status: 401, message: "Unauthorized" };

		const result = await authServices.getMe(userId);
		res.status(200).json(result);
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
	next: NextFunction
): Promise<void> => {
	try {
		const { token } = req.body;

		if (!token) throw { status: 400, message: "Token is required" };

		const result = (await verificationServices.verifyEmail(token))
			? {
					status: 200,
					message: "Email verified successfully! You can now log in.",
			  }
			: { status: 500, message: "Email verified failed." };

		res.status(result.status).json(result.message);
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
	next: NextFunction
): Promise<void> => {
	try {
		const { email } = req.body;

		if (!email) throw { status: 400, message: "Email is required" };

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
	next: NextFunction
): Promise<void> => {
	try {
		// Token taken from forgotPassword's generated token
		const { token } = req.params;

		if (!token)
			throw { status: 400, message: "Invalid reset password token" };

		const payload: ResetPasswordDTO = req.body;

		await authServices.resetPassword(payload);

		res.status(200).json({ message: "Password reset successfully" });
	} catch (err) {
		next(err);
	}
};

export const GetCsrfToken = (
	req: Request,
	res: Response,
	next: NextFunction
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
	next: NextFunction
): void => {
	try {
		const isValid = isValidCsrfToken(req);
		if (!isValid) {
			res.status(403).json({
				isValid: false,
				error: "Invalid CSRF token",
			});
		}
		res.status(200).json({ isValid: true });
	} catch (err) {
		next(err);
	}
};

export const ChangePassword = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { id } = req.params;
		const dto: ChangePasswordDTO = req.body;

		if (id !== dto.userId) throw { status: 403, message: "Unauthorized" };

		if (!dto) throw { status: 400, message: "" };

		await authServices.changePassword(dto);

		res.status(200).json({
			message: "Successfully changed your password.",
		});
	} catch (err) {
		next(err);
	}
};

export const RefreshToken = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const incomingRefresh =
			(req as any).cookie.refreshToken || req.body.refreshToken;

		if (!incomingRefresh)
			throw { status: 400, message: "Refresh token is required" };

		const result = await authServices.refreshAccessToken(incomingRefresh);
		if (!result) throw { status: 500, message: "" };

		setCookieTokens(res, result.accessToken, result.refreshToken.value);
	} catch (err) {
		next(err);
	}
};

const setCookieTokens = (res: Response, accessToken: string, refreshToken: string) => {
	// result.refreshToken may be an object (value/hashed) when rotating
	const newRefreshValue = (refreshToken as any).value || refreshToken;

	if (newRefreshValue) {
		throw { status: 500, message: "Refresh token was not provided"};
	}
	
	if (accessToken) {
		throw { status: 500, message: "Access token was not provided"};
	}

	// Set tokens as httpOnly cookies and return minimal user info
	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		path: "/",
	};

	const accessMaxAge = (CONFIG.JWT_EXPIRY_HOURS || 1) * 60 * 60 * 1000;
	res.cookie("accessToken", accessToken, {
		...cookieOptions,
		maxAge: accessMaxAge,
	});

	res.cookie("refreshToken", newRefreshValue, {
		...cookieOptions,
		maxAge: COMPUTED.REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
	});
};
