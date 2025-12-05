import { PaymentStatus } from "@my-types";
import {
	handlePaymentCallback,
	verifyPayment,
} from "@services/paymentServices";
import logger from "@utils/logger";
import { NextFunction, Request, Response } from "express";

/**
 * VNPay return (user redirect) handler.
 * Verifies the callback and processes the payment; then redirects the user to the client.
 * @param req - Express request (query contains VNPay fields)
 * @param res - Express response (redirects to client)
 */
export const VNPayReturn = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Extract raw callback data from query (VNPay returns via query string)
	const callbackData = req.query;
	const paymentMethodCode = "vnpay";

	try {
		// Verify signature/status with gateway
		const verificationResult = await verifyPayment({
			callbackData,
			paymentMethodCode,
		});

		// Process payment update (completed/failed/expired)
		await handlePaymentCallback(verificationResult);

		// Redirect user to frontend with simple status param (adjust path as needed)
		const client_url = process.env.CLIENT_URL || "http://localhost";
		const client_port = process.env.CLIENT_PORT
			? `:${process.env.CLIENT_PORT}`
			: "";
		const status =
			verificationResult.status === PaymentStatus.COMPLETED
				? "success"
				: "failure";

		return res.redirect(
			`${client_url}${client_port}/payment-result?status=${status}`
		);
	} catch (err) {
		logger.error("[VNPayReturn] Error handling return:", err);
		// On error, redirect to failure page
		const client_url = process.env.CLIENT_URL || "http://localhost";
		const client_port = process.env.CLIENT_PORT
			? `:${process.env.CLIENT_PORT}`
			: "";
		res.redirect(`${client_url}${client_port}/payment-result?status=error`);
		return next(err);
	}
};

/**
 * VNPay IPN / server-to-server notification handler.
 * Verifies signature/status with gateway and processes the payment update.
 * Responds with plain 200 on success so VNPay considers the notification delivered.
 */
export const VNPayIPN = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// VNPay may send GET or POST; accept both
	const callback_data = Object.keys(req.body).length ? req.body : req.query;
	const payment_method_code = "vnpay";

	try {
		// Verify incoming notification
		const verification_result = await verifyPayment({
			paymentMethodCode: payment_method_code,
			callbackData: callback_data,
		});

		// Handle payment update (will mark payment/order/tickets accordingly)
		await handlePaymentCallback(verification_result);

		// VNPay expects a 200 success response. Body content can follow gateway spec.
		return res.status(200).send("OK");
	} catch (err) {
		logger.error("[VNPayIPN] Error handling IPN:", err);
		// Return non-200 so gateway may retry according to its rules
		res.status(500).send("ERROR");
      return next(err);
   }
};

/**
 * Momo return (user redirect) handler.
 * Verifies the callback and processes the payment; then redirects the user to the client.
 */
export const MomoReturn = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Momo redirects with query params
	const callbackData = req.query;
	const paymentMethodCode = "momo";

	try {
		const verificationResult = await verifyPayment({
			callbackData,
			paymentMethodCode,
		});

		await handlePaymentCallback(verificationResult);

		const client_url = process.env.CLIENT_URL || "http://localhost";
		const client_port = process.env.CLIENT_PORT
			? `:${process.env.CLIENT_PORT}`
			: "";
		const status =
			verificationResult.status === PaymentStatus.COMPLETED
				? "success"
				: "failure";

		return res.redirect(
			`${client_url}${client_port}/payment-result?status=${status}`
		);
	} catch (err) {
		logger.error("[MomoReturn] Error handling return:", err);
		const client_url = process.env.CLIENT_URL || "http://localhost";
		const client_port = process.env.CLIENT_PORT
			? `:${process.env.CLIENT_PORT}`
			: "";
		res.redirect(`${client_url}${client_port}/payment-result?status=error`);
		return next(err);
	}
};

/**
 * Momo IPN / server-to-server notification handler.
 */
export const MomoIPN = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Momo sends IPN via POST
	const callbackData = req.body;
	const paymentMethodCode = "momo";

	try {
		const verificationResult = await verifyPayment({
			paymentMethodCode,
			callbackData,
		});

		await handlePaymentCallback(verificationResult);

		// Momo expects 204 No Content on success
		return res.status(204).send();
	} catch (err) {
		logger.error("[MomoIPN] Error handling IPN:", err);
		res.status(500).send("ERROR");
		return next(err);
	}
};
