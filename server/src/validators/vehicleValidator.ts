/**
 * Vehicle validation rules.
 *
 * This module contains validation middleware for vehicle operations
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
 * Validation rules for creating new vehicles.
 *
 * Comprehensive validation for vehicle creation including:
 * - Required number plate with format validation
 * - Required vehicle type ID as positive integer
 * - Optional manufacturer as string
 * - Optional model as string
 *
 * All fields are validated with appropriate sanitization and type conversion.
 */
export const validateCreateVehicle = [
	body("numberPlate")
		.notEmpty()
		.withMessage("Number plate is required")
		.isString()
		.withMessage("Number plate must be a string")
		.isLength({ min: 1, max: 20 })
		.withMessage("Number plate must be between 1 and 20 characters")
		.trim(), // Sanitize: remove extra spaces

	body("vehicleTypeId")
		.notEmpty()
		.withMessage("Vehicle type ID is required")
		.isInt({ min: 1 })
		.withMessage("Vehicle type ID must be a positive integer")
		.toInt(), // Convert to integer

	body("manufacturer")
		.optional()
		.isString()
		.withMessage("Manufacturer must be a string")
		.isLength({ min: 1, max: 50 })
		.withMessage("Manufacturer must be between 1 and 50 characters")
		.trim(),

	body("model")
		.optional()
		.isString()
		.withMessage("Model must be a string")
		.isLength({ min: 1, max: 50 })
		.withMessage("Model must be between 1 and 50 characters")
		.trim(),
];

/**
 * Validation rules for updating existing vehicles.
 *
 * Similar to creation validation but all fields are optional to allow
 * partial updates. Validates data integrity and format for vehicle
 * modifications without requiring all fields to be present.
 */
export const validateUpdateVehicle = [
	body("numberPlate")
		.optional()
		.isString()
		.withMessage("Number plate must be a string")
		.isLength({ min: 1, max: 20 })
		.withMessage("Number plate must be between 1 and 20 characters")
		.trim(),

	body("vehicleTypeId")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Vehicle type ID must be a positive integer")
		.toInt(),

	body("manufacturer")
		.optional()
		.isString()
		.withMessage("Manufacturer must be a string")
		.isLength({ min: 1, max: 50 })
		.withMessage("Manufacturer must be between 1 and 50 characters")
		.trim(),

	body("model")
		.optional()
		.isString()
		.withMessage("Model must be a string")
		.isLength({ min: 1, max: 50 })
		.withMessage("Model must be between 1 and 50 characters")
		.trim(),
];

