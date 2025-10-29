import db from "@models/index";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { add, addDays } from "date-fns";
import * as DTO from "@my_types/user";
import ms from "ms";
import { Role } from "@models/user";
import { Op } from "sequelize";
import * as verificationServices from "@services/verificationServices";
import { getUserByEmail, getUserById } from "./userServices";
import { emailQueue } from "@utils/queues/emailQueue";
import redis from "@config/redis";
import { generateResetPasswordHTML } from "./emailService";
import logger from "@utils/logger";
import { CONFIG, COMPUTED, TOKEN_CONFIG } from "@constants";

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "yoursupersecret";

interface AuthJwtPayload {
	id: string;
	role: Role;
}
interface ResetPasswordJwtPayload {
	userId: string;
}

/**
 * Creates a signed JWT access token.
 * Keep access tokens short-lived (15m–1h) to limit risk if stolen.
 */
const generateAccessToken = (payload: AuthJwtPayload): string => {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: COMPUTED.JWT_EXPIRY });
};

/**
 * Generates a cryptographically strong refresh token string.
 * In production, you should store a hash (e.g., SHA-256) instead of the raw token in DB.
 */
const generateRefreshTokenValue = (): { value: string; hashed: string } => {
	const token = crypto.randomBytes(TOKEN_CONFIG.REFRESH_TOKEN_BYTES).toString("hex");
	const hashed = crypto.createHash("sha256").update(token).digest("hex");

	return { value: token, hashed: hashed };
};

/**
 * Calculates the expiry date for tokens based on the given number of days.
 *
 * @param value - Number of days until expiry.
 * @returns Date object representing the expiry date.
 */
const issueExpiryDate = (value: number): Date => {
	return addDays(new Date(), value);
};

/**
 * Registers a new user and issues access + refresh tokens.
 *
 * Validates input data, ensures email uniqueness, hashes password,
 * creates user account, and generates authentication tokens.
 * Sends verification email for account activation.
 *
 * @param dto - Data transfer object containing registration data
 * @returns Promise resolving to object with tokens and user info
 * @throws {Object} Error with status 400 if email already in use
 */
export const register = async (
	dto: DTO.RegisterDTO
): Promise<{
	accessToken: string;
	refreshToken: string;
	user: { id: string; username: string; email: string; role: Role };
	message: string;
}> => {
	const existing = await db.User.findOne({ where: { email: dto.email } });
	if (existing) throw { status: 400, message: "Email already in use" };
 
	const passwordHash = await bcrypt.hash(dto.password, CONFIG.BCRYPT_SALT_ROUNDS);
	const user = await db.User.create({
		userName: dto.username,
		email: dto.email,
		phoneNumber: dto.phoneNumber,
		emailConfirmed: false,
		role: Role.USER,
		passwordHash,
	});

	await verificationServices.sendVerificationEmail(user.id, user.email, user.userName);

	const refreshToken = generateRefreshTokenValue();
	const expiresAt = add(new Date(), { seconds: COMPUTED.REFRESH_TOKEN_EXPIRY_SECONDS });

	await db.RefreshToken.create({
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
 *
 * Validates username/email and password, generates new tokens
 * for session management. Supports login by username or email.
 *
 * @param dto - Data transfer object containing login credentials
 * @returns Promise resolving to object with tokens and user info
 * @throws {Object} Error with status 401 if credentials are invalid
 */
export const login = async (
	dto: DTO.LoginDTO
): Promise<{
	accessToken: string;
	refreshToken: string;
	user: { id: string; username: string; email: string; role: Role };
	message: string;
}> => {
	const user = await db.User.findOne({
		where: {
			[Op.or]: [{ email: dto.username }, { userName: dto.username }],
		},
	});
	if (!user) throw { status: 401, message: "The username or password you entered is incorrect. Please check your details and try again." };

	const valid = await bcrypt.compare(dto.password, user.passwordHash);
	if (!valid) throw { status: 401, message: "The username or password you entered is incorrect. Please check your details and try again." };

	const accessToken = generateAccessToken({ id: user.id, role: user.role });
	const refreshToken = generateRefreshTokenValue();
	const expiresAt = add(new Date(), { seconds: COMPUTED.REFRESH_TOKEN_EXPIRY_SECONDS });

	await db.RefreshToken.create({
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
 *
 * Validates refresh token existence and expiry, rotates tokens
 * for security, and issues new access token pair.
 *
 * @param refreshTokenValue - The refresh token string to validate
 * @returns Promise resolving to new access token and refresh token
 * @throws {Object} Error with status 401 if token is invalid or expired
 */
export const refreshAccessToken = async (
	refreshTokenValue: string
): Promise<{
	accessToken: string;
	refreshToken: { value: string; hashed: string };
}> => {
	const dbToken = await db.RefreshToken.findOne({
		where: { token: refreshTokenValue },
		include: [{ model: db.User, as: "user" }],
	});

	if (!dbToken) throw { status: 401, message: "Invalid refresh token" };

	if (dbToken.expiresAt < new Date()) {
		await dbToken.destroy();
		throw {
			status: 401,
			message: "Refresh token expired",
		};
	}

	const user = await db.User.findByPk(dbToken.userId, {
		attributes: ["id", "role"],
	});

	if (!user) throw { status: 401, message: `Unable to find token's owner` };

	const accessToken = generateAccessToken({
		id: user.id,
		role: user.role,
	});

	const newRefreshToken = generateRefreshTokenValue();

	await db.sequelize.transaction(async (t) => {
		await db.RefreshToken.destroy({
			where: { id: dbToken.id },
			transaction: t,
		});
		await db.RefreshToken.create({
			token: newRefreshToken.hashed,
			userId: user.id,
			expiresAt: issueExpiryDate(COMPUTED.REFRESH_TOKEN_EXPIRY_SECONDS),
		}, { transaction: t });
	});

	return { accessToken, refreshToken: newRefreshToken };
};

/**
 * Revokes a specific refresh token (logout for that session/device).
 *
 * Removes the refresh token from database to invalidate the session.
 * Used for logout or token cleanup.
 *
 * @param refreshTokenValue - The refresh token string to revoke
 * @returns Promise resolving to number of destroyed rows
 */
export const revokeRefreshToken = async (
	refreshTokenValue: string
): Promise<number> => {
	return await db.RefreshToken.destroy({
		where: { token: refreshTokenValue },
	});
};

/**
 * Changes password after validating the current password.
 *
 * Verifies current password, hashes new password, updates user record,
 * and revokes all refresh tokens to invalidate existing sessions.
 *
 * @param dto - Data transfer object containing password change data
 * @returns Promise resolving when password change is complete
 * @throws {Object} Error with status 404 if user not found or password incorrect
 */
export const changePassword = async (dto: DTO.ChangePasswordDTO): Promise<void> => {
	const user = await db.User.findByPk(dto.userId, {
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
		CONFIG.BCRYPT_SALT_ROUNDS
	);

	await user.update({ passwordHash: newPasswordHash });

	// Revoke all sessions after password change
	await db.RefreshToken.destroy({ where: { userId: user.id } });
};

/**
 * Resets a user's password using a valid reset token.
 *
 * Verifies the reset token, hashes the new password, updates the user record,
 * and revokes all refresh tokens to invalidate existing sessions.
 *
 * @param dto - Data transfer object containing the reset token and new password.
 * @returns Promise resolving when password reset is complete.
 * @throws {Object} Error with status 404 if user not found or token invalid.
 */
export const resetPassword = async (dto: DTO.ResetPasswordDTO): Promise<void> => {
	const decoded = verifyResetPasswordToken(dto.token) as ResetPasswordJwtPayload;
    
	const user = await getUserById(decoded.userId);
    if (!user) throw { status: 404, message: "User not found" };

	const newPasswordHash = await bcrypt.hash(
		dto.newPassword,
		CONFIG.BCRYPT_SALT_ROUNDS
	);

	await user.update({ passwordHash: newPasswordHash });	// Revoke all sessions after password change
	await db.RefreshToken.destroy({ where: { userId: user.id } });
};

/**
 * Retrieves the authenticated user's profile by ID.
 *
 * Fetches user data excluding sensitive fields like password hash.
 * Used for profile display and user information retrieval.
 *
 * @param userId - Unique identifier of the user
 * @returns Promise resolving to user profile data
 * @throws {Object} Error with status 404 if user not found
 */
export const getMe = async (userId: string): Promise<DTO.GetMeDTO> => {
	const user = await getUserById(userId, "userName", "email", "emailConfirmed", "role", "avatar");
	if (!user) throw { status: 404, message: "User not found" }
	return {
		user: {
			id: user.id,
			username: user.userName,
			email: user.email,
			emailConfirmed: user.emailConfirmed ?? false,
			role: user.role,
			...(user.avatar !== undefined && {avatar: user.avatar}),
		},
	};
}


/**
 * Creates a signed JWT access token.
 * Keep change password tokens short-lived (15m–1h) to limit risk if stolen.
 */
const generateResetPasswordToken = (payload: ResetPasswordJwtPayload): string => {
	const CHANGE_PASSWORD_EXPIRY = ms(`${CONFIG.CHANGE_PASSWORD_EXPIRY_HOURS}h`);
	
	return jwt.sign(payload, JWT_SECRET, { expiresIn: CHANGE_PASSWORD_EXPIRY });
};

/**
 * Verifies and decodes a reset password JWT token.
 *
 * @param token - The JWT token to verify.
 * @returns The decoded payload containing the user ID.
 * @throws Error if token is invalid or expired.
 */
const verifyResetPasswordToken = (token: string): ResetPasswordJwtPayload => {
	return jwt.verify(token, JWT_SECRET) as ResetPasswordJwtPayload;
}

/**
 * Sends a password reset email to the user.
 *
 * Generates a reset token, stores it in Redis, creates the reset link,
 * and queues an email with the reset instructions.
 *
 * @param userId - The ID of the user requesting password reset.
 * @param username - The username of the user.
 * @param email - The email address to send the reset email to.
 * @returns Promise resolving when the email is queued.
 */
export const sendResetPasswordEmail = async (
	userId: string,
	username: string,
	email: string,
): Promise<void> => {
	const CHANGE_PASSWORD_EXPIRY = ms(`${CONFIG.CHANGE_PASSWORD_EXPIRY_HOURS}h`);
	try {
		// Generate token for change password
		const payload: ResetPasswordJwtPayload = { userId: userId };

		const reset_token = generateResetPasswordToken(payload);
		const key = `forgot_password:${reset_token}`;
		await redis.setex(key, CHANGE_PASSWORD_EXPIRY, userId);

		const baseUrl = `${process.env.CLIENT_URL || "http://localhost"}:${process.env.CLIENT_PORT || "3000"}`;		
		const resetLink = `${baseUrl}/reset-passwordtoken=${reset_token}`;

		await emailQueue.add("password-reset-email", {
			to: email,
			subject: "Password Reset Request - EasyRide",
			html: generateResetPasswordHTML(username, resetLink),
		});

		logger.info(`Password reset email queued for ${email}`);
	} catch (err) {
		logger.error("Error queueing password reset email:", err);
	}
};

/**
 * Initiates password reset for a user by email.
 *
 * Checks if a user exists with the given email address and sends a password reset email if found.
 * Does not reveal whether the email exists for security reasons.
 *
 * @param email - The email address to send the password reset request to.
 * @returns Promise resolving when the request is processed.
 * @example
 * await forgotPassword('user@example.com');
 */
export const forgotPassword = async (email: string): Promise<void> => {
	try {
		const user = await getUserByEmail(email, "id", "userName", "email" );

		if (user) {
			// Send email to the email address 
			await sendResetPasswordEmail(user.id, user.userName, user.email);
		}
	} catch (err) {
		logger.error("Failed to process forgotPassword request due to a service-level error:", err);
	}
}