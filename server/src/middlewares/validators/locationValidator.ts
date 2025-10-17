/**
 * Location data validation rules.
 *
 * This module contains validation middleware for location operations
 * including location creation, updates, and retrieval. Uses express-validator
 * to validate request bodies and provide meaningful error messages for location data fields.
 */

import { body, param, query } from "express-validator";

/**
 * Validation rule for location name field.
 *
 * Validates required name as a non-empty string with minimum length.
 */
const nameValidator = body("name")
	.isString()
	.withMessage("Name must be a string")
	.notEmpty()
	.withMessage("Name is required")
	.isLength({ min: 2 })
	.withMessage("Name must be at least 2 characters long");

/**
 * Validation rule for location address field.
 *
 * Validates optional address as a string.
 */
const addressValidator = body("address")
	.optional()
	.isString()
	.withMessage("Address must be a string");

/**
 * Validation rule for latitude coordinate field.
 *
 * Validates optional latitude as a number within valid range (-90 to 90).
 */
const latitudeValidator = body("latitude")
	.optional()
	.isFloat({ min: -90, max: 90 }) // Min, Max for North and South
	.withMessage("Latitude must be a number between -90 and 90");

/**
 * Validation rule for longitude coordinate field.
 *
 * Validates optional longitude as a number within valid range (-180 to 180).
 */
const longitudeValidator = body("longitude")
	.optional()
	.isFloat({ min: -180, max: 180 })  // Min, Max for East and West
	.withMessage("Longitude must be a number between -180 and 180");

/**
 * Validation rule for ID parameters in URL routes.
 *
 * Ensures that ID parameters are valid integers.
 * Used for routes that require an ID parameter (e.g., /:id).
 */
export const validateLocationIdParam = [
	param("id")
		.isInt({ min: 1 })
		.withMessage("ID must be a positive integer"),
];

/**
 * Validation rules for creating a new location.
 *
 * Used when adding new locations to the system.
 * Requires name; address and coordinates are optional.
 */
export const createLocationValidation = [
	nameValidator,
	addressValidator,
	latitudeValidator,
	longitudeValidator,
];

/**
 * Validation rules for updating an existing location.
 *
 * Used when modifying location information.
 * All fields are optional to allow partial updates.
 */
export const updateLocationValidation = [
	body("name")
		.optional()
		.isString()
		.withMessage("Name must be a string")
		.notEmpty()
		.withMessage("Name cannot be empty")
		.isLength({ min: 2 })
		.withMessage("Name must be at least 2 characters long"),
	addressValidator,
	latitudeValidator,
	longitudeValidator,
];

/**
 * Validation rules for location search queries.
 *
 * Used for filtering and searching locations.
 * Validates optional query parameters for search operations.
 */
export const searchLocationValidation = [
	query("keywords")
		.optional()
		.isString()
		.withMessage("Keywords must be a string"),
	query("orderBy")
		.optional()
		.isIn(["createdAt", "name", "address"])
		.withMessage("OrderBy must be one of: createdAt, name, address"),
	query("sortOrder")
		.optional()
		.isIn(["ASC", "DESC"])
		.withMessage("SortOrder must be ASC or DESC"),
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Page must be a positive integer"),
	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("Limit must be between 1 and 100"),
];

/**
 * Validation rules for retrieving location by coordinates.
 *
 * Used for GET requests with latitude and longitude parameters.
 * Validates that coordinates are valid numbers within proper ranges.
 */
export const getLocationByCoordinatesValidation = [
	param("lat")
		.isFloat({ min: -90, max: 90 })
		.withMessage("Latitude must be a number between -90 and 90"),
	param("lon")
		.isFloat({ min: -180, max: 180 })
		.withMessage("Longitude must be a number between -180 and 180"),
];