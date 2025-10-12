/**
 * Trip routes configuration.
 *
 * This module defines RESTful routes for comprehensive trip management operations
 * including advanced filtering, CRUD operations, and search functionality.
 * All routes include proper error handling and validation middleware.
 */

import { Router } from "express";
import { isAdmin } from "../../middlewares/auth";
import { csrfProtectionRoute } from "../../middlewares/csrf";
import { errorHandler } from "../../middlewares/errorHandler";
import { handleValidationResult } from "../../middlewares/validateRequest";
import * as tripController from "../../controllers/tripController";
import * as tripValidator from "../../validators/tripValidator";

/**
 * Trip management router instance.
 *
 * Handles trip-related operations with full CRUD support:
 * - GET /: Advanced search and filtering with pagination
 * - GET /search: Alternative search endpoint
 * - GET /:id: Retrieve specific trip by ID
 * - POST /: Create new trip
 * - PUT /:id: Update existing trip
 * - DELETE /:id: Remove trip
 */
const tripRoutes = Router();

// GET /trips - Advanced search with filtering and pagination
tripRoutes.get("/", tripController.SearchTrip, errorHandler);

// GET /trips/search - Alternative search endpoint
tripRoutes.get("/search", tripController.SearchTrip, errorHandler);

// GET /trips/:id - Get trip by ID
tripRoutes.get(
	"/:id",
	tripValidator.validateIdParam,
	handleValidationResult,
	tripController.GetTripById,
	errorHandler
);

// POST /trips - Create new trip
tripRoutes.post(
	"/",
	csrfProtectionRoute,
	tripValidator.validateCreateTrip,
	handleValidationResult,
	tripController.AddTrip,
	errorHandler
);

// PUT /trips/:id - Update trip by ID
tripRoutes.put(
	"/:id",
	csrfProtectionRoute,
	tripValidator.validateIdParam,
	tripValidator.validateUpdateTrip,
	handleValidationResult,
	tripController.UpdateTrip,
	errorHandler
);

// DELETE /trips/:id - Delete trip by ID
tripRoutes.delete(
	"/:id",
	csrfProtectionRoute,
	tripValidator.validateIdParam,
	handleValidationResult,
	tripController.DeleteTrip,
	errorHandler
);

export default tripRoutes;
