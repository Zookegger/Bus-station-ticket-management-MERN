/**
 * Trip routes configuration.
 *
 * This module defines RESTful routes for comprehensive trip management operations
 * including advanced filtering, CRUD operations, and search functionality.
 * All routes include proper error handling and validation middleware.
 */

import { Router } from "express";
import { csrfAdminProtectionRoute } from "@middlewares/csrf";
import { errorHandler } from "@middlewares/errorHandler";
import { handleValidationResult } from "@middlewares/validateRequest";
import * as tripController from "@controllers/tripController";
import * as tripValidator from "@middlewares/validators/tripValidator";

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
const tripRouter = Router();

// GET /trips - Advanced search with filtering and pagination
tripRouter.get("/", tripController.SearchTrip, errorHandler);

// GET /trips/search - Alternative search endpoint
tripRouter.get("/search", tripController.SearchTrip, errorHandler);

// GET /trips/:id - Get trip by ID
tripRouter.get(
	"/:id",
	tripValidator.validateIdParam,
	handleValidationResult,
	tripController.GetTripById,
	errorHandler
);

// POST /trips - Create new trip
tripRouter.post(
	"/",
	csrfAdminProtectionRoute,
	tripValidator.validateCreateTrip,
	handleValidationResult,
	tripController.AddTrip,
	errorHandler
);

// PUT /trips/:id - Update trip by ID
tripRouter.put(
	"/:id",
	csrfAdminProtectionRoute,
	tripValidator.validateIdParam,
	tripValidator.validateUpdateTrip,
	handleValidationResult,
	tripController.UpdateTrip,
	errorHandler
);

// DELETE /trips/:id - Delete trip by ID
tripRouter.delete(
	"/:id",
	csrfAdminProtectionRoute,
	tripValidator.validateIdParam,
	handleValidationResult,
	tripController.DeleteTrip,
	errorHandler
);

export default tripRouter;
