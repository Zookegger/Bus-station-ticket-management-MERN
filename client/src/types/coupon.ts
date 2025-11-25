/**
 * Client-side type definitions for Coupons.
 * Based on server/src/types/coupon.ts
 */

/**
 * Represents the types of coupons available.
 */
export const COUPON_TYPES = ["PERCENTAGE", "FIXED"] as const;
export type CouponType = typeof COUPON_TYPES[number];

/**
 * Represents a coupon object on the client-side.
 */
export interface Coupon {
	id: number;
	code: string;
	type: CouponType;
	value: number;
	maxUsage: number;
	currentUsageCount: number;
	startPeriod: string; // ISO Date string
	endPeriod: string; // ISO Date string
	isActive: boolean;
	description?: string;
	imgUrl?: string;
	title?: string;
	createdAt: string; // ISO Date string
	updatedAt: string; // ISO Date string
}

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
export interface CouponAttributes {
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

export type CouponCreationAttributes = Omit<Partial<CouponAttributes>, 'id'> & Partial<Pick<CouponAttributes, 'id'>>;
