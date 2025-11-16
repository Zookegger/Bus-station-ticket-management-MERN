/**
 * Vehicle type validation rules.
 *
 * This module contains validation middleware for vehicle type operations
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
 * Validation rules for creating new vehicle types.
 *
 * Comprehensive validation for vehicle type creation including:
 * - Required name with length and format validation
 * - Optional price as non-negative integer
 * - Optional total floors (1-2)
 * - Optional total columns as positive integer
 * - Optional total seats as positive integer
 * - Optional rows/seats per floor as strings
 *
 * All fields are validated with appropriate sanitization and type conversion.
 */
export const validateCreateVehicleType = [
	body("name")
		.notEmpty()
		.withMessage("Name is required")
		.isString()
		.withMessage("Name must be a string")
		.isLength({ min: 2, max: 50 })
		.withMessage("Name must be between 2 and 50 characters")
		.trim(), // Sanitize: remove extra spaces

	body("price")
		.optional()
		.isInt({ min: 0 })
		.withMessage("Price must be a non-negative integer")
		.toInt(), // Convert to integer

	body("totalFloors")
		.optional()
		.isInt({ min: 1, max: 2 })
		.withMessage("Total floors must be 1 or 2")
		.toInt(),

	body("totalSeats")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Total seats must be a positive integer")
		.toInt(),

	body("seatLayout")
		.optional()
		.isString()
		.withMessage("Seat layout must be a stringified JSON.")
		.custom((value) => {
			try {
				const layout = JSON.parse(value);
				if (!Array.isArray(layout)) {
					throw new Error("Seat layout must be an array of floors.");
				}
				for (const floor of layout) {
					if (!Array.isArray(floor)) {
						throw new Error("Each floor in the layout must be an array of rows.");
					}
					for (const row of floor) {
						if (!Array.isArray(row)) {
							throw new Error("Each row must be an array of seat types.");
						}
						for (const seat of row) {
							if (!['available', 'aisle', 'disabled', 'occupied'].includes(seat)) {
								throw new Error(`Invalid seat type: ${seat}`);
							}
						}
					}
				}
				return true;
			} catch (e) {
				throw new Error("Seat layout must be a valid JSON string.");
			}
		}),
];

/**
 * Validation rules for updating existing vehicle types.
 *
 * Similar to creation validation but all fields are optional to allow
 * partial updates. Validates data integrity and format for vehicle type
 * modifications without requiring all fields to be present.
 */
export const validateUpdateVehicleType = [
	body("name")
		.optional()
		.isString()
		.withMessage("Name must be a string")
		.isLength({ min: 2, max: 50 })
		.withMessage("Name must be between 2 and 50 characters")
		.trim(),

	body("price")
		.optional()
		.isInt({ min: 0 })
		.withMessage("Price must be a non-negative integer")
		.toInt(),

	body("totalFloors")
		.optional()
		.isInt({ min: 1, max: 2 })
		.withMessage("Total floors must be 1 or 2")
		.toInt(),

	body("totalSeats")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Total seats must be a positive integer")
		.toInt(),

	body("seatLayout")
		.optional()
		.isString()
		.withMessage("Seat layout must be a stringified JSON.")
		.custom((value) => {
			try {
				const layout = JSON.parse(value);
				if (!Array.isArray(layout)) {
					throw new Error("Seat layout must be an array of floors.");
				}
				for (const floor of layout) {
					if (!Array.isArray(floor)) {
						throw new Error("Each floor in the layout must be an array of rows.");
					}
					for (const row of floor) {
						if (!Array.isArray(row)) {
							throw new Error("Each row must be an array of seat types.");
						}
						for (const seat of row) {
							if (!['available', 'aisle', 'disabled', 'occupied'].includes(seat)) {
								throw new Error(`Invalid seat type: ${seat}`);
							}
						}
					}
				}
				return true;
			} catch (e) {
				throw new Error("Seat layout must be a valid JSON string.");
			}
		}),
];
