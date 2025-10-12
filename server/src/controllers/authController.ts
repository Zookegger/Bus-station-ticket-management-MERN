import { Request, Response, NextFunction } from "express";
import * as authServices from "@services/authServices";
import { verifyEmail } from "@services/verificationServices";

/**
 * Registers a new user account.
 * @route POST /auth/register
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
 * @route POST /auth/login
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
 * @route POST /auth/refresh
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
 * @route POST /auth/logout
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
 * Revokes a refresh token on logout.
 * @route POST /auth/logout
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
