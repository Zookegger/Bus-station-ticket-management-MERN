/**
 * Vehicle routes configuration.
 *
 * This module defines RESTful routes for comprehensive vehicle management operations
 * including advanced filtering, CRUD operations, and search functionality.
 * All routes include proper error handling and validation middleware.
 */

import { Router } from "express";
import { csrfAdminProtectionRoute } from "@middlewares/csrf";
import { errorHandler } from "@middlewares/errorHandler";
import { handleValidationResult } from "@middlewares/validateRequest";
import * as vehicleController from "@controllers/vehicleController";
import * as vehicleValidator from "@middlewares/validators/vehicleValidator";

/**
 * Vehicle management router instance.
 *
 * Handles vehicle-related operations with full CRUD support:
 * - GET /: Advanced search and filtering with pagination
 * - GET /search: Alternative search endpoint
 * - GET /:id: Retrieve specific vehicle by ID
 * - POST /: Create new vehicle
 * - PUT /:id: Update existing vehicle
 * - DELETE /:id: Remove vehicle
 */
const vehicleRouter = Router();

// GET /vehicles - Advanced search with filtering and pagination
vehicleRouter.get("/", vehicleController.SearchVehicle, errorHandler);

// GET /vehicles/search - Alternative search endpoint
vehicleRouter.get("/search", vehicleController.SearchVehicle, errorHandler);

// GET /vehicles/:id - Get vehicle by ID
vehicleRouter.get("/:id", vehicleValidator.validateIdParam, handleValidationResult, vehicleController.GetVehicleById, errorHandler);

// POST /vehicles - Create new vehicle
vehicleRouter.post("/", csrfAdminProtectionRoute, vehicleValidator.validateCreateVehicle, handleValidationResult, vehicleController.AddVehicle, errorHandler);

// PUT /vehicles/:id - Update vehicle by ID
vehicleRouter.put("/:id", csrfAdminProtectionRoute, vehicleValidator.validateIdParam, vehicleValidator.validateUpdateVehicle, handleValidationResult, vehicleController.UpdateVehicle, errorHandler);

// DELETE /vehicles/:id - Delete vehicle by ID
vehicleRouter.delete("/:id", csrfAdminProtectionRoute, vehicleValidator.validateIdParam, handleValidationResult, vehicleController.RemoveVehicle, errorHandler);

export default vehicleRouter;