import db from "../models";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { add, addDays } from "date-fns";
import * as DTO from "@my_types/user";
import ms from "ms";
import { role } from "@models/users";
import { Op } from "sequelize";
import { sendVerificationEmail } from "@services/verificationServices";
import { getUserById } from "./userServices";

/**
 * Service layer encapsulating business logic for authentication.
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

const issueExpiryDate = (value: number): Date => {
	return addDays(new Date(), value);
};

/**
 * Registers a new user and issues access + refresh tokens.
 * - Hashes the password with bcrypt
 * - Ensures email uniqueness
 * - Persists a refresh token row, so it can be revoked later
 */
export const register = async (
	dto: DTO.RegisterDTO
): Promise<{
	accessToken: string;
	refreshToken: string;
	user: { id: string; username: string; email: string; role: role };
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
		message:
			"Registration successful. Please check your email to verify your account.",
	};
};

/**
 * Authenticates user credentials and returns tokens.
 */
export const login = async (
	dto: DTO.LoginDTO
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
	if (!user) throw { status: 401, message: "The username or password you entered is incorrect. Please check your details and try again." };

	const valid = await bcrypt.compare(dto.password, user.passwordHash);
	if (!valid) throw { status: 401, message: "The username or password you entered is incorrect. Please check your details and try again." };

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
 * Changes password after validating the current password.
 * Also revokes all refresh tokens to invalidate existing sessions.
 */
export const changePassword = async (dto: DTO.ChangePasswordDTO): Promise<void> => {
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

export const getMe = async (userId: string): Promise<DTO.GetMeDTO> => {
	const user = await getUserById(userId, "userName", "email", "emailConfirmed", "role", "avatar");
	if (!user) throw { status: 404, message: "User not found" }
	return {
		user: {
			id: user.id,
			username: user.userName,
			email: user.email,
			emailConfirmed: user.emailConfirmed,
			role: user.role,
			...(user.avatar !== undefined && {avatar: user.avatar}),
		},
	};
}