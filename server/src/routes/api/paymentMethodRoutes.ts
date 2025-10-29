import { errorHandler } from "@middlewares/errorHandler";
import { handleValidationResult } from "@middlewares/validateRequest";
import * as validators from "@middlewares/validators/paymentMethodValidator";
import { Router } from "express";
import * as controllers from "@controllers/paymentMethodController";
import {
	csrfAdminProtectionRoute,
	csrfGuestOrUserProtectionRoute,
} from "@middlewares/csrf";

const paymentMethodRoute = Router();

paymentMethodRoute.get(
	"/code/:code",
	csrfGuestOrUserProtectionRoute,
	validators.validatePaymentMethodCodeParam,
	handleValidationResult,
	controllers.GetPaymentMethodByCode,
	errorHandler
);

paymentMethodRoute.get(
	"/all",
	csrfAdminProtectionRoute,
	controllers.ListAllPaymentMethods,
	errorHandler
);

paymentMethodRoute.get(
	"/active",
	csrfGuestOrUserProtectionRoute,
	controllers.ListActivePaymentMethods,
	errorHandler
);

paymentMethodRoute.post(
	"/",
	csrfAdminProtectionRoute,
	handleValidationResult,
	controllers.AddPaymentMethod,
	errorHandler
);

paymentMethodRoute.put(
	"/:id",
	csrfAdminProtectionRoute,
    validators.validateCreatePaymentMethod,
	handleValidationResult,
	controllers.UpdatePaymentMethod,
	errorHandler
);

paymentMethodRoute.delete(
	"/:id",
	csrfAdminProtectionRoute,
    validators.validateUpdatePaymentMethod,
	handleValidationResult,
	controllers.RemovePaymentMethod,
	errorHandler
);

export default paymentMethodRoute;
