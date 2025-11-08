/**
 * Client-side type definitions for Users.
 * Based on server/src/types/user.ts
 */

export type Role = "User" | "Admin" ;

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
 * DTO for updating a user's profile.
 */
export interface UpdateProfileDTO {
	email?: string;
	fullName?: string;
	address?: string | null;
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
	newConfirmPassword:string;
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