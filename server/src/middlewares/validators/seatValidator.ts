/**
 * Seat validation rules.
 *
 * This module contains validation middleware for seat operations
 * including state updates and parameter validation. Uses express-validator
 * to validate request bodies and parameters with comprehensive error messages.
 */

import { body } from "express-validator";

/**
 * Validation rules for updating existing seats.
 *
 * Validates seat state updates including availability, active status,
 * and trip assignment. All fields are optional to allow partial updates.
 * Ensures data integrity and business rule compliance.
 */
export const validateUpdateSeat = [
	body("isAvailable")
		.optional()
		.isBoolean()
		.withMessage("isAvailable must be a boolean value")
		.toBoolean(),

	body("isActive")
		.optional()
		.isBoolean()
		.withMessage("isActive must be a boolean value")
		.toBoolean(),

	body("tripId")
		.optional()
		.custom((value) => {
			// Allow null or positive integer
			if (value === null) return true;
			if (typeof value === 'number' && value > 0) return true;
			if (typeof value === 'string' && !isNaN(Number(value)) && Number(value) > 0) return true;
			throw new Error("tripId must be a positive integer or null");
		})
		.customSanitizer((value) => {
			// Convert to number or keep as null
			if (value === null) return null;
			return parseInt(value);
		}),
];