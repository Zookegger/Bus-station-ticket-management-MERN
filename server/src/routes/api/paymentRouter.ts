import { Router } from "express";
import {
	MomoIPN,
	MomoReturn,
	VNPayIPN,
	VNPayReturn,
} from "@controllers/paymentController";

const paymentRouter = Router();

/**
 * VNPay return (user redirect). Accepts GET (VNPay redirects users with query params).
 */
paymentRouter.get("/vnpay/return", VNPayReturn);

/**
 * VNPay server-to-server notification (IPN). Accept GET/POST depending on gateway config.
 */
paymentRouter.post("/vnpay/ipn", VNPayIPN);
paymentRouter.get("/vnpay/ipn", VNPayIPN);

/**
 * Momo return (user redirect). Accepts GET.
 */
paymentRouter.get("/momo/return", MomoReturn);

/**
 * Momo server-to-server notification (IPN). Accepts POST.
 */
paymentRouter.post("/momo/ipn", MomoIPN);

export default paymentRouter;