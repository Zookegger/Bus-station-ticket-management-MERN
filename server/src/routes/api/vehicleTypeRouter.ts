/**
 * Vehicle type routes configuration.
 *
 * This module defines RESTful routes for comprehensive vehicle type management operations
 * including advanced filtering, CRUD operations, and search functionality.
 * All routes include proper error handling and validation middleware.
 */

import { Router } from "express";
import { errorHandler } from "@middlewares/errorHandler";
import { handleValidationResult } from "@middlewares/validateRequest";
import { AddVehicleType, GetVehicleTypeById, RemoveVehicleType, SearchVehicleTypes, UpdateVehicleType } from "@controllers/vehicleTypeController";
import { validateCreateVehicleType, validateIdParam, validateUpdateVehicleType } from "@middlewares/validators/vehicleTypeValidator";
import { csrfAdminProtectionRoute } from "@middlewares/csrf";

/**
 * Vehicle type management router instance.
 *
 * Handles vehicle type-related operations with full CRUD support:
 * - GET /: Advanced search and filtering with pagination
 * - GET /search: Alternative search endpoint
 * - GET /:id: Retrieve specific vehicle type by ID
 * - POST /: Create new vehicle type
 * - PUT /:id: Update existing vehicle type
 * - DELETE /:id: Remove vehicle type
 */
const vehicleTypeRouter = Router();

// GET /vehicle-types - Advanced search with filtering and pagination
vehicleTypeRouter.get("/", SearchVehicleTypes, errorHandler);

// GET /vehicle-types/search - Alternative search endpoint
vehicleTypeRouter.get("/search", SearchVehicleTypes, errorHandler);

// GET /vehicle-types/:id - Get vehicle type by ID
vehicleTypeRouter.get("/:id", validateIdParam, handleValidationResult, GetVehicleTypeById, errorHandler);

// POST /vehicle-types - Create new vehicle type
vehicleTypeRouter.post("/", csrfAdminProtectionRoute, validateCreateVehicleType, handleValidationResult, AddVehicleType, errorHandler);

// PUT /vehicle-types/:id - Update vehicle type by ID
vehicleTypeRouter.put("/:id", csrfAdminProtectionRoute, validateIdParam, validateUpdateVehicleType, handleValidationResult, UpdateVehicleType, errorHandler);

// DELETE /vehicle-types/:id - Delete vehicle type by ID
vehicleTypeRouter.delete("/:id", csrfAdminProtectionRoute, validateIdParam, handleValidationResult, RemoveVehicleType, errorHandler);

export default vehicleTypeRouter;