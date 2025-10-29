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
import { applyPassportStrategy } from "@config/passport"
import apiRouter from "@routes/api";
import passport from "passport";

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
		origin: [
			"http://localhost:5173",
			"http://127.0.0.1:5173",
			"http://localhost:3000",
			"http://127.0.0.1:3000",
		],
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
app.use(express.urlencoded({ extended: true }));

// Parse cookies from incoming requests
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

// Apply the JWT strategy configuration
applyPassportStrategy();

// Mount API routes under the /api prefix
app.use("/api", apiRouter);

// Mount CSRF protection only on admin routes
// Note: CSRF is now applied per-route in the route files using csrfProtectionRoute

/**
 * Health check endpoint to verify server status.
 *
 * @route GET /
 * @returns {Object} JSON response with server status
 */
app.get("/", (_req: Request, res: Response): void => {
	res.status(200).json({
		status: "ok",
		message: "Server is running",
	});
});
