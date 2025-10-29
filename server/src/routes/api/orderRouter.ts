import * as orderController from "@controllers/orderController";
import {
	csrfAdminProtectionRoute,
	csrfGuestOrUserProtectionRoute,
	csrfUserProtectionRoute,
} from "@middlewares/csrf";
import { errorHandler } from "@middlewares/errorHandler";
import { Router } from "express";

const orderRouter = Router();

orderRouter.get(
	"/",
	csrfAdminProtectionRoute,
	orderController.ListAllOrders,
	errorHandler
);
orderRouter.post(
	"/",
	csrfGuestOrUserProtectionRoute,
	orderController.CreateOrder,
	errorHandler
);
orderRouter.post(
	"/:id/refund",
	csrfGuestOrUserProtectionRoute,
	orderController.CreateOrder,
	errorHandler
);
orderRouter.get(
	"/:id",
	orderController.GetOrderById,
	errorHandler
);
orderRouter.get(
	"/user/:id",
	csrfUserProtectionRoute,
	orderController.GetUserOrders,
	errorHandler
);
orderRouter.get(
	"/guest/:id",
	csrfGuestOrUserProtectionRoute,
	orderController.GetGuestOrders,
	errorHandler
);

export default orderRouter;