/**
 * User data validation rules.
 *
 * This module contains validation middleware for user profile operations
 * including user registration, information validation, and profile updates.
 * Uses express-validator to validate request bodies and provide meaningful
 * error messages for user data fields.
 */

import { body, param } from "express-validator";

/**
 * Validation rule for email field.
 *
 * Validates required email format and normalizes it to lowercase.
 */
const emailValidator = body("email")
	.isEmail()
	.withMessage("Email must be valid")
	.normalizeEmail();

/**
 * Validation rule for username field.
 *
 * Validates required username as a string with minimum length.
 */
const userNameValidator = body("userName")
	.isString()
	.withMessage("Username must be a string")
	.isLength({ min: 3 })
	.withMessage("Username must be at least 3 characters long");

/**
 * Validation rule for full name field.
 *
 * Validates optional full name as a string.
 */
const fullNameValidator = body("fullName")
	.optional()
	.isString()
	.withMessage("Full name must be a string");

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
 * Validation rule for role field.
 *
 * Validates required role from predefined list: User, Admin, Operator.
 */
const roleValidator = body("role")
	.custom((value) => {
		const roles = ["User", "Admin", "Operator"];
		if (!roles.includes(value)) {
			throw new Error("Invalid role. Must be User, Admin, or Operator");
		}
		return true;
	});

/**
 * Validation rule for password field.
 *
 * Validates required password with minimum length and strength requirements.
 */
const passwordValidator = body("password")
	.isLength({ min: 6 })
	.withMessage("Password must be at least 6 characters long");

/**
 * Validation rule for confirm password field.
 *
 * Validates that confirm password matches the password field.
 */
const confirmPasswordValidator = body("confirmPassword")
	.custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error("Password confirmation does not match password");
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
 * Requires email, userName, and role; validates optional profile fields.
 */
export const userInfoValidation = [
	emailValidator,
	userNameValidator,
	fullNameValidator,
	roleValidator,
	genderValidator,
	dateOfBirthValidator,
	addressValidator,
	avatarValidator,
	phoneValidator,
];

/**
 * Validation rules for user registration.
 *
 * Used during user registration process.
 * Requires username, email, password, and password confirmation.
 */
export const userRegistrationValidation = [
	userNameValidator,
	emailValidator,
	passwordValidator,
	confirmPasswordValidator,
];

/**
 * Validation rules for user login.
 *
 * Used during login process.
 * Requires username/email and password.
 */
export const userLoginValidation = [
	body("username")
		.isString()
		.withMessage("Username must be a string"),
	body("password")
		.notEmpty()
		.withMessage("Password is required"),
];

/**
 * Validation rules for ID parameters in URL routes.
 *
 * Ensures that ID parameters are valid UUIDs.
 * Used for routes that require an ID parameter (e.g., /:id).
 */
export const validateUserIdParam = [
	param("id")
		.isUUID()
		.withMessage("ID must be a valid UUID"),
];

/**
 * Validation rules for profile update operations.
 *
 * Used when updating user profile information.
 * All fields are optional to allow partial updates.
 */
export const updateProfileValidation = [
	body("email")
		.optional()
		.isEmail()
		.withMessage("Email must be valid")
		.normalizeEmail(),
	fullNameValidator,
	genderValidator,
	dateOfBirthValidator,
	addressValidator,
	avatarValidator,
	phoneValidator,
];
