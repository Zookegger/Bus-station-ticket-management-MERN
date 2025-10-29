import { Request, Response, NextFunction } from "express";
import * as orderServices from "@services/orderServices";
import { verifyCheckInToken } from "@middlewares/checkInToken";

/**
 * Handles a check-in request from a scanned QR code.
 * Validates the security token and orchestrates the batch check-in of all eligible tickets in an order.
 *
 * @param req Express request object containing orderId and token.
 * @param res Express response object.
 * @param next Express next function for error handling.
 *
 * @route GET /api/check-in/:orderId
 * @access Public (but secured by token)
 */

export const handleCheckIn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { orderId } = req.params;
    const { token } = req.query;

    try {
        // 1. Validate inputs
        if (!token || typeof token !== "string") {
            throw { status: 400, message: "Security token is missing." };
        }

        // 2. Verify the security token
        const isTokenValid = verifyCheckInToken(orderId as string, token);
        if (!isTokenValid) {
            throw { status: 403, message: "Invalid or expired QR code." };
        }
        // 3. Delegate to the order service to perform the check-in
        const updatedOrder = await orderServices.checkInTicketsByOrder(orderId as string);

        // 4. Return the successful result
        // This JSON can be rendered by a simple webpage for the station agent.
        res.status(200).json({ message: "Check-in successful!", order: updatedOrder, });
    } catch (err) {
        next(err);
    }
}