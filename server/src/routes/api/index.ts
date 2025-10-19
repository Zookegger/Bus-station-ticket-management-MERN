/**
 * API routes configuration and mounting.
 *
 * This module sets up the main API router and mounts all sub-routes
 * under their respective prefixes. It serves as the central routing
 * configuration for the application's API endpoints.
 */

import { Request, Response, Router } from "express";
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import vehicleTypeRoutes from "./vehicleTypeRoutes";
import vehicleRoutes from "./vehicleRoutes";
import driverRoutes from "./driverRoutes";
import locationRoutes from "./locationRoutes";
import routeRoutes from "./routeRoutes";
import tripRoutes from "./tripRoutes";
import seatRoutes from "./seatRoutes";
import settingsRouter from "./settingRoutes";

/**
 * Main API router instance.
 *
 * This router aggregates all API routes and applies common middleware
 * or configurations before mounting sub-routes.
 */
const apiRouter = Router();

const formatMemoryUsage = (usage: NodeJS.MemoryUsage) => {
    const toMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + 'MB';
    return Object.fromEntries(
        Object.entries(usage).map(([key, value]) => [key, toMB(value)])
    )
}

const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);
    
    return parts.join(' ');
}

apiRouter.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'active',
        timestamp: new Date().toISOString(),
        memoryUsage: formatMemoryUsage(process.memoryUsage()),
        uptime: formatUptime(process.uptime())
    });
});

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

// Mount trip routes under /trips prefix
apiRouter.use("/trips", tripRoutes);

// Mount seat routes under /seats prefix
apiRouter.use("/seats", seatRoutes);

// Mount server settings routes under /settings prefix
apiRouter.use("/settings", settingsRouter);

export default apiRouter;