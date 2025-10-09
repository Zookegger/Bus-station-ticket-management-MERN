/**
 * Express application configuration and middleware setup.
 *
 * This module sets up the main Express application with necessary middlewares,
 * CORS configuration, logging, and API routing. It serves as the central entry
 * point for configuring the HTTP server before starting it in server.ts.
 */

import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import apiRouter from "./routes/api";
import {
	doubleCsrfProtection,
	generateCsrfToken,
	getCsrfToken,
} from "./middlewares/csrf";

/**
 * Configured Express application instance.
 *
 * This is the main application object that includes all middleware and routes.
 * It is exported for use in server.ts to create the HTTP server.
 */
export const app: Application = express();

// Configure CORS to allow requests from the frontend development server
app.use(
	cors({
		origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
		credentials: true,
	})
);

// Set up request logging with Morgan in development mode
app.use(
	morgan("dev", {
		stream: {
			write: (message: string) => {
				const currentTime = new Date(Date.now());

				console.log(
					`[SERVER - ${currentTime.toUTCString()}]:`,
					message.trim()
				);
			},
		},
	})
);

// Parse incoming JSON payloads
app.use(express.json());

// Parse cookies from incoming requests
app.use(cookieParser());

// Mount CSRF protection
app.use(doubleCsrfProtection);

// Mount API routes under the /api prefix
app.use("/api", apiRouter);

// CSRF token endpoint
app.get("/api/csrf-token", (req: Request, res: Response): void => {
	const csrfToken = getCsrfToken(req, res);
	res.json({ csrfToken });
});

/**
 * Health check endpoint to verify server status.
 *
 * @route GET /
 * @returns {Object} JSON response with server status
 */
app.get("/", (req: Request, res: Response): void => {
	res.status(200).json({
		status: "ok",
		message: "Server is running",
	});
});
