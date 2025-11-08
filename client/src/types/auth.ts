import type { User } from "./user";

/**
 * Client-side type definitions for Authentication.
 * Based on server/src/types/auth.ts and existing client types.
 */

/**
 * Defines the shape of the JWT payload for the client.
 */
export interface JwtPayload {
	/** The unique identifier for the user (UUID string). */
	id: string;
	/** The role of the user (e.g., 'Admin', 'User'). */
	role: string;
}

/**
 * DTO for user registration.
 */
export interface RegisterDTO {
	username: string;
	email: string;
	phoneNumber: string;
	password: string;
	confirmPassword: string;
}

/**
 * DTO for user login.
 */
export interface LoginDTO {
	login: string;
	password: string;
}

export interface LoginResponse {
	user: User;
	csrfToken: string;
	message: string;
}

export interface AuthUser {
	userName: string;
	fullName: string;
	firstName: string;
	lastName: string;
	email: string;
	emailConfirmed: false;
	role: "User";
	avatar: null;
}

/**
 * Defines the shape of the authentication context.
 */
interface AuthContextType {
	user: AuthUser | User | null;
	login: (dto: LoginDTO) => Promise<LoginResponse>;
	logout: () => void;
	isLoading: boolean;
	isAuthenticated: boolean;
	isAdmin: boolean;
}

export type { AuthContextType };
