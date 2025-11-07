import express from "express";
import * as debugController from "@controllers/debugController";
import { authenticateJwt, isAdmin } from "@middlewares/auth";
import { errorHandler } from "@middlewares/errorHandler";

const debugRouter = express.Router();

/**
 * Debug/Admin routes for testing and monitoring background jobs.
 * All routes require admin authentication.
 */

/**
 * @route POST /api/debug/trigger-payment-cleanup
 * @desc Manually trigger payment cleanup job
 * @access Admin
 */
debugRouter.post(
	"/trigger-payment-cleanup",
	authenticateJwt,
	isAdmin,
	debugController.TriggerPaymentCleanup,
	errorHandler
);

/**
 * @route GET /api/debug/payment-queue-stats
 * @desc Get payment queue statistics and job counts
 * @access Admin
 */
debugRouter.get(
	"/payment-queue-stats",
	authenticateJwt,
	isAdmin,
	debugController.GetPaymentQueueStats,
	errorHandler
);

export default debugRouter;
