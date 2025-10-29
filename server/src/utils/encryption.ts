import crypto from "crypto";
import logger from "./logger";
import { ENCRYPTION } from "@constants/security";

const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY;

if (!DB_ENCRYPTION_KEY) {
	logger.error("DB_ENCRYPTION_KEY variable is not provided from environment");
	process.exit(1);
}

if (Buffer.from(DB_ENCRYPTION_KEY, "hex").length !== 32) {
	logger.error("Invalid DB_ENCRYPTION_KEY length, needs to be 32 bytes");
	process.exit(1);
}

/**
 * Encrypts a string.
 * @param {string} text The text to encrypt.
 * @returns {string} The encrypted text as a hex string.
 */
export const encryptDB = (text: string): string => {
	if (!DB_ENCRYPTION_KEY) throw new Error("Encryption key is not available.");

	const key = Buffer.from(DB_ENCRYPTION_KEY, "hex");
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
export const decryptDB = (encryptedText: string): string | null => {
	if (!DB_ENCRYPTION_KEY) throw new Error("Encryption key is not available.");
	try {
		const key = Buffer.from(DB_ENCRYPTION_KEY, "hex");
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

/**
 * Encrypts a token string using AES-256-GCM.
 * @param token The raw token string.
 * @param secret The encryption secret.
 * @returns A string in the format "iv:authTag:encryptedData".
 */
export const encryptToken = (token: string, secret: string): string => {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(
		"aes-256-gcm",
		crypto.createHash("sha256").update(secret).digest(),
		iv
	);
	const encrypted = Buffer.concat([
		cipher.update(token, "utf-8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();

	return `${iv.toString("hex")}:${authTag.toString(
		"hex"
	)}:${encrypted.toString("hex")}`;
};

/**
 * Decrypts a token string that was encrypted with encryptToken.
 * @param encryptedToken The encrypted token string ("iv:authTag:encryptedData").
 * @param secret The encryption secret.
 * @returns The original raw token string, or null if decryption fails.
 */
export const decryptToken = (
	encryptedToken: string,
	secret: string
): string | null => {
	try {
		const parts = encryptedToken.split(":");
		if (parts.length !== 3) {
			logger.error("Decryption failed: Invalid token format.");
			return null;
		}

		const [ivHex, authTagHex, encryptedDataHex] = parts;

		if (!ivHex || !authTagHex || !encryptedDataHex) {
			logger.error("Decryption failed: Invalid token format or missing parts.");
			return null;
		}

		const iv = Buffer.from(ivHex, "hex");
		const authTag = Buffer.from(authTagHex, "hex");
		const encryptedData = Buffer.from(encryptedDataHex, "hex");

		const decipher = crypto.createDecipheriv(
			"aes-256-gcm",
			crypto.createHash("sha256").update(secret).digest(),
			iv
		);
		decipher.setAuthTag(authTag);

		const decrypted = Buffer.concat([
			decipher.update(encryptedData),
			decipher.final(),
		]);
		return decrypted.toString("utf-8");
	} catch (error) {
		logger.error("Decryption failed:", error);
		return null;
	}
};
