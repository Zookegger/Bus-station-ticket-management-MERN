import { Router } from "express";
import * as checkInController from "@controllers/checkInController";
import { errorHandler } from "@middlewares/errorHandler";
import { handleValidationResult } from "@middlewares/validateRequest";
import { checkInValidators } from "@middlewares/validators/checkInValidator";
import rateLimit from "express-rate-limit";

const checkInRouter = Router();

const checkInRateLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 10,
	message: "Too many check-in attempts from this IP, please try again later.",
});

/**
 * @swagger
 * /api/check-in/{orderId}:
 *   get:
 *     summary: Check in all tickets for an order via a scanned QR code URL.
 *     tags: [CheckIn]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to check in.
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The security token from the QR code URL.
 *     responses:
 *       200:
 *         description: Check-in successful. Returns the updated order details.
 *       400:
 *         description: Bad request (e.g., missing token, no eligible tickets).
 *       403:
 *         description: Forbidden (invalid token).
 *       404:
 *         description: Order not found.
 */
checkInRouter.get(
	"/:orderId",
    checkInRateLimiter,
	checkInValidators,
	handleValidationResult,
	checkInController.handleCheckIn,
	errorHandler
);

export default checkInRouter;
