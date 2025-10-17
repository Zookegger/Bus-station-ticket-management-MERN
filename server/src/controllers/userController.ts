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
		const userId = (req as any).user.userId; // Safer typing avoids 'any'
		const newProfile: UpdateProfileDTO = req.body;

		await userServices.updateUserProfile(userId, newProfile);

		res.status(200).json({ message: "Profile updated successfully" }); // Return success msg
	} catch (err) {
		next(err);
	}
};
