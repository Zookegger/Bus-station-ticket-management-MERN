/**
 * Global error handling middleware for Express application.
 *
 * This middleware catches and processes errors thrown during request processing,
 * logs them appropriately, and sends standardized error responses to clients.
 */

import { Request, Response, NextFunction } from "express";
import { format } from "date-fns";
import logger from "../utils/logger";

/**
 * Express error handling middleware function.
 *
 * Logs the error details and sends a JSON response with error information.
 * This should be the last middleware in the Express app to catch any unhandled errors.
 *
 * @param {any} err - The error object thrown during request processing
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function (not used in error handlers)
 */
export const errorHandler = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	logger.debug(err);
	const time = Date.now();
    const status = err.status || 500;
	res.status(status).json({
		message: err.message || "Internal Server Error",
        time: format(time, "dd/MM/yyyy"),
    });
};
