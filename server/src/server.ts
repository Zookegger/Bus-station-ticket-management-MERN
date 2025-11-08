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
        const emailWorker = await import("@utils/workers/emailWorker");
		const ticketWorker = await import("@utils/workers/ticketWorker");
		const tripSchedulingWorker = await import("@utils/workers/tripSchedulingWorker");
		const paymentWorker = await import("@utils/workers/paymentWorker");
		const { scheduleRecurringCleanup } = await import("@utils/queues/paymentQueue");
        const http = await import("http");
        const { Server } = await import("socket.io");

		// Start all workers and wait for them to be ready
		logger.info("Initializing background workers...");
		await emailWorker.default.waitUntilReady();
		logger.info("✓ Email worker ready");
		
		await ticketWorker.default.waitUntilReady();
		logger.info("✓ Ticket worker ready");
		
		await tripSchedulingWorker.default.waitUntilReady();
		logger.info("✓ Trip scheduling worker ready");
		
		await paymentWorker.default.waitUntilReady();
		logger.info("✓ Payment worker ready");
		
		// Schedule recurring payment cleanup job (daily at 2 AM)
		try {
			const recurring_job = await scheduleRecurringCleanup({
				batchSize: 100,
				dryRun: false,
			});
			logger.info(`✓ Payment cleanup job scheduled (daily at 2 AM) - Job ID: ${recurring_job.id}`);
			
			// Get next scheduled time
			const cron_parser = await import("cron-parser");
			const interval = cron_parser.parseExpression("0 2 * * *");
			const next_run = interval.next().toDate();
			logger.info(`   Next cleanup scheduled for: ${next_run.toLocaleString()}`);
			
			// Add an immediate test job to verify worker is functioning
			const { addCleanupJob } = await import("@utils/queues/paymentQueue");
			const test_job = await addCleanupJob(
				{ batchSize: 10, dryRun: true },
				{ delay: 30000 } // Run in 30 seconds
			);
			logger.info(`✓ Test cleanup job queued (runs in 30 seconds) - Job ID: ${test_job.id}`);
		} catch (err) {
			logger.error("Failed to schedule payment cleanup job:", err);
		}
		
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
