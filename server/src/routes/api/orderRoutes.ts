import * as orderController from "@controllers/orderController";
import {
	csrfAdminProtectionRoute,
	csrfGuestOrUserProtectionRoute,
	csrfUserProtectionRoute,
} from "@middlewares/csrf";
import { errorHandler } from "@middlewares/errorHandler";
import { Router } from "express";

const orderRoutes = Router();

orderRoutes.get(
	"/",
	csrfAdminProtectionRoute,
	orderController.ListAllOrders,
	errorHandler
);
orderRoutes.post(
	"/",
	csrfGuestOrUserProtectionRoute,
	orderController.CreateOrder,
	errorHandler
);
orderRoutes.post(
	"/:id/refund",
	csrfGuestOrUserProtectionRoute,
	orderController.CreateOrder,
	errorHandler
);
orderRoutes.get(
	"/:id",
	csrfGuestOrUserProtectionRoute,
	orderController.GetOrderById,
	errorHandler
);
orderRoutes.get(
	"/user/:id",
	csrfUserProtectionRoute,
	orderController.GetUserOrders,
	errorHandler
);
orderRoutes.get(
	"/guest/:id",
	csrfGuestOrUserProtectionRoute,
	orderController.GetGuestOrders,
	errorHandler
);
