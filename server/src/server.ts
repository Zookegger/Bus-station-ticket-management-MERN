/**
 * Server initialization and startup module.
 *
 * This module sets up the HTTP server with Express app, Socket.IO for real-time
 * communication, database connection, and email worker. It handles the complete
 * server lifecycle from configuration to listening for connections.
 */

import dotenv from "dotenv";
import { app } from "./app";
import { Server } from "socket.io";
import { sequelize as Database } from "./config/database";
import http from "http";
import logger from "./utils/logger";
import { connectToDatabase } from "./models";
import { emailWorker } from "./workers/emailWorker";

// Load environment variables from .env file
dotenv.config();

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
		
		// Start and Log email worker status
		await emailWorker.waitUntilReady();
		logger.info("Email worker started and listening for jobs");

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
	await connectToDatabase();
	await startServer();
})();
