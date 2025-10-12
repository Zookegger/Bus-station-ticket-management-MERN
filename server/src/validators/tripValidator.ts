/**
 * Trip validation rules.
 *
 * This module contains validation middleware for trip operations
 * including creation, updates, and parameter validation. Uses express-validator
 * to validate request bodies and parameters with comprehensive error messages.
 */

import { body, param } from "express-validator";

/**
 * Validation rules for ID parameters in URL routes.
 *
 * Ensures that ID parameters are valid positive integers.
 * Used for routes that require an ID parameter (e.g., /:id).
 */
export const validateIdParam = [
	param("id")
		.isInt({ min: 1 })
		.withMessage("ID must be a positive integer")
		.toInt(),
];

/**
 * Validation rules for creating new trips.
 *
 * Comprehensive validation for trip creation including:
 * - Required vehicle ID as positive integer
 * - Required route ID as positive integer
 * - Required start time as valid ISO 8601 date
 * - Optional end time as valid ISO 8601 date
 * - Optional price as positive number
 * - Optional status as one of allowed values
 *
 * All fields are validated with appropriate sanitization and type conversion.
 */
export const validateCreateTrip = [
	body("vehicleId")
		.notEmpty()
		.withMessage("Vehicle ID is required")
		.isInt({ min: 1 })
		.withMessage("Vehicle ID must be a positive integer")
		.toInt(),

	body("routeId")
		.notEmpty()
		.withMessage("Route ID is required")
		.isInt({ min: 1 })
		.withMessage("Route ID must be a positive integer")
		.toInt(),

	body("startTime")
		.notEmpty()
		.withMessage("Start time is required")
		.isISO8601()
		.withMessage("Start time must be a valid ISO 8601 date")
		.toDate(),

	body("endTime")
		.optional()
		.isISO8601()
		.withMessage("End time must be a valid ISO 8601 date")
		.toDate(),

	body("price")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Price must be a positive number")
		.toFloat(),

	body("status")
		.optional()
		.isIn(["Scheduled", "Departed", "Completed", "Cancelled"])
		.withMessage(
			"Status must be one of: Scheduled, Departed, Completed, Cancelled"
		),
];

/**
 * Validation rules for updating existing trips.
 *
 * Similar to creation validation but all fields are optional to allow
 * partial updates. Validates data integrity and format for trip
 * modifications without requiring all fields to be present.
 */
export const validateUpdateTrip = [
	body("vehicleId")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Vehicle ID must be a positive integer")
		.toInt(),

	body("routeId")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Route ID must be a positive integer")
		.toInt(),

	body("startTime")
		.optional()
		.isISO8601()
		.withMessage("Start time must be a valid ISO 8601 date")
		.toDate(),

	body("endTime")
		.optional()
		.isISO8601()
		.withMessage("End time must be a valid ISO 8601 date")
		.toDate(),

	body("price")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Price must be a positive number")
		.toFloat(),

	body("status")
		.optional()
		.isIn(["Scheduled", "Departed", "Completed", "Cancelled"])
		.withMessage(
			"Status must be one of: Scheduled, Departed, Completed, Cancelled"
		),
];
