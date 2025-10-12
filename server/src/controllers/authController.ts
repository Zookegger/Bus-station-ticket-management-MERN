import { Request, Response, NextFunction } from "express";
import * as authServices from "@services/authServices";
import { verifyEmail } from "@services/verificationServices";

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
		const { username, email, password, confirmPassword } = req.body;
		const result = await authServices.register({
			username,
			email,
			password,
			confirmPassword,
		});

		if (!result) {
			throw new Error("Something went wrong while creating new account");
		}

		res.status(201).json(result);
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

		res.json(result);
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
		const { refreshToken } = req.body;
		const result = await authServices.refreshAccessToken(refreshToken);
		if (!result) {
			throw new Error(
				"Something went wrong while refreshing access token"
			);
		}

		res.json(result);
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
		const { refreshToken } = req.body;
		await authServices.revokeRefreshToken(refreshToken);
		res.status(204).send();
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

		const result = (await verifyEmail(token))
			? { status: 200, message: "Email verified successfully! You can now log in.", }
			: { status: 500, message: "Email verified failed." };
	
		res.status(result.status).json(result.message)
		} catch (err) {
		next(err);
	}
};
