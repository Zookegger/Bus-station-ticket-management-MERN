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
export interface CreateDriverDTO {
	id: number;
	fullname?: string | null;
	phoneNumber?: string | null;
	avatar?: string | null;
	hiredAt?: Date | null;
	isActive?: boolean;
	licenseNumber?: string | null;
	licenseCategory?: string | null;
	licenseIssueDate?: Date | null;
	licenseExpiryDate?: Date | null;
	issuingAuthority?: string | null;
	isSuspended?: boolean;
}

/**
 * Data Transfer Object for updating an existing Driver profile.
 *
 * Used for PUT/PATCH requests where only specific fields may be modified.
 * The `id` is required to identify which driver profile to update.
 *
 * @interface UpdateDriverDTO
 * @property {number} id - ID of the driver profile to update
 * @property {string | null} [fullname] - Updated driver's full name
 * @property {string | null} [phoneNumber] - Updated driver's phone number
 * @property {string | null} [avatar] - Updated URL or path to the driver's avatar image
 * @property {Date | null} [hiredAt] - Updated date when the driver was hired
 * @property {boolean} [isActive] - Updated active employment status
 * @property {string | null} [licenseNumber] - Updated driver's license number
 * @property {string | null} [licenseCategory] - Updated license category
 * @property {Date | null} [licenseIssueDate] - Updated license issue date
 * @property {Date | null} [licenseExpiryDate] - Updated license expiry date
 * @property {string | null} [issuingAuthority] - Updated issuing authority
 * @property {boolean} [isSuspended] - Updated suspension status
 */
export interface UpdateDriverDTO {
	id: number;
	fullname?: string | null;
	phoneNumber?: string | null;
	avatar?: string | null;
	hiredAt?: Date | null;
	isActive?: boolean;
	licenseNumber?: string | null;
	licenseCategory?: string | null;
	licenseIssueDate?: Date | null;
	licenseExpiryDate?: Date | null;
	issuingAuthority?: string | null;
	isSuspended?: boolean;
}