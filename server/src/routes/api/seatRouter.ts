/**
 * Seat routes configuration.
 *
 * This module defines RESTful routes for seat management operations
 * including retrieval and state updates. Seat creation and deletion
 * are not handled here as they occur automatically during trip creation
 * and are prohibited for data integrity reasons.
 */

import { Router } from "express";
import { csrfAdminProtectionRoute } from "@middlewares/csrf";
import { errorHandler } from "@middlewares/errorHandler";
import { handleValidationResult } from "@middlewares/validateRequest";
import * as seatController from "@controllers/seatController";
import * as seatValidator from "@middlewares/validators/seatValidator";
import * as routeValidator from "@middlewares/validators/routeValidator"; // Reuse validateIdParam

/**
 * Seat management router instance.
 *
 * Handles seat-related operations with read and update support:
 * - GET /: Advanced search and filtering with pagination
 * - GET /:id: Retrieve specific seat by ID
 * - PUT /:id: Update seat state (availability, active status, trip assignment)
 */
const seatRouter = Router();

// GET /seats - Advanced search with filtering and pagination
seatRouter.get("/", seatController.SearchSeat, errorHandler);

// GET /seats/:id - Get seat by ID
seatRouter.get(
	"/:id",
	routeValidator.validateIdParam, // Reuse existing ID validation
	handleValidationResult,
	seatController.GetSeatById,
	errorHandler
);

// PUT /seats/:id - Update seat state by ID
seatRouter.put(
	"/:id",
	csrfAdminProtectionRoute,
	routeValidator.validateIdParam, // Reuse existing ID validation
	seatValidator.validateUpdateSeat,
	handleValidationResult,
	seatController.UpdateSeat,
	errorHandler
);

export default seatRouter;