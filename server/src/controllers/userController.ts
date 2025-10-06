import { Request, Response, NextFunction } from "express";
import * as userServices from "../services/userServices";

/**
 * Updates the authenticated user's profile.
 * @route PUT /users/profile
 * @access Private (requires auth middleware)
 */
export const updateProfile = async (
	req: Request, // Typed to include user from middleware
	res: Response,
	next: NextFunction
) => {
	try {
		const userId = (req as any).user.userId; // Safer typing avoids 'any'
		const { fullName, address, gender, avatar, dateOfBirth } = req.body;

		await userServices.updateUserProfile(userId, {
			fullName,
			address,
			gender,
			avatar,
			dateOfBirth,
		});

		res.status(200).json({ message: "Profile updated successfully" }); // Return success msg
	} catch (err) {
		next(err);
	}
};
