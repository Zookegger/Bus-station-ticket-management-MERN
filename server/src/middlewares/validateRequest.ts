/**
 * Middleware for handling Express Validator results.
 *
 * This module provides utilities to process validation results from express-validator
 * and respond appropriately to validation errors.
 */

import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

/**
 * Middleware function to check for validation errors and respond accordingly.
 *
 * Extracts validation errors from the request using express-validator's validationResult.
 * If errors exist, sends a 400 Bad Request response with error details.
 * If no errors, calls next() to continue to the next middleware/route handler.
 *
 * @param {Request} req - Express request object containing validation results
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function to continue processing
 * @returns {Response | void} Returns response if validation fails, otherwise calls next()
 */
export const handleValidationResult = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			message: "Validation failed",
			errors: errors.array(),
		});
	}
	return next();
};
