import { Gender, Role } from "@models/user";
import { UUID } from "crypto";

/**
 * Defines the shape of the JWT payload.
 * This is the data encoded into the token and available after verification.
 */
export interface JwtPayload {
	/** The unique identifier for the user (UUID). */
	id: UUID;
	/** The role of the user (e.g., 'Admin', 'User'). */
	role: string;
	/** Issued at timestamp. */
	iat?: number;
	/** Expiration timestamp. */
	exp?: number;
}

/**
 * @interface RegisterDTO
 * @property {string} username - The user's username.
 * @property {string} email - The user's email address.
 * @property {string} phoneNumber - The user's phone number.
 * @property {string} password - The user's password.
 * @property {string} confirmPassword - Confirmation of the password.
 */
export interface RegisterDTO {
	email: string;
	phoneNumber: string;
	firstName: string;
	lastName: string;
	address?: string | null;
	gender?: Gender | string | null;
	dateOfBirth?: string | Date | null;
	password: string;
	confirmPassword: string;
}

/**
 * Data Transfer Object for logging in.
 * @property {string} [username or email] The user's email address or username.
 * @property {string} [password] The user's plaintext password
 *
 * @remarks
 * Validation (such as email format checking or password strength) should be performed
 * by the service layer or validators before persisting updates.
 * @interface LoginDTO
 * @property {string} login - The user's username or email.
 * @property {string} password - The user's password.
 */
export interface LoginDTO {
	login: string;
	password: string;
	rememberMe: boolean;
}

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		userName: string;
		fullName?: string;
		firstName?: string;
		lastName?: string;
		email: string;
		role: Role;
	};
	message: string;
}

/**
 * Data Transfer Object for retrieving minimal authenticated user data.
 *
 * This DTO is used as the response format for the /auth/me endpoint, which is called
 * frequently to check authentication status and retrieve essential user information.
 * The response contains minimal user data to optimize performance and reduce payload size
 * for frequent authentication checks.
 *
 * Validation should ensure that:
 * - User data is properly sanitized to exclude sensitive information
 * - Only frequently used, non-sensitive user fields are included
 * - Token metadata is included when relevant for frontend token management
 *
 * @interface GetMeResponse
 * @property {Object} user - The authenticated user's essential information
 * @property {string} user.id - The unique identifier of the authenticated user
 * @property {string} user.username - The user's username for display and identification
 * @property {string} user.email - The user's email address
 * @property {boolean} user.emailConfirmed - Indicates if the user's email has been verified
 * @property {string} [user.avatar] - URL or path to the user's profile avatar image (optional)
 * @property {string} [user.role] - The user's role for authorization purposes
 * @property {Object} [tokens] - Token metadata for frontend token management (optional)
 * @property {number} [tokens.expiresIn] - Time remaining until token expiration in seconds
 * @property {string} [tokens.tokenType] - Type of authentication token, typically "Bearer"
 * @property {Date|string} [tokens.issuedAt] - Timestamp when the current token was issued
 */
export interface GetMeResponse {
	user: {
		id: string;
		userName: string;
		fullName?: string;
		firstName?: string;
		lastName?: string;
		phoneNumber?: string;
		email: string;
		emailConfirmed: boolean;
		avatar?: string | null;
		role: Role;
	};
	csrfToken: string;
}
