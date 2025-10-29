import { errorHandler } from "@middlewares/errorHandler";
import { handleValidationResult } from "@middlewares/validateRequest";
import * as validators from "@middlewares/validators/paymentMethodValidator";
import { Router } from "express";
import * as controllers from "@controllers/paymentMethodController";
import { csrfAdminProtectionRoute } from "@middlewares/csrf";
import { isAdmin } from "@middlewares/auth";

const paymentMethodRouter = Router();

paymentMethodRouter.get(
	"/code/:code",
	validators.validatePaymentMethodCodeParam,
	handleValidationResult,
	controllers.GetPaymentMethodByCode,
	errorHandler
);

paymentMethodRouter.get(
	"/all",
	isAdmin,
	controllers.ListAllPaymentMethods,
	errorHandler
);

paymentMethodRouter.get(
	"/active",
	controllers.ListActivePaymentMethods,
	errorHandler
);

paymentMethodRouter.post(
	"/",
	csrfAdminProtectionRoute,
	handleValidationResult,
	controllers.AddPaymentMethod,
	errorHandler
);

paymentMethodRouter.put(
	"/:id",
	csrfAdminProtectionRoute,
	validators.validateCreatePaymentMethod,
	handleValidationResult,
	controllers.UpdatePaymentMethod,
	errorHandler
);

paymentMethodRouter.delete(
	"/:id",
	csrfAdminProtectionRoute,
	validators.validateUpdatePaymentMethod,
	handleValidationResult,
	controllers.RemovePaymentMethod,
	errorHandler
);

export default paymentMethodRouter;
