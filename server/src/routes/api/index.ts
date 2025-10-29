/**
 * API routes configuration and mounting.
 *
 * This module sets up the main API router and mounts all sub-routes
 * under their respective prefixes. It serves as the central routing
 * configuration for the application's API endpoints.
 */

import { Request, Response, Router } from "express";
import { apiRateLimiter } from "@middlewares/rateLimiter";
import userRoutes from "@routes/api/userRouter";
import authRoutes from "@routes/api/authRouter";
import vehicleTypeRoutes from "@routes/api/vehicleTypeRouter";
import vehicleRoutes from "@routes/api/vehicleRouter";
import driverRoutes from "@routes/api/driverRouter";
import locationRoutes from "@routes/api/locationRouter";
import routeRoutes from "@routes/api/routeRouter";
import tripRoutes from "@routes/api/tripRouter";
import seatRoutes from "@routes/api/seatRouter";
import settingsRouter from "@routes/api/settingRouter";
import paymentMethodRoute from "@routes/api/paymentMethodRouter";
import orderRouter from "@routes/api/orderRouter";
import checkInRouter from "@routes/api/checkInRouter";

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

// Mount authentication routes under /auth prefix. It has its own stricter rate limiter.
apiRouter.use("/auth", authRoutes);

// Apply the general rate limiter to all other API routes.
apiRouter.use("/users", apiRateLimiter, userRoutes);
apiRouter.use("/vehicle-types", apiRateLimiter, vehicleTypeRoutes);
apiRouter.use("/vehicles", apiRateLimiter, vehicleRoutes);
apiRouter.use("/drivers", apiRateLimiter, driverRoutes);
apiRouter.use("/locations", apiRateLimiter, locationRoutes);
apiRouter.use("/routes", apiRateLimiter, routeRoutes);
apiRouter.use("/trips", apiRateLimiter, tripRoutes);
apiRouter.use("/seats", apiRateLimiter, seatRoutes);
apiRouter.use("/payment-methods", apiRateLimiter, paymentMethodRoute);
apiRouter.use("/settings", apiRateLimiter, settingsRouter);
apiRouter.use("/order", apiRateLimiter, orderRouter);
apiRouter.use("/check-in", checkInRouter);

export default apiRouter;