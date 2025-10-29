/**
 * Security-related constants
 */

// CSRF settings
export const CSRF_CONFIG = {
	SECRET: process.env.CSRF_SECRET || 'your-csrf-secret',
	COOKIE_NAME: process.env.NODE_ENV === "production"
			? "__Host-psifi.x-csrf-token"
			: "psifi.x-csrf-token",
	HEADER_NAME: 'x-csrf-token',
} as const;

// Rate limiting
export const RATE_LIMITS = {
	// General API limits
	API: {
		WINDOW_MS: 15 * 60 * 1000, // 15 minutes
		MAX_REQUESTS: 100,
	},

	// Authentication endpoints
	AUTH: {
		WINDOW_MS: 15 * 60 * 1000, // 15 minutes
		MAX_REQUESTS: 5,
	},

	// Password reset
	PASSWORD_RESET: {
		WINDOW_MS: 60 * 60 * 1000, // 1 hour
		MAX_REQUESTS: 3,
	},

	// Email verification
	EMAIL_VERIFICATION: {
		WINDOW_MS: 60 * 60 * 1000, // 1 hour
		MAX_REQUESTS: 3,
	},
} as const;

// Token settings
export const TOKEN_CONFIG = {
	REFRESH_TOKEN_BYTES: 64,
	VERIFICATION_TOKEN_BYTES: 32,
} as const;

export const ENCRYPTION = {
	ALGORITHM: "aes-256-gcm",
	IV_LENGTH: 16,
	AUTH_TAG_LENGTH: 16,
} as const;