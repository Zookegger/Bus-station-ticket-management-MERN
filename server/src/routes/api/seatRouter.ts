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
	seatValidator.validateIdParam,
	handleValidationResult,
	seatController.GetSeatById,
	errorHandler
);
// GET /seat-by-trip/:tripId - Get seat by Trip ID
seatRouter.get(
	"/seat-by-trip/:tripId",
	seatValidator.validateTripIdParam,
	handleValidationResult,
	seatController.GetSeatByTripId,
	errorHandler
);

// PUT /seats/:id - Update seat state by ID
seatRouter.put(
	"/:id",
	csrfAdminProtectionRoute,
	seatValidator.validateIdParam,
	seatValidator.validateUpdateSeat,
	handleValidationResult,
	seatController.UpdateSeat,
	errorHandler
);

export default seatRouter;