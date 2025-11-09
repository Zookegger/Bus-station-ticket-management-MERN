import * as couponServices from "@controllers/couponController";
import {
	csrfAdminProtectionRoute,
	csrfGuestOrUserProtectionRoute,
} from "@middlewares/csrf";
import { errorHandler } from "@middlewares/errorHandler";
import { uploadMiddleware } from "@middlewares/upload";
import { handleValidationResult } from "@middlewares/validateRequest";
import {
	validateAddCoupon,
	validateCouponCode,
	validateCouponId,
	validatePreviewCoupon,
	validateUpdateCoupon,
} from "@middlewares/validators/couponValidator";
import { Router } from "express";

const couponRouter = Router();

couponRouter.get(
	"/",
	csrfGuestOrUserProtectionRoute,
	couponServices.SearchCoupons,
	errorHandler
);
couponRouter.get(
	"/code/:code",
	validateCouponCode,
	handleValidationResult,
	csrfGuestOrUserProtectionRoute,
	couponServices.GetCouponByCode,
	errorHandler
);
couponRouter.get(
	"/:id",
	validateCouponId,
	handleValidationResult,
	csrfGuestOrUserProtectionRoute,
	couponServices.GetCouponById,
	errorHandler
);
couponRouter.post(
	"/preview",
	validatePreviewCoupon,
	handleValidationResult,
	csrfGuestOrUserProtectionRoute,
	couponServices.PreviewCoupon,
	errorHandler
);
couponRouter.post(
	"/",
	validateAddCoupon,
	handleValidationResult,
	csrfAdminProtectionRoute,
	uploadMiddleware.single('image'),
	couponServices.AddCoupon,
	errorHandler
);
couponRouter.put(
	"/:id",
	validateUpdateCoupon,
	handleValidationResult,
	csrfAdminProtectionRoute,
	uploadMiddleware.single('image'),
	couponServices.UpdateCoupon,
	errorHandler
);
couponRouter.delete(
	"/:id",
	validateCouponId,
	handleValidationResult,
	csrfAdminProtectionRoute,
	couponServices.DeleteCoupon,
	errorHandler
);

export default couponRouter;
