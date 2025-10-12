/**
 * Route validation rules.
 *
 * This module contains validation middleware for route operations
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
 * Validation rules for creating new routes.
 *
 * Comprehensive validation for route creation including:
 * - Required start location ID as positive integer
 * - Required destination location ID as positive integer
 * - Optional distance as positive number
 * - Optional duration as positive number
 * - Optional price as positive number
 *
 * All fields are validated with appropriate sanitization and type conversion.
 */
export const validateCreateRoute = [
	body("startId")
		.notEmpty()
		.withMessage("Start location ID is required")
		.isInt({ min: 1 })
		.withMessage("Start location ID must be a positive integer")
		.toInt(),

	body("destinationId")
		.notEmpty()
		.withMessage("Destination location ID is required")
		.isInt({ min: 1 })
		.withMessage("Destination location ID must be a positive integer")
		.toInt(),

	body("distance")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Distance must be a positive number")
		.toFloat(),

	body("duration")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Duration must be a positive number")
		.toFloat(),

	body("price")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Price must be a positive number")
		.toFloat(),
];

/**
 * Validation rules for updating existing routes.
 *
 * Similar to creation validation but all fields are optional to allow
 * partial updates. Validates data integrity and format for route
 * modifications without requiring all fields to be present.
 */
export const validateUpdateRoute = [
	body("startId")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Start location ID must be a positive integer")
		.toInt(),

	body("destinationId")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Destination location ID must be a positive integer")
		.toInt(),

	body("distance")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Distance must be a positive number")
		.toFloat(),

	body("duration")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Duration must be a positive number")
		.toFloat(),

	body("price")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Price must be a positive number")
		.toFloat(),
];
