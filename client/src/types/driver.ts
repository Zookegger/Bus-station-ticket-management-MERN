/**
 * Data Transfer Object for creating a new Driver profile.
 *
 * Used when receiving data from clients (e.g., API POST requests)
 * to create a new driver profile record.
 *
 * @interface CreateDriverDTO
 * @property {number} id - Unique identifier for the driver record
 * @property {string | null} [fullname] - Driver's full name
 * @property {string | null} [phoneNumber] - Driver's phone number
 * @property {string | null} [avatar] - URL or path to the driver's avatar image
 * @property {Date | null} [hiredAt] - Date when the driver was hired
 * @property {boolean} [isActive] - Indicates if the driver is actively employed (defaults to true)
 * @property {string | null} [licenseNumber] - Unique driver's license number
 * @property {string | null} [licenseCategory] - License category
 * @property {Date | null} [licenseIssueDate] - Date the license was issued
 * @property {Date | null} [licenseExpiryDate] - Date the license expires
 * @property {string | null} [issuingAuthority] - Authority that issued the license
 * @property {boolean} [isSuspended] - Indicates if the license is suspended (defaults to false)
 */
/**
 * Client-side type definitions for Drivers.
 * Based on server/src/types/driver.ts
 */

import type { Gender } from "./user";

export const DriverStatus = {
	ACTIVE: "ACTIVE",
	INACTIVE: "INACTIVE",
	SUSPENDED: "SUSPENDED",
} as const;

export type DriverStatus = (typeof DriverStatus)[keyof typeof DriverStatus];

/**
 * Represents a driver's profile on the client-side.
 */
export interface Driver {
	id: number;
	fullname?: string | null;
	gender: Gender;
	status: DriverStatus;
	email?: string | null;
	phoneNumber?: string | null;
	avatar?: string | null;
	dateOfBirth?: string | null; // ISO Date string
	citizenId?: string | null;
	address?: string | null;
	hiredAt?: string | null; // ISO Date string
	isActive: boolean;
	licenseNumber?: string | null;
	licenseCategory?: string | null;
	licenseIssueDate?: string | null; // ISO Date string
	licenseExpiryDate?: string | null; // ISO Date string
	issuingAuthority?: string | null;
	isSuspended: boolean;
	createdAt: string; // ISO Date string
	updatedAt: string; // ISO Date string
}

/**
 * DTO for creating a new Driver profile.
 */
export interface CreateDriverDTO {
	fullname?: string | null;
	email?: string | null;
	gender: Gender;
	phoneNumber?: string | null;
	avatar?: string | null;
	dateOfBirth?: string | null; // ISO Date string
	address?: string | null;
	hiredAt?: string | null; // ISO Date string
	isActive?: boolean;
	status?: DriverStatus;
	licenseNumber?: string | null;
	licenseCategory?: string | null;
	licenseIssueDate?: string | null; // ISO Date string
	licenseExpiryDate?: string | null; // ISO Date string
	issuingAuthority?: string | null;
	isSuspended?: boolean;
}

/**
 * DTO for updating an existing Driver profile.
 */
export interface UpdateDriverDTO {
	fullname?: string | null;
	gender?: Gender | null;
	email?: string | null;
	phoneNumber?: string | null;
	avatar?: string | null;
	dateOfBirth?: string | null; // ISO Date string
	address?: string | null;
	hiredAt?: string | null; // ISO Date string
	isActive?: boolean;
	status?: DriverStatus;
	licenseNumber?: string | null;
	licenseCategory?: string | null;
	licenseIssueDate?: string | null; // ISO Date string
	licenseExpiryDate?: string | null; // ISO Date string
	issuingAuthority?: string | null;
	isSuspended?: boolean;
}
