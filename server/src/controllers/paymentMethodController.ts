/**
 * Payment method management controller.
 *
 * Handles CRUD operations for payment methods including listing active/all methods,
 * retrieving by code or ID, creating, updating, and deleting payment method records.
 * All operations include proper error handling and validation.
 */

import { CreatePaymentMethodDTO, UpdatePaymentMethodDTO } from "@my_types/paymentMethods";
import * as paymentMethodServices from "@services/paymentMethodServices";
import logger from "@utils/logger";
import { getParamStringId } from "@utils/request";
import { Request, Response, NextFunction } from "express";

/**
 * Retrieves a single payment method by its unique code.
 *
 * Used by the frontend and backend to get payment method configuration
 * for processing payments. Returns the payment method with decrypted
 * configuration data.
 *
 * @param req - Express request object containing code in URL parameters
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route GET /payment-methods/code/:code
 * @access Public/User
 *
 * @throws {Error} When code is missing or payment method not found
 * @returns JSON response with payment method data
 */
export const GetPaymentMethodByCode = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const code = req.params.code;
		if (!code) {
			throw { status: 400, message: "Payment method code is required" };
		}

		const payment_method = await paymentMethodServices.getPaymentMethodByCode(code);
		
		if (!payment_method) {
			throw { status: 404, message: `Payment method with code '${code}' not found` };
		}

		res.status(200).json(payment_method);
	} catch (err) {
		next(err);
	}
};

/**
 * Retrieves a single payment method by its unique ID.
 *
 * Used by administrators to get full payment method details including
 * encrypted configuration for editing purposes.
 *
 * @param req - Express request object containing ID in URL parameters
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route GET /payment-methods/:id
 * @access Admin
 *
 * @throws {Error} When ID is missing or payment method not found
 * @returns JSON response with payment method data
 */
export const GetPaymentMethodById = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamStringId(req);
		if (!id) {
			throw { status: 400, message: "Payment method ID is required" };
		}

		const payment_method = await paymentMethodServices.getPaymentMethodById(id);
		
		if (!payment_method) {
			throw { status: 404, message: `Payment method with ID '${id}' not found` };
		}

		res.status(200).json(payment_method);
	} catch (err) {
		next(err);
	}
};

/**
 * Lists all active payment methods.
 *
 * Returns only enabled payment methods that are available for users
 * to select during checkout. Used by the frontend to display payment options.
 *
 * @param _req - Express request object (unused)
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route GET /payment-methods/active
 * @access Public/User
 *
 * @throws {Error} When database query fails
 * @returns JSON response with { rows: PaymentMethod[], count: number }
 */
export const ListActivePaymentMethods = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const payment_methods = await paymentMethodServices.listActivePaymentMethods();
		res.status(200).json(payment_methods);
	} catch (err) {
		next(err);
	}
};

// =================================================================
// ADMIN-ONLY FUNCTIONS
// =================================================================

/**
 * Lists all payment methods including inactive ones.
 *
 * Returns complete list of payment methods regardless of active status.
 * Used by administrators in the admin panel for managing payment methods.
 *
 * @param _req - Express request object (unused)
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route GET /payment-methods/all
 * @access Admin
 *
 * @throws {Error} When database query fails
 * @returns JSON response with { rows: PaymentMethod[], count: number }
 */
export const ListAllPaymentMethods = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const payment_methods = await paymentMethodServices.listAllPaymentMethods();
		res.status(200).json(payment_methods);
	} catch (err) {
		next(err);
	}
};

/**
 * Creates a new payment method record.
 *
 * Validates input data and creates a new payment method in the database.
 * Configuration data (API keys, secrets) is automatically encrypted before storage.
 * Used by administrators to add new payment gateways to the system.
 *
 * @param req - Express request object containing payment method creation data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /payment-methods
 * @access Admin
 *
 * @throws {Error} When creation fails or validation errors occur
 * @returns JSON response with created payment method and success message
 */
export const AddPaymentMethod = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const dto: CreatePaymentMethodDTO = req.body;

		if (!dto || !dto.name || !dto.code) {
			throw { status: 400, message: "Payment method name and code are required" };
		}

		const new_method = await paymentMethodServices.createPaymentMethod(dto);

		if (!new_method) {
			throw { status: 500, message: "Failed to create payment method" };
		}

		res.status(200).json({
			payment_method: new_method,
			message: "Payment method created successfully"
		});
	} catch (err: any) {
        logger.debug("AddPaymentMethod error:", err);
        logger.debug("Error details:", {
            message: err.message,
            sql: err.sql,
            sqlMessage: err.original?.sqlMessage,
            code: err.original?.code,
        });
		next(err);
	}
};

/**
 * Updates an existing payment method record.
 *
 * Modifies payment method information based on provided ID and update data.
 * Supports partial updates where only specified fields are changed.
 * Configuration data is re-encrypted if modified.
 *
 * @param req - Express request object containing payment method ID and update data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route PUT /payment-methods/:id
 * @access Admin
 *
 * @throws {Error} When update fails or payment method not found
 * @returns JSON response with updated payment method and success message
 */
export const UpdatePaymentMethod = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id: string = getParamStringId(req);
		const dto: UpdatePaymentMethodDTO = req.body;

		if (!id) {
			throw { status: 400, message: "Payment method ID is required" };
		}

		if (!dto || Object.keys(dto).length === 0) {
			throw { status: 400, message: "No update data provided" };
		}

		const updated_method = await paymentMethodServices.updatePaymentMethod(id, dto);

		if (!updated_method) {
			throw { status: 404, message: `Payment method with ID '${id}' not found` };
		}

		res.status(200).json({
			payment_method: updated_method,
			message: "Payment method updated successfully"
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Deletes a payment method by ID.
 *
 * Permanently removes a payment method record from the system.
 * Verifies deletion was successful before returning success response.
 *
 * @param req - Express request object containing payment method ID in URL parameters
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route DELETE /payment-methods/:id
 * @access Admin
 *
 * @throws {Error} When payment method not found or deletion fails
 * @returns JSON response with success message
 */
export const RemovePaymentMethod = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id: string = getParamStringId(req);
		
		if (!id) {
			throw { status: 400, message: "Payment method ID is required" };
		}

		await paymentMethodServices.deletePaymentMethod(id);

		const deleted_method = await paymentMethodServices.getPaymentMethodById(id);
		if (deleted_method) {
			throw { status: 500, message: "Payment method deletion failed" };
		}

		res.status(200).json({
			success: true,
			message: "Payment method deleted successfully"
		});
	} catch (err) {
		next(err);
	}
};
