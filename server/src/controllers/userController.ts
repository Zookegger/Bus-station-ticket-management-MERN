/**
 * User management controller.
 *
 * Handles user-related operations such as profile updates and user data management.
 * All operations require proper authentication and validation middleware.
 */

import { Request, Response, NextFunction } from "express";
import * as userServices from "@services/userServices";
import { UpdateProfileDTO } from "@my_types/user";

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
export const updateProfile = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId: string = (req as any).user.userId;
		const newProfile: UpdateProfileDTO = req.body;

		await userServices.updateUserProfile(userId, newProfile);

		res.status(200).json({ message: "Profile updated successfully" }); // Return success msg
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
export const getAllUsers = async (
	req: Request,
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
export const updateUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId: string = (req as any).user.userId;
		if (!userId) {
			throw { status: 404, message: "User id is missing from the params" }
		}

		const updateData = req.body;
		await userServices.updateUser(userId, updateData);
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
export const deleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId: string = (req as any).user.userId;
		await userServices.deleteUser(userId);
		res.status(200).json({ message: "User deleted successfully" });
	} catch (err) {
		next(err);
	}
};
