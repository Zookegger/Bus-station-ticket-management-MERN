/**
 * User management controller.
 *
 * Handles user-related operations such as profile updates and user data management.
 * All operations require proper authentication and validation middleware.
 */

import { Request, Response, NextFunction } from "express";
import * as userServices from "@services/userServices";
import { UpdateProfileDTO } from "@my_types/user";
import { getParamStringId } from "@utils/request";
import jwt from "jsonwebtoken";

/**
 * Updates the authenticated user's profile information.
 *
 * Processes profile update requests, validates input data, and updates
 * user information in the database. Requires authentication middleware
 * to extract user ID from JWT token.
 *
 * @param req - Express request object containing user profile update data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route PUT /users/update-profile
 * @access Private (requires authentication)
 *
 * @throws {Error} When profile update fails or validation errors occur
 */
export const UpdateProfile = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const authenticatedUserId: string | undefined =
			(req as any).user?.userId ?? (req as any).user?.id;
		if (!authenticatedUserId) {
			throw { status: 401, message: "Unauthorized request" };
		}

		const targetUserId = getParamStringId(req);
		if (authenticatedUserId !== targetUserId) {
			throw { status: 403, message: "Access denied" };
		}

		const newProfile: UpdateProfileDTO = req.body;
		const avatarFile = req.file;

		if (avatarFile) {
			const avatarUrl = `/uploads/avatars/${avatarFile.filename}`;
			newProfile.avatar = avatarUrl;
		}

		const profile = await userServices.getUserById(
			authenticatedUserId,
			"id"
		);
		if (!profile) {
			throw { status: 404, message: "User profile not found" };
		}

		const updated_profile = await userServices.updateUserProfile(
			authenticatedUserId,
			newProfile
		);

		res.status(200).json(updated_profile);
	} catch (err) {
		next(err);
	}
};

/**
 * Updates the authenticated user's profile information.
 *
 * Processes profile update requests, validates input data, and updates
 * user information in the database. Requires authentication middleware
 * to extract user ID from JWT token.
 *
 * @param req - Express request object containing user profile update data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route PUT /users/update-profile
 * @access Private (requires authentication)
 *
 * @throws {Error} When profile update fails or validation errors occur
 */
export const GetProfile = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const authenticatedUserId: string | undefined =
			(req as any).user?.userId ?? (req as any).user?.id;
		if (!authenticatedUserId) {
			throw { status: 401, message: "Unauthorized request" };
		}

		const targetUserId = getParamStringId(req);
		if (authenticatedUserId !== targetUserId) {
			throw { status: 403, message: "Access denied" };
		}

		const profile = await userServices.getUserById(
			authenticatedUserId,
			"firstName",
			"lastName",
			"fullName",
			"email",
			"phoneNumber",
			"address",
			"avatar",
			"address",
			"dateOfBirth",
			"createdAt",
			"updatedAt"
		);
		if (!profile) {
			throw { status: 404, message: "User profile not found" };
		}

		res.status(200).json(profile);
	} catch (err) {
		next(err);
	}
};

/**
 * Retrieves all users (Admin only).
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route GET /users
 * @access Admin
 */
export const GetAllUsers = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const users = await userServices.getAllUsers();
		res.status(200).json({ users });
	} catch (err) {
		next(err);
	}
};

/**
 * Updates a user by ID (Admin only).
 *
 * @param req - Express request object containing user ID and update data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route PUT /users/:id
 * @access Admin
 */
export const UpdateUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const targetUserId = getParamStringId(req);
		const updateData = req.body;
		const user = await userServices.updateUser(targetUserId, updateData);
		if (!user)
			throw {
				status: 500,
				message: "An error has occured while updating user info",
			};
		res.status(200).json(user);
	} catch (err) {
		next(err);
	}
};

/**
 * Deletes a user by ID (Admin only).
 *
 * @param req - Express request object containing user ID
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route DELETE /users/:id
 * @access Admin
 */
export const DeleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const authenticatedUserId: string | undefined =
			(req as any).user?.userId ?? (req as any).user?.id;
		if (!authenticatedUserId) {
			throw { status: 401, message: "Unauthorized request" };
		}

		const targetUserId = getParamStringId(req);
		if (authenticatedUserId !== targetUserId) {
			throw { status: 403, message: "Access denied" };
		}

		await userServices.deleteUser(targetUserId);
		res.status(200).json({ success: true, message: "User deleted successfully" });
	} catch (err) {
		next(err);
	}
};

/**
 * Deletes a user by ID (Admin only).
 *
 * @param req - Express request object containing user ID
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route DELETE /users/:id
 * @access Admin
 */
export const DeleteUserAdmin = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const targetUserId = getParamStringId(req);
		await userServices.deleteUser(targetUserId);
		res.status(200).json({ success: true, message: "User deleted successfully" });
	} catch (err) {
		next(err);
	}
};

export const SendVerificationEmail = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamStringId(req);
		const { email } = req.body;

		const dto: {
			id: string;
			email: string;
		} = { id, email };

		await userServices.verifyEmail(dto);

		res.status(200);
	} catch (err) {
		next(err);
	}
};

export const ChangeEmail = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const authenticatedUserId: string | undefined =
			(req as any).user?.userId ?? (req as any).user?.id;
		if (!authenticatedUserId) {
			throw { status: 401, message: "Unauthorized request" };
		}

		const targetUserId = getParamStringId(req);
		if (authenticatedUserId !== targetUserId) {
			throw { status: 403, message: "Access denied" };
		}
		const { current_email, new_email } = req.body;

		if (current_email === new_email)
			throw {
				status: 400,
				message: "New email must be different from current email",
			};

		const change_email_dto: {
			id: string;
			current_email: string;
			new_email: string;
		} = { id: targetUserId, current_email: current_email, new_email: new_email };

		await userServices.changeEmail(change_email_dto);

		const verify_dto: {
			id: string;
			email: string;
		} = { id: targetUserId, email: new_email };

		await userServices.verifyEmail(verify_dto);

		res.status(200).json({
			message: "Verification email sent to the new address",
		});
	} catch (err) {
		next(err);
	}
};

export const GetWebsocketToken = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const authenticatedUserId: string | undefined =
			(req as any).user?.userId ?? (req as any).user?.id;
		if (!authenticatedUserId) {
			throw { status: 401, message: "Unauthorized request" };
		}

		const targetUserId = getParamStringId(req);
		if (authenticatedUserId !== targetUserId) {
			throw { status: 403, message: "Access denied" };
		}

		// Generate a short-lived token specifically for WebSocket
		// We use the same secret as the main auth because socket.ts uses it
		const token = jwt.sign(
			{ id: authenticatedUserId, type: "websocket" },
			process.env.JWT_SECRET || "dev_secret",
			{ expiresIn: "1m" } // Short expiration, just for handshake
		);

		res.status(200).json({ websocket_token: token });
	} catch (err) {
		next(err);
	}
};
