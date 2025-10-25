import { body, param } from "express-validator";

// Param validators
const paymentMethodCodeParamValidator = param("code")
	.exists({ checkFalsy: true })
	.withMessage("Payment method code is required")
	.isString()
	.withMessage("Payment method code must be a string")
	.trim()
	.toLowerCase();

export const validatePaymentMethodCodeParam = [paymentMethodCodeParamValidator];

export const validatePaymentMethodIdParam = [
	param("id")
		.exists({ checkFalsy: true })
		.withMessage("Payment method id is required")
		.isUUID(4)
		.withMessage("Payment method id must be a valid UUID v4"),
];

// Body field validators (helpers)
const createNameValidator = body("name")
	.exists({ checkFalsy: true })
	.withMessage("Name is required")
	.isString()
	.withMessage("Name must be a string")
	.trim()
	.isLength({ min: 2, max: 100 })
	.withMessage("Name must be between 2 and 100 characters");

const updateNameValidator = body("name")
	.optional()
	.isString()
	.withMessage("Name must be a string")
	.trim()
	.isLength({ min: 2, max: 100 })
	.withMessage("Name must be between 2 and 100 characters");

const createCodeBodyValidator = body("code")
	.exists({ checkFalsy: true })
	.withMessage("Code is required")
	.isString()
	.withMessage("Code must be a string")
	.trim()
	.isLength({ min: 2, max: 50 })
	.withMessage("Code must be between 2 and 50 characters")
	.matches(/^[a-z0-9_-]+$/i)
	.withMessage("Code may contain letters, numbers, underscores, and hyphens only")
	.toLowerCase();

const updateCodeBodyValidator = body("code")
	.optional()
	.isString()
	.withMessage("Code must be a string")
	.trim()
	.isLength({ min: 2, max: 50 })
	.withMessage("Code must be between 2 and 50 characters")
	.matches(/^[a-z0-9_-]+$/i)
	.withMessage("Code may contain letters, numbers, underscores, and hyphens only")
	.toLowerCase();

const isActiveValidator = body("isActive")
	.optional()
	.isBoolean()
	.withMessage("isActive must be a boolean")
	.toBoolean();

const configJsonValidator = body("configJson")
	.optional()
	.custom((value) => {
		if (value === null) return true; // allow explicit null to clear
		if (typeof value === "object") return true; // JSON object provided
		if (typeof value === "string") {
			try {
				JSON.parse(value);
				return true;
			} catch {
				throw new Error("configJson must be a valid JSON string or object");
			}
		}
		throw new Error("configJson must be a JSON object or JSON string");
	});

// Exported rule sets
export const validateCreatePaymentMethod = [
	createNameValidator,
	createCodeBodyValidator,
	isActiveValidator,
	configJsonValidator,
];

export const validateUpdatePaymentMethod = [
	updateNameValidator,
	updateCodeBodyValidator,
	isActiveValidator,
	configJsonValidator,
];
