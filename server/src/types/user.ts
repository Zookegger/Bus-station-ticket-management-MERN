import { Gender, Role } from "@models/user";
// Data transfer object

/**
 * @interface RegisterDTO
 * @property {string} username - The user's username.
 * @property {string} email - The user's email address.
 * @property {string} phoneNumber - The user's phone number.
 * @property {string} password - The user's password.
 * @property {string} confirmPassword - Confirmation of the password.
 */
export interface RegisterDTO {
	username: string;
	email: string;
	phoneNumber: string;
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
 * @property {string} username - The user's username or email.
 * @property {string} password - The user's password.
 */
export interface LoginDTO {
	username: string;
	password: string;
}

/**
 * Data Transfer Object for updating a user's profile.
 *
 * All fields are optional — only provided fields will be applied when updating the user's record.
 *
 * @interface UpdateProfileDTO
 *
 * @property {string} [fullName] - The user's full display name.
 * @property {string | null} [address] - The user's physical or mailing address.
 * @property {Gender | null} [gender] - The user's gender.
 * @property {string | null} [avatar] - URL or data string (e.g., base64) for the user's avatar image.
 * @property {Date | null} [dateOfBirth] - The user's date of birth.
 * @property {string | null} [phoneNumber] - The user's phone number (include country code where applicable).
 */
export interface UpdateProfileDTO {
	email?: string;
	fullName?: string;
	address?: string | null;
	gender?: Gender | null;
	avatar?: string | null;
	dateOfBirth?: Date | null;
}

/**
 * Data Transfer Object for changing a user's password.
 *
 * @interface ChangePasswordDTO
 *
 * @property {string} userId - Unique identifier of the user requesting the password change.
 * @property {string} currentPassword - The user's existing password (used for verification).
 * @property {string} newPassword - The user's new desired password. Should meet security requirements (length, complexity).
 *
 * @remarks
 * The service layer should validate `currentPassword` against the stored hash
 * and ensure `newPassword` is properly hashed before saving.
 */
export interface ChangePasswordDTO {
	userId: string;
	currentPassword: string;
	newPassword: string;
	newConfirmPassword: string;
}

/**
 * Data Transfer Object for resetting a user's password.
 *
 * @interface ResetPasswordDTO
 *
 * @property {string} userId - Unique identifier of the user requesting the password reset.
 * @property {string} newPassword - The user's new desired password. Should meet security requirements (length, complexity).
 * @property {string} newConfirmPassword - Confirmation of the new password to prevent typos.
 *
 * @remarks
 * Used for password reset via token. The service layer should validate the token,
 * ensure `newPassword` matches `newConfirmPassword`, and hash the new password before saving.
 */
export interface ResetPasswordDTO {
	token: string;
	newPassword: string;
	newConfirmPassword: string;
}

/**
 * Data Transfer Object for changing a user's email address.
 *
 * This DTO is used when a user requests to update their account's email.
 * Validation should ensure that:
 * - `userId` exists and corresponds to the requesting user.
 * - `currentEmail` matches the email currently stored for the user.
 * - `newEmail` is in a valid email format and not already in use.
 *
 * @interface ChangeEmailDTO
 * @property {string} userId - The unique identifier of the user requesting the email change.
 * @property {string} currentEmail - The user's current email address, used to verify ownership.
 * @property {string} newEmail - The user's new desired email address. Must be unique and valid.
 */
export interface ChangeEmailDTO {
	userId: string;
	currentEmail: string;
	newEmail: string;
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
 * @interface GetMeDTO
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
export interface GetMeDTO {
	user: {
		id: string;
		username: string;
		email: string;
		emailConfirmed: boolean;
		avatar?: string | null;
		role: Role;
	};
	tokens?: {
		expiresIn?: number;
		tokenType?: string;
		issuedAt?: Date | string;
	};
}
