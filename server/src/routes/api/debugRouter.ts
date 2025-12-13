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

/**
 * @route POST /api/debug/test-websocket
 * @desc Test WebSocket broadcasting
 * @access Admin
 */
debugRouter.post(
	"/test-websocket",
	authenticateJwt,
	isAdmin,
	debugController.TestWebsocketBroadcast,
	errorHandler
);

/**
 * @route GET /api/debug/websocket-stats
 * @desc Get WebSocket connection statistics
 * @access Admin
 */
debugRouter.get(
	"/websocket-stats",
	authenticateJwt,
	isAdmin,
	debugController.GetWebsocketStats,
	errorHandler
);

/**
 * @route GET /api/debug/match-routes
 * @desc Diagnostic: return matched route IDs for given from/to (name or id)
 * @access Admin
 */
debugRouter.get(
	"/match-routes",
	authenticateJwt,
	isAdmin,
	debugController.GetMatchedRoutes,
	errorHandler
);

export default debugRouter;
