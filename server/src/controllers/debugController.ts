import { NextFunction, Request, Response } from "express";
import { addCleanupJob } from "@utils/queues/paymentQueue";
import logger from "@utils/logger";
import { getIO } from "@utils/socket";
import { REALTIME_NAMESPACE } from "@constants/realtime";

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

