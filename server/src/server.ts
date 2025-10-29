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
        const { emailWorker } = await import("@utils/workers/emailWorker");
        const http = await import("http");
        const { Server } = await import("socket.io");

		// Start email worker		
		await emailWorker.waitUntilReady();
		
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
	} catch (err) {
		logger.error("Failed to start server:", err);
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
