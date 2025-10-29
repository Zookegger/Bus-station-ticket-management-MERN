/**
 * Authentication validation rules.
 *
 * This module contains validation middleware for authentication-related
 * operations including login and registration. Uses express-validator
 * to validate request bodies and provide meaningful error messages.
 */

import { body, param } from "express-validator";

/**
 * Validation rules for user login.
 *
 * Validates that login credentials (username/email and password) are provided.
 * Used in login endpoint to ensure required fields are present before
 * authentication processing.
 */
export const loginValidation = [
	body("login").notEmpty().withMessage("Username or email is required"),
	body("password").notEmpty().withMessage("Password is required"),
];

/**
 * Validation rules for user registration.
 *
 * Comprehensive validation for new user registration including:
 * - Username presence
 * - Strong password requirements (length, numbers, letters, complexity)
 * - Password confirmation matching
 * - Valid email format
 *
 * Used in registration endpoint to validate user input before account creation.
 */
export const registerValidation = [
	body("username").notEmpty().withMessage("Username is required"),
	body("password")
		.notEmpty()
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/\d/)
		.withMessage("Password must contain a number")
		.matches(/[a-zA-Z]/)
		.withMessage("Password must contain a letter")
		.isStrongPassword()
		.withMessage("Password is not strong enough"),
	body("confirmPassword")
		.notEmpty()
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("Passwords do not match");
			}
			return true;
		}),
	body("email")
		.notEmpty()
		.withMessage("Email is required")
		.normalizeEmail()
		.isEmail()
		.withMessage("Email must be in valid email format"),
];

/**
 * Validation rules for forgot password request.
 *
 * Validates that email is provided and in valid format.
 * Used in forgot password endpoint to ensure email is present before
 * sending reset link.
 */
export const forgotPasswordValidation = [
	body("email")
		.notEmpty()
		.withMessage("Email is required")
		.normalizeEmail()
		.isEmail()
		.withMessage("Email must be in valid email format"),
];

/**
 * Validation rules for password reset.
 *
 * Validates reset token, new password strength, and confirmation matching.
 * Used in reset password endpoint to ensure secure password update.
 */
export const resetPasswordValidation = [
	param("token").notEmpty().withMessage("Reset token is required"),
	body("newPassword")
		.notEmpty()
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/\d/)
		.withMessage("Password must contain a number")
		.matches(/[a-zA-Z]/)
		.withMessage("Password must contain a letter")
		.isStrongPassword()
		.withMessage("Password is not strong enough"),
	body("newConfirmPassword")
		.notEmpty()
		.custom((value, { req }) => {
			if (value !== req.body.newPassword) {
				throw new Error("Passwords do not match");
			}
			return true;
		}),
];

/**
 * Validation rules for user logout.
 *
 * Validates that refresh token is provided and in valid JWT format.
 * Used in logout endpoint to ensure token is present before revocation.
 */
export const logoutValidation = [
	body("refreshToken")
		.notEmpty()
		.withMessage("Refresh token is required")
		.isString()
		.withMessage("Refresh token must be a valid string")
		.isLength({ min: 10 })
		.withMessage("Refresh token appears to be invalid"),
];

export const changePasswordValidation = [
	param("id")
		.trim()
		.notEmpty()
		.withMessage("User ID is required")
		.isUUID(4)
		.withMessage("User ID must be a valid UUID"),

	body("userId")
		.optional()
		.isUUID(4)
		.withMessage("userId must be a valid UUID"),

	body("currentPassword")
		.notEmpty()
		.withMessage("Current password is required")
		.trim(),

	body("newPassword")
		.notEmpty()
		.withMessage("New password is required")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/\d/)
		.withMessage("Password must contain a number")
		.matches(/[a-zA-Z]/)
		.withMessage("Password must contain a letter")
		.isStrongPassword()
		.withMessage("Password is not strong enough")
		.custom((value, { req }) => {
			if (value === req.body.currentPassword) {
				throw new Error(
					"New password must be different from the current password"
				);
			}
			return true;
		})
		.trim(),

	body("confirmNewPassword")
		.notEmpty()
		.withMessage("Please confirm your new password")
		.custom((value, { req }) => {
			if (value !== req.body.newPassword) {
				throw new Error("Passwords do not match");
			}
			return true;
		})
		.trim(),
];

export const getCsrfTokenValidator = [
	body("accessToken").isEmpty().withMessage("Access Token is required"),
];
