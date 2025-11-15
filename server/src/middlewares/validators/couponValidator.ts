import { body, param } from "express-validator";
import { CouponTypes } from "@my_types/coupon";
import { handleValidationResult } from "@middlewares/validateRequest";

const codeValidator = body("code")
	.isString()
	.withMessage("Code must be a string.")
	.trim()
	.notEmpty()
	.withMessage("Code is required.");

const typeValidator = body("type")
	.isIn(Object.values(CouponTypes))
	.withMessage(
		`Invalid coupon type. Must be one of: ${Object.values(CouponTypes).join(
			", "
		)}`
	);

const valueValidator = body("value")
	.isFloat({ gt: 0 })
	.withMessage("Value must be a positive number.");

const maxUsageValidator = body("maxUsage")
	.isInt({ gt: 0 })
	.withMessage("Max usage must be a positive integer.");

const startPeriodValidator = body("startPeriod")
	.isISO8601()
	.toDate()
	.withMessage("Start period must be a valid date.");

const endPeriodValidator = body("endPeriod")
	.isISO8601()
	.toDate()
	.withMessage("End period must be a valid date.")
	.custom((value, { req }) => {
		if (req.body.startPeriod && new Date(value) < new Date(req.body.startPeriod)) {
			throw new Error("End period must be after the start period.");
		}
		return true;
	});

const currentUsageCountValidator = body("currentUsageCount")
	.optional()
	.isInt({ gt: -1 })
	.withMessage("currentUsageCount must be a non-negative integer.");

const isActiveValidator = body("isActive")
	.optional()
	.isBoolean()
	.withMessage("isActive must be a boolean.");

const descriptionValidator = body("description")
	.optional()
	.isString()
	.withMessage("Description must be a string.");

const imgUrlValidator = body("imgUrl")
	.optional()
	.isURL()
	.withMessage("Image URL must be a valid URL.");

const titleValidator = body("title")
	.optional()
	.isString()
	.withMessage("Title must be a string.");

export const validateAddCoupon = [
	codeValidator,
	typeValidator,
	valueValidator,
	maxUsageValidator,
	startPeriodValidator,
	endPeriodValidator,
	currentUsageCountValidator,
	isActiveValidator,
	descriptionValidator,
	imgUrlValidator,
	titleValidator,
	handleValidationResult,
];

export const validateUpdateCoupon = [
	param("id").isNumeric().withMessage("ID must be a number."),
	codeValidator.optional(),
	typeValidator.optional(),
	valueValidator.optional(),
	maxUsageValidator.optional(),
	startPeriodValidator.optional(),
	endPeriodValidator.optional(),
	isActiveValidator,
	descriptionValidator,
	imgUrlValidator,
	titleValidator,
	handleValidationResult,
];

export const validatePreviewCoupon = [
	body("code")
		.isString()
		.withMessage("Code must be a string.")
		.trim()
		.notEmpty()
		.withMessage("Code is required."),
	body("orderTotal")
		.isFloat({ gt: 0 })
		.withMessage("Order total must be a positive number."),
	body("userId")
		.optional({ nullable: true })
		.isString()
		.withMessage("User ID must be a string."),
	handleValidationResult,
];

export const validateCouponId = [
	param("id").isNumeric().withMessage("ID must be a number."),
	handleValidationResult,
];

export const validateCouponCode = [
	param("code")
		.isString()
		.withMessage("Code must be a string.")
		.trim()
		.notEmpty()
		.withMessage("Code is required."),
	handleValidationResult,
];
