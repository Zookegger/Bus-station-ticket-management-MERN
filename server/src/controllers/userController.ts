import { Request, Response, NextFunction } from "express";
import * as userServices from "../services/userServices";

export const register = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { username, email, password, confirmPassword } = req.body;
		const result = await userServices.register({
			username,
			email,
			password,
			confirmPassword
		});

		if (!result) {
			throw new Error("Something went wrong while creating new account");
		}

		res.status(201).json(result);
	} catch (err) {
		next(err);
	}
};

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { username, password } = req.body;
		const result = await userServices.login({
			username,
			password,
		});

		if (!result) {
			throw new Error("Something went wrong while creating new account");
		}

		res.json(result);
	} catch (err) {
		next(err);
	}
};

export const refresh = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { refreshToken } = req.body;
		const result = userServices.refreshAccessToken(refreshToken);
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

export const logout = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { refreshToken } = req.body;
		await userServices.revokeRefreshToken(refreshToken);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
};

export const updateProfile = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		
		const userId = (req as any).user.userId;
		const { fullName, address, gender, avatar, dateOfBirth } = req.body;

		await userServices.updateUserProfile( userId, {
			fullName,
			address,
			gender,
			avatar,
			dateOfBirth,
		});

		res.status(201).send();
	} catch (err) {
		next(err);
	}
}