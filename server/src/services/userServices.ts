import db from "@models/index";
import bcrypt from "bcrypt";
import { UpdateProfileDTO } from "@my_types/user";
import { role, User, UserAttributes } from "@models/user";

/**
 * Service layer encapsulating business logic for user management.
 */

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Retrieves a user by their ID.
 * @param {string} id - The unique identifier of the user.
 * @param {...(keyof UserAttributes)} attributes - Optional attributes to select.
 * @returns {Promise<User | null>} The user object or null if not found.
 * @example
 * const user = await getUserById('123', 'email', 'fullName');
 */
export const getUserById = async (
	id: string,
	...attributes: (keyof UserAttributes)[]
): Promise<User | null> => {
	return await db.user.findByPk(id, { attributes });
};

/**
 * Retrieves a user by their email address.
 * @param {string} email - The email address of the user.
 * @param {...(keyof UserAttributes)} attributes - Optional attributes to select.
 * @returns {Promise<User | null>} The user object or null if not found.
 * @example
 * const user = await getUserByEmail('user@example.com', 'id', 'role');
 */
export const getUserByEmail = async (
	email: string,
	...attributes: (keyof UserAttributes)[]
): Promise<User | null> => {
	return await db.user.findOne({where: {email}, attributes});
};

/**
 * Lists all users with optional attribute selection.
 * @param {...(keyof UserAttributes)} attributes - Optional attributes to select.
 * @returns {Promise<{ rows: User[]; count: number }>} An object containing the user rows and total count.
 * @example
 * const { rows, count } = await listUsers('email', 'fullName');
 */
export const listUsers = async (
	...attributes: (keyof UserAttributes)[]
): Promise<{ rows: User[]; count: number }> => {
	return await db.user.findAndCountAll(
		attributes.length > 0 ? { attributes } : {}
	);
};

/**
 * Updates a user's profile information.
 * @param {string} userId - The ID of the user to update.
 * @param {UpdateProfileDTO} dto - The data transfer object containing update fields.
 * @throws {Object} Throws an error if the user is not found or email is already in use.
 * @example
 * await updateUserProfile('123', { email: 'new@example.com', fullName: 'New Name' });
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

/**
 * Changes the role of a user.
 * @param {string} userId - The ID of the user whose role is to be changed.
 * @param {role} newRole - The new role to assign.
 * @returns {Promise<User>} The updated user object.
 * @throws {Object} Throws an error if the user is not found or the role is invalid.
 * @example
 * const updatedUser = await changeRole('123', role.Admin);
 */
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

/**
 * Counts the total number of admin users.
 * @returns {Promise<number>} The count of admin users.
 * @example
 * const adminCount = await countTotalAdmin();
 */
export const countTotalAdmin = async (): Promise<number> => {
	return (await db.user.findAndCountAll({ where: { role: role.Admin } }))
		.count;
};

/**
 * Generates a default admin account if none exists.
 * @returns {Promise<User | null>} The created admin user or null if an admin already exists.
 * @example
 * const admin = await generateDefaultAdminAccount();
 * if (admin) console.log('Default admin created');
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
