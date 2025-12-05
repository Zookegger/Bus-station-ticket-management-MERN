import rateLimit from "express-rate-limit";

/**
 * A strict rate limiter for sensitive authentication actions like login, registration,
 * and password reset requests. This helps prevent brute-force attacks.
 *
 * - Allows 10 requests per 15 minutes.
 */
export const authRateLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 10, // Limit each IP to 10 requests per window
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	message: {
		message:
			"Too many requests from this IP, please try again after 15 minutes.",
	},
});

/**
 * A general rate limiter for all other API routes. This provides a baseline
 * protection against abuse for the rest of the application.
 *
 * - Allows 100 requests per 15 minutes.
 */
export const apiRateLimiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 2 minutes
	max: 100, // Limit each IP to 100 requests per window
	message: {
		message: "Too many requests from this IP, please try again later.",
	},
});
