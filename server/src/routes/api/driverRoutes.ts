/**
 * Driver routes configuration.
 *
 * This module defines RESTful routes for comprehensive driver management operations
 * including advanced filtering, CRUD operations, and search functionality.
 * All routes include proper authentication, validation, and error handling middleware.
 */

import { Router } from "express";
import { isAdmin } from "@middlewares/auth";
import { csrfAdminProtectionRoute } from "@middlewares/csrf";
import * as driverController from "@controllers/driverController";
import { errorHandler } from "@middlewares/errorHandler";
import { handleValidationResult } from "@middlewares/validateRequest";
import { createDriverValidation, updateDriverValidation, validateDriverIdParam } from "@middlewares/validators/driverValidator";

/**
 * Driver management router instance.
 *
 * Handles driver-related operations with full CRUD support:
 * - GET /: Advanced search and filtering with pagination
 * - GET /search: Alternative search endpoint
 * - GET /:id: Retrieve specific driver by ID
 * - POST /: Create new driver
 * - PUT /:id: Update existing driver
 * - DELETE /:id: Remove driver
 */
const driverRoutes = Router();

// GET /drivers - Advanced search with filtering and pagination
driverRoutes.get("/", isAdmin, driverController.SearchDriver, errorHandler);

// GET /drivers/search - Alternative search endpoint
driverRoutes.get("/search", isAdmin, driverController.SearchDriver, errorHandler);

// GET /drivers/:id - Get driver by ID
driverRoutes.get("/:id", isAdmin, validateDriverIdParam, handleValidationResult, driverController.GetDriverById, errorHandler);

// POST /drivers - Create new driver
driverRoutes.post("/", csrfAdminProtectionRoute, createDriverValidation, handleValidationResult, driverController.AddDriver, errorHandler);

// PUT /drivers/:id - Update driver by ID
driverRoutes.put("/:id", csrfAdminProtectionRoute, validateDriverIdParam, updateDriverValidation, handleValidationResult, driverController.UpdateDriver, errorHandler);

// DELETE /drivers/:id - Delete driver by ID
driverRoutes.delete("/:id", csrfAdminProtectionRoute, validateDriverIdParam, handleValidationResult, driverController.DeleteDriver, errorHandler);

export default driverRoutes;