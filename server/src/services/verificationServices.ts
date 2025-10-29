/**
 * Email verification service module.
 *
 * Handles email verification workflow including token generation, email sending,
 * token validation, and email confirmation. Uses Redis for temporary token storage
 * and BullMQ for background email processing.
 */

import crypto from "crypto";
import redis from "@config/redis";
import db from "@models/index";
import { emailQueue } from "@utils/queues/emailQueue";
import { generateVerificationEmailHTML } from "./emailService";
import logger from "@utils/logger";
import { COMPUTED, TOKEN_CONFIG } from "@constants";


/**
 * Generates a cryptographically secure verification token.
 *
 * Creates a random 32-byte token and converts it to hexadecimal string
 * for use in email verification links.
 *
 * @returns Random hexadecimal string token
 */
export const generateVerificationToken = (): string => {
	return crypto.randomBytes(TOKEN_CONFIG.VERIFICATION_TOKEN_BYTES).toString("hex");
};

/**
 * Sends a verification email to a user.
 *
 * Generates a verification token, stores it in Redis with expiry,
 * creates the verification link, and queues the email for sending.
 * Used during user registration and email resend operations.
 *
 * @param userId - Unique identifier of the user
 * @param email - Email address to send verification to
 * @param username - Username for personalization in email template
 * @returns Promise that resolves when email is queued successfully
 * @throws {Error} When email queuing fails
 */
export const sendVerificationEmail = async (
	userId: string,
	email: string,
	username: string
): Promise<void> => {
	try {
		const token = generateVerificationToken();
		const key = `email_verification:${token}`;
		await redis.setex(key, COMPUTED.VERIFICATION_TOKEN_EXPIRY_SECONDS, userId);

		const baseUrl = process.env.CLIENT_URL + ":" + process.env.CLIENT_PORT || "http://localhost:3000";
		const verificationLink = `${baseUrl}/verify-email?token=${token}`;

		await emailQueue.add("verification-email", {
			to: email,
			subject: "Verify Your Email - EasyRide",
			html: generateVerificationEmailHTML(username, verificationLink),
		});

		logger.info(`Verification email queued for ${email}`);
	} catch (err) {
		logger.error("Error sending verification email:", err);
		throw err;
	}
};

/**
 * Verifies a user's email using a verification token.
 *
 * Validates the token against Redis storage, checks if user exists,
 * ensures email isn't already verified, then updates the user's
 * email confirmation status and cleans up the token.
 *
 * @param token - Verification token from email link
 * @returns Promise resolving to true if verification successful
 * @throws {Object} Error with status code and message for various failure cases
 */
export const verifyEmail = async (token: string): Promise<boolean> => {
	const key = `email_verification:${token}`;
	const userId = await redis.get(key);

	if (!userId) {
		throw {
			status: 400,
			message: "Invalid or expired verification token",
		};
	}

	const user = await db.User.findByPk(userId);
	if (!user) {
		throw {
			status: 404,
			message: "User not found",
		};
	}

	if (user.emailConfirmed) {
		await redis.del(key);
		throw { status: 400, message: "Email already verified" };
	}

	await user.update({ emailConfirmed: true });
	await redis.del(key);

	logger.info(`Email verified successfully for user ${user.id}`);
	return true;
};

/**
 * Resends verification email to an existing user.
 *
 * Checks if user exists and hasn't already verified their email,
 * then triggers a new verification email send. Used when users
 * didn't receive the initial verification email or it expired.
 *
 * @param userId - Unique identifier of the user requesting resend
 * @returns Promise that resolves when email is queued
 * @throws {Object} Error with status code for user not found or already verified
 */
export const resendVerificationEmail = async (userId: string) => {
	const user = await db.User.findByPk(userId);

	if (!user) {
		throw {
			status: 404,
			message: "User not found",
		};
	}

	if (user.emailConfirmed) {
		throw {
            status: 400,
            message: "Email already verified"
        };
	}

	await sendVerificationEmail(userId, user.email, user.userName);
};
