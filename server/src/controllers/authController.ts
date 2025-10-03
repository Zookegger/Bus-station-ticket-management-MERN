import { Request, Response, NextFunction } from "express";
import * as authServices from "../services/authServices";

/**
 * Registers a new user account.
 * @route POST /auth/register
 */
export const register = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
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
export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
  try {
    const { login, password } = req.body;
    const result = await authServices.login({
      username: login,
      password,
    });		if (!result) {
			throw new Error("Invalid credentials"); // More specific error than "creating new account"
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
export const refresh = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
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
export const logout = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { refreshToken } = req.body;
		await authServices.revokeRefreshToken(refreshToken);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
};
