import type { Coupon } from "@my-types";

export interface AddCouponFormProps {
	open: boolean;
	onClose: () => void;
	onCreated?: (coupon: Coupon) => void;
}

export interface EditCouponFormProps {
	coupon: Coupon | null;
	open: boolean;
	onClose: () => void;
	onEdited?: (updated_coupon: Coupon) => void;
}

export interface DeleteCouponFormProps {
	id?: number;
	open: boolean;
	onClose: () => void;
	onConfirm?: (id: number) => void;
}

export interface CouponDetailsDrawerProps {
	open: boolean;
	onClose: () => void;
	coupon: Coupon | null;
	onEdit?: (coupon: Coupon) => void;
	onDelete?: (id: number) => void;
}
