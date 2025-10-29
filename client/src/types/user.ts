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
 * @property {string|null} [fullName] - The user's full display name.
 * @property {string|null} [address] - The user's physical or mailing address.
 * @property {gender|null} [gender] - The user's gender.
 * @property {string|null} [avatar] - URL or data string (e.g., base64) for the user's avatar image.
 * @property {Date|null} [dateOfBirth] - The user's date of birth.
 * @property {string|null} [phoneNumber] - The user's phone number (include country code where applicable).
 */
export interface UpdateProfileDTO {
	fullName?: string | null;
	address?: string | null;
	gender?: Gender | null;
	avatar?: string | null;
	dateOfBirth?: Date | null;
	phoneNumber?: string | null;
}

export interface UpdateAdminProfileDTO {
  fullName?: string | null;
  address?: string | null;
  gender?: Gender | null;
  avatar?: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  role?: string | null;
  email?: string | null;
}