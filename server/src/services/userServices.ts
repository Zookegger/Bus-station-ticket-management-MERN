import db from "../models";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto, { UUID } from "crypto";
import { add, addDays } from "date-fns";
import {
	RegisterDTO,
	LoginDTO,
	UpdateProfileDTO,
	ChangePasswordDTO,
} from "../types/user";
import ms from "ms";
import { role, User, UserAttributes } from "../models/users";
import { Op } from "sequelize";
import { sendVerificationEmail } from "./verificationServices";

/**
 * Service layer encapsulating business logic for users and auth.
 */

const BCRYPT_SALT_ROUNDS = 12;

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "yoursupersecret";
const JWT_EXPIRY = (process.env.JWT_EXPIRES_IN as ms.StringValue) || "3d";
const REFRESH_TOKEN_EXPIRY =
	Number(ms(process.env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue) / 1000) ||
	2592000; // 30 days

interface JwtPayload {
	id: string;
	role: role;
}

/**
 * Creates a signed JWT access token.
 * Keep access tokens short-lived (15m–1h) to limit risk if stolen.
 */
const generateAccessToken = (payload: JwtPayload) => {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

/**
 * Generates a cryptographically strong refresh token string.
 * In production, you should store a hash (e.g., SHA-256) instead of the raw token in DB.
 */
const generateRefreshTokenValue = (): { value: string; hashed: string } => {
	const token = crypto.randomBytes(64).toString("hex");
	const hashed = crypto.createHash("sha256").update(token).digest("hex");

	return { value: token, hashed: hashed };
};

/**
 * Registers a new user and issues access + refresh tokens.
 * - Hashes the password with bcrypt
 * - Ensures email uniqueness
 * - Persists a refresh token row, so it can be revoked later
 */
export const register = async (
	dto: RegisterDTO
): Promise<{
	accessToken: string;
	refreshToken: string;
	user: { id: string; username: string; email: string; role: role, };
	message: string;
}> => {
	const existing = await db.user.findOne({ where: { email: dto.email } });
	if (existing) throw { status: 400, message: "Email already in use" };

	const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
	const user = await db.user.create({
		userName: dto.username,
		email: dto.email,
		role: role.User,
		passwordHash,
	});

	await sendVerificationEmail(user.id, user.email, user.userName);

	const refreshToken = generateRefreshTokenValue();
	const expiresAt = add(new Date(), { seconds: REFRESH_TOKEN_EXPIRY });

	await db.refreshToken.create({
		token: refreshToken.hashed,
		userId: user.id,
		expiresAt,
	});

	const accessToken = generateAccessToken({ id: user.id, role: user.role });

	return {
		accessToken,
		refreshToken: refreshToken.value,
		user: {
			id: user.id,
			username: user.userName,
			email: user.email,
			role: user.role,
		},
		message: "Registration successful. Please check your email to verify your account.",
	};
};

/**
 * Authenticates user credentials and returns tokens.
 */
export const login = async (
	dto: LoginDTO
): Promise<{
	accessToken: string;
	refreshToken: string;
	user: { id: string; username: string; email: string; role: role };
	message: string;
}> => {
	const user = await db.user.findOne({
		where: {
			[Op.or]: [{ email: dto.username }, { userName: dto.username }],
		},
	});
	if (!user) throw { status: 401, message: "Invalid credentials" };

	const valid = await bcrypt.compare(dto.password, user.passwordHash);
	if (!valid) throw { status: 401, message: "Invalid credentials" };

	const accessToken = generateAccessToken({ id: user.id, role: user.role });
	const refreshToken = generateRefreshTokenValue();
	const expiresAt = add(new Date(), { seconds: REFRESH_TOKEN_EXPIRY });

	await db.refreshToken.create({
		token: refreshToken.hashed,
		userId: user.id,
		expiresAt: expiresAt,
	});

	return {
		accessToken,
		refreshToken: refreshToken.value,
		user: {
			id: user.id,
			username: user.userName,
			email: user.email,
			role: user.role,
		},
		message: "Login successful.",
	};
};

const issueExpiryDate = (value: number): Date => {
	return addDays(new Date(), value);
};

/**
 * Exchanges a valid refresh token for a new access token.
 * - Validates existence and expiry of the refresh token in DB
 * - Rotate refresh tokens (issue a new one and delete the old)
 */
export const refreshAccessToken = async (
	refreshTokenValue: string
): Promise<{
	accessToken: string;
	refreshToken: { value: string; hashed: string };
}> => {
	const dbToken = await db.refreshToken.findOne({
		where: { token: refreshTokenValue },
		include: [{ model: db.user, as: "user" }],
	});

	if (!dbToken) throw { status: 401, message: "Invalid refresh token" };

	if (dbToken.expiresAt < new Date()) {
		await dbToken.destroy();
		throw {
			status: 401,
			message: "Refresh token expired",
		};
	}

	const user = await db.user.findByPk(dbToken.userId, {
		attributes: ["id", "role"],
	});

	if (!user) throw { status: 401, message: `Unable to find token's owner` };

	const accessToken = generateAccessToken({
		id: user.id,
		role: user.role,
	});

	const newRefreshToken = generateRefreshTokenValue();

	await db.sequelize.transaction(async (t) => {
		await db.refreshToken.destroy({
			where: { id: dbToken.id },
			transaction: t,
		});
		await db.refreshToken.create({
			token: newRefreshToken.hashed,
			userId: user.id,
			expiresAt: issueExpiryDate(REFRESH_TOKEN_EXPIRY),
		});
	});

	return { accessToken, refreshToken: newRefreshToken };
};

/**
 * Revokes a specific refresh token (logout for that session/device).
 */
export const revokeRefreshToken = async (
	refreshTokenValue: string
): Promise<number> => {
	return await db.refreshToken.destroy({
		where: { token: refreshTokenValue },
	});
};

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
): Promise<User[]> => {
	return await db.user.findAll(attributes.length > 0 ? { attributes } : {});
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

/**
 * Changes password after validating the current password.
 * Also revokes all refresh tokens to invalidate existing sessions.
 */
export const changePassword = async (dto: ChangePasswordDTO): Promise<void> => {
	const user = await db.user.findByPk(dto.userId, {
		attributes: ["id", "passwordHash"],
	});

	if (!user) throw { status: 404, message: "User not found" };

	const isValid = await bcrypt.compare(
		dto.currentPassword,
		user.passwordHash
	);

	if (!isValid)
		throw { status: 404, message: "Current password is incorrect" };

	const newPasswordHash = await bcrypt.hash(
		dto.newPassword,
		BCRYPT_SALT_ROUNDS
	);

	await user.update({ passwordHash: newPasswordHash });

	// Revoke all sessions after password change
	await db.refreshToken.destroy({ where: { userId: user.id } });
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

/**
 * Security note (production hardening):
 * - Store a tokenHash (SHA-256) instead of raw token in DB.
 * - On refresh/revoke, hash the incoming token and lookup by tokenHash.
 * - Use HttpOnly+Secure cookie for refresh token in browsers to reduce XSS risk.
 */
