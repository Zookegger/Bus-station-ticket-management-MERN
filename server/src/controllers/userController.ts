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
		const profile = await userServices.getUserById(authenticatedUserId);
		if (!profile) {
			throw { status: 404, message: "User profile not found" };
		}

		await userServices.updateUserProfile(authenticatedUserId, newProfile);

		res.status(200).json({ message: "Profile updated successfully" });
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

		const profile = await userServices.getUserById(authenticatedUserId);
		if (!profile) {
			throw { status: 404, message: "User profile not found" };
		}

		res.status(200).json({ profile });
	} catch (err) {
		next(err);
	}
}




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
		await userServices.updateUser(targetUserId, updateData);
		res.status(200).json({ message: "User updated successfully" });
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
		const targetUserId = getParamStringId(req);
		await userServices.deleteUser(targetUserId);
		res.status(200).json({ message: "User deleted successfully" });
	} catch (err) {
		next(err);
	}
};
