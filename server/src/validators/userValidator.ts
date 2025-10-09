/**
 * User data validation rules.
 *
 * This module contains validation middleware for user profile operations
 * including user information validation and profile updates. Uses
 * express-validator to validate request bodies and provide meaningful
 * error messages for user data fields.
 */

import { body } from "express-validator";

/**
 * Validation rule for gender field.
 *
 * Accepts optional gender values from predefined list: male, female, other.
 * Throws error for invalid gender values.
 */
const genderValidator = body("gender")
	.optional()
	.custom((value) => {
		const genders = ["male", "female", "other"];
		if (value && !genders.includes(value)) {
			throw new Error("Invalid Gender");
		}
		return true;
	});

/**
 * Validation rule for date of birth field.
 *
 * Validates optional date of birth in valid date format.
 */
const dateOfBirthValidator = body("dateOfBirth")
	.optional()
	.isDate()
	.withMessage("Birthday must be in valid date format");

/**
 * Validation rule for address field.
 *
 * Validates optional address as a string value.
 */
const addressValidator = body("address")
	.optional()
	.isString()
	.withMessage("Address must be a string");

/**
 * Validation rule for avatar field.
 *
 * Validates optional avatar URL format.
 */
const avatarValidator = body("avatar")
	.optional()
	.isURL()
	.withMessage("Avatar must be a valid URL");

/**
 * Validation rule for phone number field.
 *
 * Validates optional phone number using mobile phone validation.
 */
const phoneValidator = body("phoneNumber")
	.optional()
	.isMobilePhone("any")
	.withMessage("Phone number must be valid");

/**
 * Validation rules for complete user information.
 *
 * Used when creating or validating full user profiles.
 * Requires fullName, validates optional profile fields.
 */
export const userInfoValidation = [
	body("fullName").notEmpty().withMessage("Fullname is required"),
	genderValidator,
	dateOfBirthValidator,
	addressValidator,
	avatarValidator,
	phoneValidator,
];

/**
 * Validation rules for profile update operations.
 *
 * Used when updating user profile information.
 * All fields are optional to allow partial updates.
 */
export const updateProfileValidation = [
	body("fullName")
		.optional()
		.isString()
		.withMessage("Fullname must be a string"),
	genderValidator,
	dateOfBirthValidator,
	addressValidator,
	avatarValidator,
	phoneValidator,
];
