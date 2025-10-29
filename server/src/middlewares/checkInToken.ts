import crypto from "crypto";

const ALGORITHM = "sha256";
const SECRET_KEY = process.env.CHECK_IN_SECRET;

if (!SECRET_KEY) {
    throw new Error(
        "CHECK_IN_SECRET_KEY is not defined in environment variables."
    );
}

/**
 * Generates a secure HMAC token for a given payload (e.g., an orderId).
 * @param payload - The string payload to sign.
 * @returns A secure hex-encoded token.
 */
export const generateCheckInToken = (payload: string): string => {
    const hmac = crypto.createHmac(ALGORITHM, SECRET_KEY);
    hmac.update(payload);
    return hmac.digest("hex");
};

/**
 * Verifies if a token is valid for a given payload.
 * @param payload - The original string payload (e.g., orderId).
 * @param token - The token to verify.
 * @returns `true` if the token is valid, `false` otherwise.
 */
export const verifyCheckInToken = (payload: string, token: string): boolean => {
    const expectedToken = generateCheckInToken(payload);
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}