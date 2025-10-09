import db from "../models";
import bcrypt from "bcrypt";
import { UpdateProfileDTO } from "../types/user";
import { role, User, UserAttributes } from "../models/users";

/**
 * Service layer encapsulating business logic for user management.
 */

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Retrieves the current user's profile by ID.
 */
export const getUserById = async (
	id: string,
	...attributes: (keyof UserAttributes)[]
): Promise<User | null> => {
	return await db.user.findByPk(id, { attributes });
};

/**
 * Lists users (admin-only endpoint in the route layer).
 */
export const listUsers = async (
	...attributes: (keyof UserAttributes)[]
): Promise<{ rows: User[]; count: number }> => {
	return await db.user.findAndCountAll(
		attributes.length > 0 ? { attributes } : {}
	);
};

/**
 * Allows a user to update their own profile.
 */
export const updateUserProfile = async (
	userId: string,
	dto: UpdateProfileDTO
): Promise<void> => {
	const user = await db.user.findByPk(userId);
	if (!user) throw { status: 404, message: "User not found" };

	// Prevent email duplication
	if (dto.email && dto.email !== user.email) {
		const exist = await db.user.findOne({ where: { email: dto.email } });
		if (exist) throw { status: 400, message: "Email already in use" };
	}

	await user.update(dto);
};

export const changeRole = async (
	userId: string,
	newRole: role
): Promise<User> => {
	const user = await getUserById(userId);
	if (!user) throw { status: 404, message: "User not found" };

	if (!Object.values(role).includes(newRole))
		throw { status: 404, message: "Invalid role" };

	user.role = newRole;
	await user.save();
	return user;
};

export const countTotalAdmin = async (): Promise<number> => {
	return (await db.user.findAndCountAll({ where: { role: role.Admin } }))
		.count;
};

/**
 * Generate default admin account if there non exists.
 */
export const generateDefaultAdminAccount = async (): Promise<User | null> => {
	if ((await countTotalAdmin()) !== 0) {
		return null;
	}

	const passwordHash = await bcrypt.hash("123456789", BCRYPT_SALT_ROUNDS);

	return await db.user.create({
		email: "admin@example.com",
		role: role.Admin,
		userName: "admin",
		fullName: "admin",
		passwordHash,
	});
};
