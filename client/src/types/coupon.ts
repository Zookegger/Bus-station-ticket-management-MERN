/**
 * Client-side type definitions for Coupons.
 * Based on server/src/types/coupon.ts
 */

/**
 * Represents the types of coupons available.
 */
export type CouponType = (typeof CouponType)[keyof typeof CouponType];
export const CouponType = { PERCENTAGE: "PERCENTAGE", FIXED: "FIXED" } as const;

/**
 * DTO for creating a new coupon.
 */
export interface AddCouponDTO {
	code: string;
	type: CouponType;
	value: number;
	maxUsage: number;
	startPeriod: string; // ISO Date string
	endPeriod: string; // ISO Date string
	isActive?: boolean;
	description?: string;
	imgUrl?: string | null;
	title?: string;
}

/**
 * DTO for updating an existing coupon.
 */
export interface UpdateCouponDTO {
	code?: string;
	type?: CouponType;
	value?: number;
	maxUsage?: number;
	startPeriod?: string; // ISO Date string
	endPeriod?: string; // ISO Date string
	isActive?: boolean;
	description?: string;
	imgUrl?: string | null;
	title?: string;
}

/**
 * DTO for previewing a coupon's discount.
 */
export interface PreviewCouponDTO {
	code: string;
	orderTotal: number;
	userId: string | null;
}

/** Model attribute interfaces for Coupon (server-aligned) */
export interface Coupon {
	id: number;
	code: string;
	type: CouponType;
	value: number;
	maxUsage: number;
	currentUsageCount: number;
	startPeriod: Date | string;
	endPeriod: Date | string;
	isActive: boolean;
	description?: string | null;
	imgUrl?: string | null;
	title?: string | null;
	createdAt?: Date | string;
	updatedAt?: Date | string;
}

/**
 * Model attribute interfaces for CouponUsage (server-aligned).
 * Represents a record of coupon usage in an order.
 */
export interface CouponUsage {
	id: number;
	couponId: number;
	coupon?: Coupon;
	userId: string | null;
	orderId: string;
	discountAmount: number;
	usedAt?: Date | string;
	createdAt?: Date | string;
	updatedAt?: Date | string;
}
