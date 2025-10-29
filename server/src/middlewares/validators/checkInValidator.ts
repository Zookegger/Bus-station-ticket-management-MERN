import { param, query } from "express-validator";

/**
 * Validator for the 'orderId' URL parameter.
 * Ensures it is a non-empty, lowercase UUID v4.
 */
const paramValidator = param("orderId")
	.trim()
	.notEmpty()
	.withMessage("Order ID is required")
	.isUUID(4)
	.withMessage("Order ID must be a valid UUID")
	.toLowerCase();

/**
 * Validator for the 'token' query parameter.
 * Ensures it is a non-empty, 64-character hexadecimal string.
 */
const queryValidator = query("token")
	.trim()
	.notEmpty()
	.withMessage("Security token is missing")
	.isHexadecimal()
	.withMessage("Token must be a hexadecimal string")
	.isLength({ min: 64, max: 64 })
	.withMessage("Token has an invalid length");

export const checkInValidators = [paramValidator, queryValidator];
