/**
 * Authentication-related constants
 */

// JWT Secret (from environment)
export const JWT_SECRET: string = process.env.JWT_SECRET || 'yoursupersecret';

// Token types
export const TOKEN_TYPES = {
	ACCESS: 'access',
	REFRESH: 'refresh',
	RESET_PASSWORD: 'reset_password',
	EMAIL_VERIFICATION: 'email_verification',
} as const;

// User roles
export const USER_ROLES = {
	USER: 'User',
	ADMIN: 'Admin',
	SUPER_ADMIN: 'SuperAdmin',
} as const;

// Password requirements
export const PASSWORD_REQUIREMENTS = {
	MIN_LENGTH: 8,
	MAX_LENGTH: 128,
	REQUIRE_UPPERCASE: true,
	REQUIRE_LOWERCASE: true,
	REQUIRE_NUMBERS: true,
	REQUIRE_SPECIAL_CHARS: false,
} as const;

// Session limits
export const SESSION_LIMITS = {
	MAX_CONCURRENT_SESSIONS: 5,
	MAX_FAILED_ATTEMPTS: 5,
	LOCKOUT_DURATION_MINUTES: 15,
} as const;