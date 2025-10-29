/**
 * Location routes configuration.
 *
 * This module defines all routes related to location management including
 * creating, updating, deleting, and retrieving location records. It applies
 * validation middleware, authentication, and error handling to ensure secure
 * and reliable location operations.
 */

import { Router } from "express";
import * as locationValidators from "@middlewares/validators/locationValidator";
import * as locationController from "@controllers/locationController";
import { errorHandler } from "@middlewares/errorHandler";
import { handleValidationResult } from "@middlewares/validateRequest";
import { csrfAdminProtectionRoute } from "@middlewares/csrf";

/**
 * Location router instance.
 *
 * Handles all location-related HTTP requests with proper validation,
 * authentication, and error handling middleware applied to each route.
 */
const locationRouter = Router();

// GET /locations - Search locations with filtering and pagination
locationRouter.get(
	"/",
	locationValidators.searchLocationValidation,
	handleValidationResult,
	locationController.searchLocation,
	errorHandler
);

// GET /locations/search - Advanced location search with query parameters
locationRouter.get(
	"/search",
	locationValidators.searchLocationValidation,
	handleValidationResult,
	locationController.searchLocation,
	errorHandler
);

// GET /locations/:id - Retrieve a specific location by ID
locationRouter.get(
	"/:id",
	locationValidators.validateLocationIdParam,
	handleValidationResult,
	locationController.GetLocationById,
	errorHandler
);

// GET /locations/:lat/:lon - Retrieve locations by coordinates
locationRouter.get(
	"/:lat/:lon",
	locationValidators.getLocationByCoordinatesValidation,
	handleValidationResult,
	locationController.GetLocationByCoordinates,
	errorHandler
);

// POST /locations - Create a new location (Admin only)
locationRouter.post(
	"/",
	csrfAdminProtectionRoute,
	locationValidators.createLocationValidation,
	handleValidationResult,
	locationController.AddLocation,
	errorHandler
);

// PUT /locations/:id - Update an existing location (Admin only)
locationRouter.put(
	"/:id",
	csrfAdminProtectionRoute,
	locationValidators.validateLocationIdParam,
	locationValidators.updateLocationValidation,
	handleValidationResult,
	locationController.UpdateLocation,
	errorHandler
);

// DELETE /locations/:id - Delete a location by ID (Admin only)
locationRouter.delete(
	"/:id",
	csrfAdminProtectionRoute,
	locationValidators.validateLocationIdParam,
	handleValidationResult,
	locationController.DeleteLocation,
	errorHandler
);

export default locationRouter;
