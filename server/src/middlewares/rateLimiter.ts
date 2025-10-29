import rateLimit from "express-rate-limit";

/**
 * A strict rate limiter for sensitive authentication actions like login, registration,
 * and password reset requests. This helps prevent brute-force attacks.
 *
 * - Allows 10 requests per 15 minutes.
 */
export const authRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 requests per window
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	message: {
		message:
			"Too many requests from this IP, please try again after 15 minutes.",
	},
	// Use a custom key generator to ensure the real IP is used when behind a proxy
	keyGenerator: (req) => {
		// req.ip can be undefined. Fallback to an empty string, although this is unlikely
		// if the server is correctly configured behind a proxy.
		return req.ip ?? "";
	},
});

/**
 * A general rate limiter for all other API routes. This provides a baseline
 * protection against abuse for the rest of the application.
 *
 * - Allows 100 requests per 15 minutes.
 */
export const apiRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per window
	message: {
		message: "Too many requests from this IP, please try again later.",
	},
	keyGenerator: (req) => {
		// req.ip can be undefined. Fallback to an empty string, although this is unlikely
		// if the server is correctly configured behind a proxy.
		return req.ip ?? "";
	},
});
