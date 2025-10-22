/**
 * Route routes configuration.
 *
 * This module defines RESTful routes for comprehensive route management operations
 * including advanced filtering, CRUD operations, and search functionality.
 * All routes include proper error handling and validation middleware.
 */

import { Router } from "express";
import { csrfAdminProtectionRoute } from "@middlewares/csrf";
import { errorHandler } from "@middlewares/errorHandler";
import { handleValidationResult } from "@middlewares/validateRequest";
import * as routeController from "@controllers/routeController";
import * as routeValidator from "@middlewares/validators/routeValidator";

/**
 * Route management router instance.
 *
 * Handles route-related operations with full CRUD support:
 * - GET /: Advanced search and filtering with pagination
 * - GET /search: Alternative search endpoint
 * - GET /:id: Retrieve specific route by ID
 * - POST /: Create new route
 * - PUT /:id: Update existing route
 * - DELETE /:id: Remove route
 */
const routeRoutes = Router();

// GET /routes - Advanced search with filtering and pagination
routeRoutes.get("/", routeController.SearchRoute, errorHandler);

// GET /routes/search - Alternative search endpoint
routeRoutes.get("/search", routeController.SearchRoute, errorHandler);

// GET /routes/:id - Get route by ID
routeRoutes.get(
	"/:id",
	routeValidator.validateIdParam,
	handleValidationResult,
	routeController.GetRouteById,
	errorHandler
);

// POST /routes - Create new route
routeRoutes.post(
	"/",
	csrfAdminProtectionRoute,
	routeValidator.validateCreateRoute,
	handleValidationResult,
	routeController.AddRoute,
	errorHandler
);

// PUT /routes/:id - Update route by ID
routeRoutes.put(
	"/:id",
	csrfAdminProtectionRoute,
	routeValidator.validateIdParam,
	routeValidator.validateUpdateRoute,
	handleValidationResult,
	routeController.UpdateRoute,
	errorHandler
);

// DELETE /routes/:id - Delete route by ID
routeRoutes.delete(
	"/:id",
	csrfAdminProtectionRoute,
	routeValidator.validateIdParam,
	handleValidationResult,
	routeController.DeleteRoute,
	errorHandler
);

export default routeRoutes;
