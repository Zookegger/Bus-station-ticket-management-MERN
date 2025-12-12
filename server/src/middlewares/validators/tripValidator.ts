/**
 * Trip validation rules.
 *
 * This module contains validation middleware for trip operations
 * including creation, updates, and parameter validation. Uses express-validator
 * to validate request bodies and parameters with comprehensive error messages.
 */

import { body, param, query } from "express-validator";
import { TripRepeatFrequency, TripStatus } from "@my_types/trip";

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

	body("returnStartTime")
		.optional({ nullable: true })
		.isISO8601()
		.withMessage("Return start time must be a valid ISO 8601 date")
		.toDate(),

	// Ensure endTime (if provided) is after startTime
	body("endTime")
		.optional()
		.isISO8601()
		.withMessage("End time must be a valid ISO 8601 date")
		.toDate()
		.custom((value, { req }) => {
			if (!value) return true;
			const start =
				req.body.startTime instanceof Date
					? req.body.startTime
					: new Date(req.body.startTime);
			const end = value instanceof Date ? value : new Date(value);
			if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
			return end > start;
		})
		.withMessage("End time must be after start time"),

	// Round trip flag and validations
	body("isRoundTrip")
		.optional()
		.isBoolean()
		.withMessage("isRoundTrip must be a boolean")
		.toBoolean(),
	body("returnEndTime")
		.optional()
		.isISO8601()
		.withMessage("Return end time must be a valid ISO 8601 date")
		.toDate()
		.custom((value, { req }) => {
			if (!value) return true;
			const rstart =
				req.body.returnStartTime instanceof Date
					? req.body.returnStartTime
					: new Date(req.body.returnStartTime);
			const rend = value instanceof Date ? value : new Date(value);
			if (isNaN(rstart.getTime()) || isNaN(rend.getTime())) return false;
			return rend > rstart;
		})
		.withMessage("Return end time must be after return start time"),

	body("price")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Price must be a positive number")
		.toFloat(),
	body("status")
		.optional()
		.isIn(Object.values(TripStatus))
		.withMessage(
			`Status must be one of: ${Object.values(TripStatus).join(", ")}`
		),

	// Template / recurrence
	body("isTemplate")
		.optional()
		.isBoolean()
		.withMessage("isTemplate must be a boolean")
		.toBoolean(),
	body("repeatFrequency")
		.optional()
		.isIn(Object.values(TripRepeatFrequency))
		.withMessage(
			`repeatFrequency must be one of: ${Object.values(
				TripRepeatFrequency
			).join(", ")}`
		),
	body("repeatEndDate")
		.optional({ nullable: true })
		.isISO8601()
		.withMessage("Repeat end date must be a valid ISO 8601 date")
		.toDate()
		.custom((value, { req }) => {
			if (!value) return true;
			const start =
				req.body.startTime instanceof Date
					? req.body.startTime
					: new Date(req.body.startTime);
			const rend = value instanceof Date ? value : new Date(value);
			if (isNaN(start.getTime()) || isNaN(rend.getTime())) return false;
			return rend >= start;
		})
		.withMessage("repeatEndDate must be on or after startTime"),
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

	// Ensure endTime (if provided) is after startTime when both present
	body("endTime")
		.optional()
		.isISO8601()
		.withMessage("End time must be a valid ISO 8601 date")
		.toDate()
		.custom((value, { req }) => {
			if (!value) return true;
			const start =
				req.body.startTime instanceof Date
					? req.body.startTime
					: new Date(req.body.startTime);
			const end = value instanceof Date ? value : new Date(value);
			if (req.body.startTime) {
				if (isNaN(start.getTime()) || isNaN(end.getTime()))
					return false;
				return end > start;
			}
			return true;
		})
		.withMessage("End time must be after start time"),

	body("returnStartTime")
		.optional({ nullable: true })
		.isISO8601()
		.withMessage("Return start time must be a valid ISO 8601 date")
		.toDate(),

	body("returnEndTime")
		.optional()
		.isISO8601()
		.withMessage("Return end time must be a valid ISO 8601 date")
		.toDate()
		.custom((value, { req }) => {
			if (!value) return true;
			const rstart =
				req.body.returnStartTime instanceof Date
					? req.body.returnStartTime
					: new Date(req.body.returnStartTime);
			const rend = value instanceof Date ? value : new Date(value);
			if (req.body.returnStartTime) {
				if (isNaN(rstart.getTime()) || isNaN(rend.getTime()))
					return false;
				return rend > rstart;
			}
			return true;
		})
		.withMessage("Return end time must be after return start time"),

	body("price")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Price must be a positive number")
		.toFloat(),

	body("status")
		.optional()
		.isIn(Object.values(TripStatus))
		.withMessage(
			`Status must be one of: ${Object.values(TripStatus).join(", ")}`
		),

	body("isTemplate")
		.optional()
		.isBoolean()
		.withMessage("isTemplate must be a boolean")
		.toBoolean(),
	body("repeatFrequency")
		.optional()
		.isIn(Object.values(TripRepeatFrequency))
		.withMessage(
			`repeatFrequency must be one of: ${Object.values(
				TripRepeatFrequency
			).join(", ")}`
		),
	body("repeatEndDate")
		.optional({ nullable: true })
		.isISO8601()
		.withMessage("Repeat end date must be a valid ISO 8601 date")
		.toDate()
		.custom((value, { req }) => {
			if (!value) return true;
			const start =
				req.body.startTime instanceof Date
					? req.body.startTime
					: new Date(req.body.startTime);
			const rend = value instanceof Date ? value : new Date(value);
			if (isNaN(start.getTime()) || isNaN(rend.getTime())) return false;
			return rend >= start;
		})
		.withMessage("repeatEndDate must be on or after startTime"),
];

/**
 * Validation rules for search/querying trips
 */
export const validateSearchTrip = [
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("page must be a positive integer")
		.toInt(),
	query("limit")
		.optional()
		.isInt({ min: 1 })
		.withMessage("limit must be a positive integer")
		.toInt(),
	query("date")
		.optional()
		.isISO8601()
		.withMessage("date must be a valid ISO 8601 date"),
	query("from").optional().isString().trim(),
	query("to").optional().isString().trim(),
	query("vehicleId").optional().isInt({ min: 1 }).toInt(),
	query("routeId").optional().isInt({ min: 1 }).toInt(),
	query("status")
		.optional()
		.isIn(Object.values(TripStatus))
		.withMessage(
			`status must be one of: ${Object.values(TripStatus).join(", ")}`
		),
	query("checkSeatAvailability")
		.optional()
		.isBoolean()
		.withMessage("checkSeatAvailability must be a boolean")
		.toBoolean(),
	query("minSeats")
		.optional()
		.isInt({ min: 1 })
		.withMessage("minSeats must be a positive integer")
		.toInt(),
];
