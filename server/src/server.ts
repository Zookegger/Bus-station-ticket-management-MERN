/**
 * Server initialization and startup module.
 *
 * This module sets up the HTTP server with Express app, Socket.IO for real-time
 * communication, database connection, and email worker. It handles the complete
 * server lifecycle from configuration to listening for connections.
 */

import dotenv from "dotenv";
import http from "http";

// Load environment variables from .env file
dotenv.config();

// Register TypeScript path mappings for production
if (process.env.NODE_ENV === "production") {
	require("tsconfig-paths/register");
}

import logger from "@utils/logger";
import { configService } from "@services/settingServices";
import { connectToDatabase } from "@models";
import { generateDefaultAdminAccount } from "@services/userServices";
import { initializePaymentGateways } from "@services/gateways";
import { closeSocket, initSocket } from "@utils/socket";
import { closeAllWorkers, initializeWorkersAndSchedules } from "@utils/workerManager";


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
		initializePaymentGateways();

		const { app } = await import("./app");

		// Initialize workers and schedule maintenance jobs via bootstrap
		logger.info(
			"Initializing background workers and schedules via bootstrap..."
		);
		await initializeWorkersAndSchedules();
		logger.info("✓ Workers ready and schedules initialized");

		// Create HTTP server with Express app
		const server = http.createServer(app);
		
		initSocket(server);

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
					await closeAllWorkers();

					// Close Socket.IO
					await closeSocket();

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
