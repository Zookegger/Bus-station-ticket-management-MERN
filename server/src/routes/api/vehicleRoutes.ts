/**
 * Vehicle routes configuration.
 *
 * This module defines RESTful routes for comprehensive vehicle management operations
 * including advanced filtering, CRUD operations, and search functionality.
 * All routes include proper error handling and validation middleware.
 */

import { Router } from "express";
import { isAdmin } from "../../middlewares/auth";
import { errorHandler } from "../../middlewares/errorHandler";
import { handleValidationResult } from "../../middlewares/validateRequest";
import * as vehicleController from "../../controllers/vehicleController";
import * as vehicleValidator from "../../validators/vehicleValidator";

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
const vehicleRoutes = Router();

// GET /vehicles - Advanced search with filtering and pagination
vehicleRoutes.get("/", vehicleController.SearchVehicle, errorHandler);

// GET /vehicles/search - Alternative search endpoint
vehicleRoutes.get("/search", vehicleController.SearchVehicle, errorHandler);

// GET /vehicles/:id - Get vehicle by ID
vehicleRoutes.get("/:id", vehicleValidator.validateIdParam, handleValidationResult, vehicleController.GetVehicleById, errorHandler);

// POST /vehicles - Create new vehicle
vehicleRoutes.post("/", vehicleValidator.validateCreateVehicle, handleValidationResult, vehicleController.AddVehicle, errorHandler);

// PUT /vehicles/:id - Update vehicle by ID
vehicleRoutes.put("/:id", vehicleValidator.validateIdParam, vehicleValidator.validateUpdateVehicle, handleValidationResult, isAdmin, vehicleController.UpdateVehicle, errorHandler);

// DELETE /vehicles/:id - Delete vehicle by ID
vehicleRoutes.delete("/:id", vehicleValidator.validateIdParam, handleValidationResult, isAdmin, vehicleController.RemoveVehicle, errorHandler);

export default vehicleRoutes;