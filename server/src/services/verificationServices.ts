import crypto from "crypto";
import redis from "../config/redis";
import db from "../models";
import { emailQueue } from "../queues/emailQueue";
import { generateVerificationEmailHTML } from "./emailService";
import logger from "../utils/logger";

const VERIFICATION_TOKEN_EXPIRY = process.env.VERIFICATION_TOKEN_EXPIRY || 24 * 60 * 60;

export const generateVerificationToken = (): string => {
	return crypto.randomBytes(32).toString("hex");
};

export const sendVerificationEmail = async (
	userId: string,
	email: string,
	username: string
): Promise<void> => {
	try {
		const token = generateVerificationToken();
		const key = `email_verification:${token}`;
		await redis.setex(key, VERIFICATION_TOKEN_EXPIRY, userId);

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

export const verifyEmail = async (token: string): Promise<boolean> => {
	const key = `email_verification:${token}`;
	const userId = await redis.get(key);

	if (!userId) {
		throw {
			status: 400,
			message: "Invalid or expired verification token",
		};
	}

	const user = await db.user.findByPk(userId);
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

export const resendVerificationEmail = async (userId: string) => {
	const user = await db.user.findByPk(userId);

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
