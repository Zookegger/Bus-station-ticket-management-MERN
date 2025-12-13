import { NextFunction, Request, Response } from "express";
import { addCleanupJob } from "@utils/queues/paymentQueue";
import logger from "@utils/logger";
import { getIO } from "@utils/socket";
import { REALTIME_NAMESPACE } from "@constants/realtime";
import db from "@models/index";
import { Op } from "sequelize";

/**
 * Manually trigger payment cleanup job (admin/debug only).
 * This endpoint allows testing the payment cleanup worker without waiting for the scheduled time.
 * 
 * @route POST /api/debug/trigger-payment-cleanup
 * @access Admin
 */
export const TriggerPaymentCleanup = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { batchSize = 100, dryRun = true, delay = 0 } = req.body;

		logger.info(`[Debug] Manually triggering payment cleanup (dryRun: ${dryRun}, batchSize: ${batchSize})`);

		// Add job to queue
		const job = await addCleanupJob(
			{ batchSize, dryRun },
			{ delay } // run immediately or with specified delay
		);

		res.status(200).json({
			success: true,
			message: "Payment cleanup job queued successfully.",
			data: {
				jobId: job.id,
				batchSize,
				dryRun,
				delay,
				estimatedRunTime: new Date(Date.now() + delay).toISOString(),
			},
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Get payment queue statistics and job counts.
 * 
 * @route GET /api/debug/payment-queue-stats
 * @access Admin
 */
export const GetPaymentQueueStats = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { paymentQueue } = await import("@utils/queues/paymentQueue");

		const [waiting, active, completed, failed, delayed, repeatable] = await Promise.all([
			paymentQueue.getWaitingCount(),
			paymentQueue.getActiveCount(),
			paymentQueue.getCompletedCount(),
			paymentQueue.getFailedCount(),
			paymentQueue.getDelayedCount(),
			paymentQueue.getRepeatableJobs(),
		]);

		res.status(200).json({
			success: true,
			data: {
				waiting,
				active,
				completed,
				failed,
				delayed,
				repeatableJobs: repeatable.map(job => ({
					name: job.name,
					pattern: job.pattern,
					nextRun: job.next,
					key: job.key,
				})),
			},
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Test WebSocket broadcasting to a specific room or globally.
 * 
 * @route POST /api/debug/test-websocket
 * @access Admin
 */
export const TestWebsocketBroadcast = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { room, event = "test:event", data = { message: "WebSocket test from debug endpoint" } } = req.body;

		const io = getIO();
		const namespace = io.of(REALTIME_NAMESPACE);

		if (room) {
			// Broadcast to specific room
			namespace.to(room).emit(event, data);
			logger.info(`[Debug] WebSocket test broadcast to room '${room}': ${event}`);
		} else {
			// Broadcast to all connected clients
			namespace.emit(event, data);
			logger.info(`[Debug] WebSocket test broadcast to all clients: ${event}`);
		}

		res.status(200).json({
			success: true,
			message: `WebSocket test broadcast sent.`,
			data: { room, event, data },
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Get WebSocket connection statistics.
 * 
 * @route GET /api/debug/websocket-stats
 * @access Admin
 */
export const GetWebsocketStats = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const io = getIO();
		const namespace = io.of(REALTIME_NAMESPACE);

		// Get connected sockets
		const sockets = await namespace.fetchSockets();
		const connectedCount = sockets.length;

		// Group by rooms
		const roomStats: Record<string, number> = {};
		sockets.forEach(socket => {
			socket.rooms.forEach(room => {
				if (room !== socket.id) { // Exclude the socket's own room
					roomStats[room] = (roomStats[room] || 0) + 1;
				}
			});
		});

		res.status(200).json({
			success: true,
			data: {
				connectedClients: connectedCount,
				rooms: roomStats,
			},
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Diagnostic: return route IDs that match provided from/to location (name or id).
 * Useful for troubleshooting why a booking search returns no trips.
 *
 * @route GET /api/debug/match-routes
 * @access Admin
 */
export const GetMatchedRoutes = async (
	req: Request,
 	res: Response,
 	next: NextFunction
): Promise<void> => {
	try {
		const { from, to, fromId, toId } = req.query;

		const fromLocation = typeof from === 'string' ? from : undefined;
		const toLocation = typeof to === 'string' ? to : undefined;
		const fromIdNum = fromId ? parseInt(String(fromId), 10) : undefined;
		const toIdNum = toId ? parseInt(String(toId), 10) : undefined;

		const attrs = ["routeId", "stopOrder", "durationFromStart", "distanceFromStart"];

		const fromStops = fromIdNum
			? await db.RouteStop.findAll({ where: { locationId: fromIdNum }, attributes: attrs })
			: fromLocation
			? await db.RouteStop.findAll({
				  include: [{ model: db.Location, as: "locations", where: { name: { [Op.like]: `%${fromLocation}%` } } }],
				  attributes: attrs,
			  })
			: null;

		const toStops = toIdNum
			? await db.RouteStop.findAll({ where: { locationId: toIdNum }, attributes: attrs })
			: toLocation
			? await db.RouteStop.findAll({
				  include: [{ model: db.Location, as: "locations", where: { name: { [Op.like]: `%${toLocation}%` } } }],
				  attributes: attrs,
			  })
			: null;

		const matchedIds = new Set<number>();

		if (fromStops && toStops) {
			fromStops.forEach((fs: any) => {
				const matchingDest = toStops.find((ts: any) => ts.routeId === fs.routeId && ts.stopOrder > fs.stopOrder);
				if (matchingDest) matchedIds.add(fs.routeId);
			});
		} else if (fromStops) {
			fromStops.forEach((fs: any) => matchedIds.add(fs.routeId));
		} else if (toStops) {
			toStops.forEach((ts: any) => matchedIds.add(ts.routeId));
		}

		res.status(200).json({ success: true, data: { matchedRouteIds: Array.from(matchedIds), fromStopsCount: fromStops ? fromStops.length : 0, toStopsCount: toStops ? toStops.length : 0 } });
	} catch (err) {
		next(err);
	}
};

