import crypto from "crypto";
import logger from "./logger";
import { ENCRYPTION } from "@constants/security";

const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
	logger.error("DB_ENCRYPTION_KEY variable is not provided from environment");
	process.exit(1);
}

if (Buffer.from(ENCRYPTION_KEY, "hex").length !== 32) {
	logger.error("Invalid DB_ENCRYPTION_KEY length, needs to be 32 byte")
	process.exit(1);
}

/**
 * Encrypts a string.
 * @param {string} text The text to encrypt.
 * @returns {string} The encrypted text as a hex string.
 */
export const encrypt = (text: string): string => {
	if (!ENCRYPTION_KEY) throw new Error("Encryption key is not available.");

	const key = Buffer.from(ENCRYPTION_KEY, "hex");
	const iv = crypto.randomBytes(ENCRYPTION.IV_LENGTH);
	const cipher = crypto.createCipheriv(ENCRYPTION.ALGORITHM, key, iv);
	const encrypted = Buffer.concat([
		cipher.update(text, "utf-8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();

	return Buffer.concat([iv, authTag, encrypted]).toString("hex");
};

/**
 * Decrypts a string.
 * @param {string} encryptedText The encrypted hex string.
 * @returns {string | null} The decrypted text, or null if decryption fails.
 */
export const decrypt = (encryptedText: string): string | null => {
	if (!ENCRYPTION_KEY) throw new Error("Encryption key is not available.");
	try {
		const key = Buffer.from(ENCRYPTION_KEY, "hex");
		const data = Buffer.from(encryptedText, "hex");

		const iv = data.subarray(0, ENCRYPTION.IV_LENGTH);
		const authTag = data.subarray(
			ENCRYPTION.IV_LENGTH,
			ENCRYPTION.IV_LENGTH + ENCRYPTION.AUTH_TAG_LENGTH
		);
		const encrypted = data.subarray(
			ENCRYPTION.IV_LENGTH + ENCRYPTION.AUTH_TAG_LENGTH
		);

		const decipher = crypto.createDecipheriv(ENCRYPTION.ALGORITHM, key, iv);

		decipher.setAuthTag(authTag);

		const decrypted = Buffer.concat([
			decipher.update(encrypted),
			decipher.final(),
		]);

		return decrypted.toString("utf8");
	} catch (error) {
		logger.error(
			"Decryption failed. The data may be tampered with or the key is incorrect.",
			error
		);
		return null;
	}
};
