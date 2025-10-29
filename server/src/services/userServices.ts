import db from "@models/index";
import bcrypt from "bcrypt";
import { UpdateProfileDTO } from "@my_types/user";
import { Role, User, UserAttributes } from "@models/user";
import { CONFIG } from "@constants/config";

/**
 * Service layer encapsulating business logic for user management.
 */

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
	return await db.User.findByPk(id, { attributes });
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
	return await db.User.findOne({ where: { email }, attributes });
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
	return await db.User.findAndCountAll(
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
	const user = await db.User.findByPk(userId);
	if (!user) throw { status: 404, message: "User not found" };

	// Prevent email duplication
	if (dto.email && dto.email !== user.email) {
		const exist = await db.User.findOne({ where: { email: dto.email } });
		if (exist) throw { status: 400, message: "Email already in use" };
	}

	await user.update(dto);
};

/**
 * Changes the role of a user.
 * @param {string} userId - The ID of the user whose role is to be changed.
 * @param {Role} newRole - The new role to assign.
 * @returns {Promise<User>} The updated user object.
 * @throws {Object} Throws an error if the user is not found or the role is invalid.
 * @example
 * const updatedUser = await changeRole('123', role.Admin);
 */
export const changeRole = async (
	userId: string,
	newRole: Role
): Promise<User> => {
	const user = await getUserById(userId);
	if (!user) throw { status: 404, message: "User not found" };

	if (!Object.values(Role).includes(newRole))
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
	return (await db.User.findAndCountAll({ where: { role: Role.ADMIN } })).count;
};

/**
 * Generates a default admin account if none exists.
 * @returns {Promise<User | null>} The created admin user or null if an admin already exists.
 * @example
 * const admin = await generateDefaultAdminAccount();
 * if (admin) logger.info('Default admin created');
 */
export const generateDefaultAdminAccount = async (): Promise<User | null> => {
	if ((await countTotalAdmin()) !== 0) {
		return null;
	}

	const passwordHash = await bcrypt.hash(
		"123456789",
		CONFIG.BCRYPT_SALT_ROUNDS
	);

	return await db.User.create({
		email: "admin@example.com",
		role: Role.ADMIN,
		phoneNumber: "0902040312",
		emailConfirmed: true,
		userName: "admin",
		fullName: "admin",
		passwordHash,
	});
};

/**
 * Updates a user by ID (Admin function).
 * @param {string} userId - The ID of the user to update.
 * @param {Partial<UserAttributes>} updateData - The fields to update.
 * @throws {Object} Throws an error if the user is not found or email is already in use.
 * @example
 * await updateUser('123', { email: 'new@example.com', fullName: 'New Name' });
 */
export const updateUser = async (
	userId: string,
	updateData: Partial<UserAttributes>
): Promise<void> => {
	const user = await db.User.findByPk(userId);
	if (!user) throw { status: 404, message: "User not found" };

	// Prevent email duplication
	if (updateData.email && updateData.email !== user.email) {
		const exist = await db.User.findOne({
			where: { email: updateData.email },
		});
		if (exist) throw { status: 400, message: "Email already in use" };
	}

	await user.update(updateData);
};

/**
 * Deletes a user by ID (Admin function).
 * @param {string} userId - The ID of the user to delete.
 * @throws {Object} Throws an error if the user is not found.
 * @example
 * await deleteUser('123');
 */
export const deleteUser = async (userId: string): Promise<void> => {
	const user = await db.User.findByPk(userId);
	if (!user) throw { status: 404, message: "User not found" };

	await user.destroy();
};

/**
 * Gets all users (Admin function).
 * @returns {Promise<User[]>} Array of all users.
 * @example
 * const users = await getAllUsers();
 */
export const getAllUsers = async (): Promise<User[]> => {
	return await db.User.findAll();
};
