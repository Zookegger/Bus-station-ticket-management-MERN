
import { Request, Response, NextFunction } from "express";
import * as userServices from "@services/userServices";
import { getParamStringId } from "@utils/request";
import { UserAttributes } from "@models/user";
import { emitCrudChange } from "@services/realtimeEvents";

/**
 * Lists all users (Admin only).
 */
export const ListUsers = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { rows } = await userServices.listUsers();
		res.status(200).json(rows);
	} catch (err) {
		next(err);
	}
};

/**
 * Creates a new user (Admin only).
 */
export const CreateUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const payload: Partial<UserAttributes> & { password?: string } =
			req.body;
		const created = await userServices.addUser(payload);

		const user = (req as any).user;
		emitCrudChange(
			"user",
			"create",
			created,
			user ? { id: user.id, name: user.userName } : undefined
		);

		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
};

/**
 * Updates a user by ID (Admin only).
 */
export const UpdateUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const targetUserId = getParamStringId(req);
		const updateData: Partial<UserAttributes> = req.body;
		const user = await userServices.updateUser(targetUserId, updateData);
		if (!user) throw { status: 500, message: "Failed to update user" };

		const actor = (req as any).user;
		emitCrudChange(
			"user",
			"update",
			user,
			actor ? { id: actor.id, name: actor.userName } : undefined
		);

		res.status(200).json(user);
	} catch (err) {
		next(err);
	}
};

/**
 * Deletes a user by ID (Admin only).
 */
export const DeleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const targetUserId = getParamStringId(req);
		await userServices.deleteUser(targetUserId);

		const actor = (req as any).user;
		emitCrudChange(
			"user",
			"delete",
			{ id: targetUserId },
			actor ? { id: actor.id, name: actor.userName } : undefined
		);

		res.status(200).json({ success: true, message: "User deleted" });
	} catch (err) {
		next(err);
	}
};

