import {
	AddCouponDTO,
	PreviewCouponDTO,
	UpdateCouponDTO,
} from "@my_types/coupon";
import { NextFunction, Request, Response } from "express";
import * as couponServices from "@services/couponServices";
import { getParamNumericId } from "@utils/request";

export const AddCoupon = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const dto: AddCouponDTO = req.body;
		const imageFile = req.file;
		if (!dto) throw { status: 400, message: "Coupon data is required." };

		const imgUrl = imageFile ? `/uploads/${imageFile.filename}` : undefined;

		if (imgUrl != undefined) {
			dto.imgUrl = imgUrl;
		}

		const coupon = await couponServices.addCoupon(dto);
		if (!coupon) throw { status: 500, message: "Failed to create coupon." };

		res.status(201).json(coupon);
	} catch (err) {
		next(err);
	}
};

export const UpdateCoupon = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id: number = getParamNumericId(req);
		const dto: UpdateCouponDTO = req.body;
		const file = req.file;
		if (!dto) throw { status: 400, message: "Update data is required." };
		const imgUrl = file ? `/uploads/${file.filename}` : undefined;

		if (imgUrl != undefined) {
			dto.imgUrl = imgUrl;
		}

		const coupon = await couponServices.updateCoupon(id, dto);
		if (!coupon) throw { status: 500, message: "Failed to update coupon." };

		res.status(200).json(coupon);
	} catch (err) {
		next(err);
	}
};

export const DeleteCoupon = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id: number = getParamNumericId(req);

		await couponServices.deleteCoupon(id);

		res.status(200).json({
			success: true,
			message: "Coupon deleted successfully.",
		});
	} catch (err) {
		next(err);
	}
};

export const SearchCoupons = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const coupons = await couponServices.listCoupons();

		res.status(200).json(coupons);
	} catch (err) {
		next(err);
	}
};

export const GetCouponByCode = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { code } = req.params;

		if (!code || typeof code !== "string" || code.trim() === "") {
			throw { status: 400, message: "Invalid or missing coupon code parameter." };
		}
		const coupons = await couponServices.getCouponByCode(
			code?.toString().trim()
		);

		res.status(200).json(coupons);
	} catch (err) {
		next(err);
	}
};

export const GetCouponById = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);
		const coupons = await couponServices.getCouponById(id);

		res.status(200).json(coupons);
	} catch (err) {
		next(err);
	}
};

export const PreviewCoupon = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const dto: PreviewCouponDTO = req.body;
		if (!dto) throw { status: 400, message: "Preview data is required." };

		const result = await couponServices.previewCouponDiscount(dto);

		res.status(200).json(result);
	} catch (err) {
		next(err);
	}
};
