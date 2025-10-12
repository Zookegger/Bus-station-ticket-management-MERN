/**
 * API routes configuration and mounting.
 *
 * This module sets up the main API router and mounts all sub-routes
 * under their respective prefixes. It serves as the central routing
 * configuration for the application's API endpoints.
 */

import { Router } from "express";
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import vehicleTypeRoutes from "./vehicleTypeRoutes";
import vehicleRoutes from "./vehicleRoutes";
import driverRoutes from "./driverRoutes";
import locationRoutes from "./locationRoutes";
import routeRoutes from "./routeRoutes";

/**
 * Main API router instance.
 *
 * This router aggregates all API routes and applies common middleware
 * or configurations before mounting sub-routes.
 */
const apiRouter = Router();

// Mount user-related routes under /users prefix
apiRouter.use("/users", userRoutes);

// Mount authentication routes under /auth prefix
apiRouter.use("/auth", authRoutes);

// Mount vehicle type routes under /vehicle-type prefix
apiRouter.use("/vehicle-types", vehicleTypeRoutes);

// Mount vehicle routes under /vehicle prefix
apiRouter.use("/vehicles", vehicleRoutes);

// Mount driver routes under /drivers prefix
apiRouter.use("/drivers", driverRoutes);

// Mount location routes under /locations prefix
apiRouter.use("/locations", locationRoutes);

// Mount route routes under /routes prefix
apiRouter.use("/routes", routeRoutes);

export default apiRouter;