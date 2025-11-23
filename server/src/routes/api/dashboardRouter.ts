import { Router } from "express";
import * as dashboardController from "@controllers/dashboardController";
import { csrfAdminProtectionRoute } from "@middlewares/csrf";
import { errorHandler } from "@middlewares/errorHandler";

const dashboardRouter = Router();

dashboardRouter.get(
    "/stats",
    csrfAdminProtectionRoute, // Ensures only admins can access
    dashboardController.GetDashboardStats,
    errorHandler
);

export default dashboardRouter;