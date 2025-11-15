/**
 * Client-side type definitions for Users.
 * Based on server/src/types/user.ts
 */

export type Role = "User" | "Admin";

/**
 * Type for user gender.
 * @type {string}
 */
export type Gender = "male" | "female" | "other";

/**
 * Represents a user object on the client-side.
 */
export interface User {
  id: string; // UUID
  email: string;
  phoneNumber: string | null;
  userName: string;
  fullName: string;
  firstName: string;
  lastName: string;
  address: string | null;
  gender: Gender | null;
  avatar: string | null;
  dateOfBirth: string | null; // ISO Date string
  role: Role;
  emailConfirmed: boolean;
  lastLogin: string | null; // ISO Date string
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

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
  dateOfBirth?: Date | string | null;
  phoneNumber?: string | null;
  role?: string | null;
  email?: string | null;
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

/**
 * DTO for updating a user's profile.
 */
export interface UpdateProfileDTO {
  email?: string;
  fullName?: string;
  address?: string | null;
  phoneNumber?: string | null;
  gender?: Gender | null;
  avatar?: string | null;
  dateOfBirth?: string | null; // ISO Date string
}

/**
DTO for changing a user's password.
*/
export interface ChangePasswordDTO {
  userId: string;
  currentPassword: string;
  newPassword: string;
  newConfirmPassword: string;
}

/**
 * DTO for resetting a user's password.
 */
export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
  newConfirmPassword: string;
}

/**
 * DTO for retrieving minimal authenticated user data.
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
    issuedAt?: string | null; // ISO Date string
  };
}
