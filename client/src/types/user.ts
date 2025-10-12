/**
 * User roles.
 */
export type Role = "User" | "Admin" | "Operator";

/**
 * User gender options.
 */
export type Gender = "male" | "female" | "other";

// Data transfer object

/**
 * Data Transfer Object for logging in.
 * @property {string} [username]
 * @property {string} [email]
 * @property {string} [password]
 * @property {string} [confirmPassword]
 *
 * @remarks
 * Validation (such as email format checking or password strength) should be performed
 * by the service layer or validators before persisting updates.
 */
export interface RegisterDTO {
	username: string;
	email: string;
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
 * @property {string|null} [address] - The user's physical or mailing address.
 * @property {gender|null} [gender] - The user's gender.
 * @property {string|null} [avatar] - URL or data string (e.g., base64) for the user's avatar image.
 * @property {Date|null} [dateOfBirth] - The user's date of birth.
 * @property {string|null} [phoneNumber] - The user's phone number (include country code where applicable).
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
