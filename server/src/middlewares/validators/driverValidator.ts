/**
 * Driver data validation rules.
 *
 * This module contains validation middleware for driver operations
 * including driver creation, updates, and parameter validation.
 * Uses express-validator to validate request bodies and provide meaningful
 * error messages for driver data fields.
 */

import { body, param } from "express-validator";

/**
 * Validation rule for id field.
 *
 * Validates required driver's id as a positive integer that identifies the driver record.
 */
const driverIdValidator = body("id")
	.isInt({ min: 1 })
	.withMessage("Driver ID must be a positive integer");

/**
 * Validation rule for fullname field.
 *
 * Validates optional fullname as a string with maximum length.
 */
const fullnameValidator = body("fullname")
	.optional()
	.isString()
	.withMessage("Full name must be a string")
	.isLength({ max: 100 })
	.withMessage("Full name must not exceed 100 characters");

/**
 * Validation rule for phone number field.
 *
 * Validates optional phone number using mobile phone validation with max length.
 */
const phoneValidator = body("phoneNumber")
	.optional()
	.isMobilePhone("any")
	.withMessage("Phone number must be valid")
	.isLength({ max: 16 })
	.withMessage("Phone number must not exceed 16 characters");

/**
 * Validation rule for avatar field.
 *
 * Validates optional avatar URL format with maximum length.
 */
const avatarValidator = body("avatar")
	.optional()
	.isURL()
	.withMessage("Avatar must be a valid URL")
	.isLength({ max: 255 })
	.withMessage("Avatar URL must not exceed 255 characters");

/**
 * Validation rule for hired date field.
 *
 * Validates optional hire date in valid date format.
 */
const hiredAtValidator = body("hiredAt")
	.optional()
	.isDate()
	.withMessage("Hired date must be in valid date format");

/**
 * Validation rule for active status field.
 *
 * Validates optional boolean value for active employment status.
 */
const isActiveValidator = body("isActive")
	.optional()
	.isBoolean()
	.withMessage("Active status must be a boolean value");

/**
 * Validation rule for license number field.
 *
 * Validates optional license number as a string with maximum length.
 */
const licenseNumberValidator = body("licenseNumber")
	.optional()
	.isString()
	.withMessage("License number must be a string")
	.isLength({ max: 64 })
	.withMessage("License number must not exceed 64 characters");

/**
 * Validation rule for license category field.
 *
 * Validates optional license category as a string with maximum length.
 */
const licenseCategoryValidator = body("licenseCategory")
	.optional()
	.isString()
	.withMessage("License category must be a string")
	.isLength({ max: 32 })
	.withMessage("License category must not exceed 32 characters");

/**
 * Validation rule for license issue date field.
 *
 * Validates optional license issue date in valid date format.
 */
const licenseIssueDateValidator = body("licenseIssueDate")
	.optional()
	.isDate()
	.withMessage("License issue date must be in valid date format");

/**
 * Validation rule for license expiry date field.
 *
 * Validates optional license expiry date in valid date format.
 */
const licenseExpiryDateValidator = body("licenseExpiryDate")
	.optional()
	.isDate()
	.withMessage("License expiry date must be in valid date format");

/**
 * Validation rule for issuing authority field.
 *
 * Validates optional issuing authority as a string with maximum length.
 */
const issuingAuthorityValidator = body("issuingAuthority")
	.optional()
	.isString()
	.withMessage("Issuing authority must be a string")
	.isLength({ max: 100 })
	.withMessage("Issuing authority must not exceed 100 characters");

/**
 * Validation rule for suspension status field.
 *
 * Validates optional boolean value for license suspension status.
 */
const isSuspendedValidator = body("isSuspended")
	.optional()
	.isBoolean()
	.withMessage("Suspension status must be a boolean value");

/**
 * Validation rules for creating a new driver.
 *
 * Used when creating new driver records.
 * Requires id, validates optional driver information fields.
 */
export const createDriverValidation = [
	fullnameValidator,
	phoneValidator,
	avatarValidator,
	hiredAtValidator,
	isActiveValidator,
	licenseNumberValidator,
	licenseCategoryValidator,
	licenseIssueDateValidator,
	licenseExpiryDateValidator,
	issuingAuthorityValidator,
	isSuspendedValidator,
];

/**
 * Validation rules for updating an existing driver.
 *
 * Used when updating driver information.
 * Requires driverId to identify the driver, all other fields are optional.
 */
export const updateDriverValidation = [
	driverIdValidator,
	fullnameValidator,
	phoneValidator,
	avatarValidator,
	hiredAtValidator,
	isActiveValidator,
	licenseNumberValidator,
	licenseCategoryValidator,
	licenseIssueDateValidator,
	licenseExpiryDateValidator,
	issuingAuthorityValidator,
	isSuspendedValidator,
];

/**
 * Validation rules for driver ID parameters in URL routes.
 *
 * Ensures that userId parameters are valid positive integers.
 * Used for routes that require a driver ID parameter (e.g., /:id).
 */
export const validateDriverIdParam = [
	param("id")
		.isInt({ min: 0 })
		.withMessage("Driver ID must be a positive integer")
		.toInt(),
];
