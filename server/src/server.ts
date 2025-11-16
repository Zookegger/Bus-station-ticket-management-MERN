/**
 * Server initialization and startup module.
 *
 * This module sets up the HTTP server with Express app, Socket.IO for real-time
 * communication, database connection, and email worker. It handles the complete
 * server lifecycle from configuration to listening for connections.
 */

import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Register TypeScript path mappings for production
if (process.env.NODE_ENV === 'production') {
	require('tsconfig-paths/register');
}

import logger from "@utils/logger";
import { configService } from "@services/settingServices";
import { connectToDatabase } from "@models";
import { generateDefaultAdminAccount } from "@services/userServices";
import { initializePaymentGateways } from "@services/gateways";

// Server port configuration with fallback to 5000
const PORT = process.env.PORT || 5000;


/**
 * Initializes and starts the HTTP server with Socket.IO integration.
 *
 * This function creates the server, sets up Socket.IO with CORS configuration,
 * establishes socket event handlers, and starts listening on the configured port.
 * It also ensures the email worker is ready for background job processing.
 *
 * @async
 * @returns {Promise<void>} Resolves when server starts successfully
 * @throws {Error} If server initialization fails
 */
const startServer = async (): Promise<void> => {
	try {
		await connectToDatabase();
		await configService.initialize();
		
		const { app } = await import("./app");
		
		// Import here for graceful shutdown
		const emailWorker = await import("@utils/workers/emailWorker");
		const ticketWorker = await import("@utils/workers/ticketWorker");
		const tripSchedulingWorker = await import("@utils/workers/tripSchedulingWorker");
		const paymentWorker = await import("@utils/workers/paymentWorker");
		// Refresh token worker is initialized via bootstrap; no direct usage here

		const { initializeWorkersAndSchedules } = await import("@utils/workerBootstrap");
        const http = await import("http");
        const { Server } = await import("socket.io");

		// Initialize workers and schedule maintenance jobs via bootstrap
		logger.info("Initializing background workers and schedules via bootstrap...");
		await initializeWorkersAndSchedules();
		logger.info("✓ Workers ready and schedules initialized");
		
		initializePaymentGateways();

		// Create HTTP server with Express app
		const server = http.createServer(app);

		// Initialize Socket.IO server with CORS settings
		const io = new Server(server, {
			cors: {
				origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
				methods: ["GET", "POST"],
				credentials: true,
			},
			connectionStateRecovery: {
				maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
			},
		});

		// Handle Socket.IO connections
		io.on("connection", (socket) => {
			logger.debug("A user connected:", socket.id);

			socket.on("disconnect", () => {
				logger.debug("User disconnected:", socket.id);
			});
		});

		await generateDefaultAdminAccount();

		// Start server and listen on specified port
		server.listen(PORT, () => logger.info(`Server listening on ${PORT}`));

		// Graceful shutdown handler
		const gracefulShutdown = async (signal: string) => {
			logger.info(`${signal} received. Starting graceful shutdown...`);
			
			// Close HTTP server first (stop accepting new connections)
			server.close(async () => {
				logger.info("HTTP server closed");
				
				try {
					// Close all workers
					logger.info("Closing background workers...");
					await Promise.all([
						emailWorker.default.close(),
						ticketWorker.default.close(),
						tripSchedulingWorker.default.close(),
						paymentWorker.default.close(),
					]);
					logger.info("All workers closed successfully");
					
					// Close Socket.IO
					io.close(() => {
						logger.info("Socket.IO connections closed");
					});
					
					process.exit(0);
				} catch (err) {
					logger.error("Error during graceful shutdown:", err);
					process.exit(1);
				}
			});

			// Force shutdown after 10 seconds if graceful shutdown fails
			setTimeout(() => {
				logger.error("Graceful shutdown timeout, forcing exit");
				process.exit(1);
			}, 10000);
		};

		// Register shutdown handlers
		process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
		process.on("SIGINT", () => gracefulShutdown("SIGINT"));
		
	} catch (err) {
		logger.error("Failed to start server:", err);
		console.error(err);
		process.exit(1);
	}
};

/**
 * Application entry point.
 *
 * Connects to the database and starts the server. This IIFE ensures the server
 * only starts after successful database connection.
 */
(async () => {
	await startServer();
})();
