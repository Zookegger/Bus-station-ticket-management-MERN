/**
 * Enum for the types of coupons available in the system.
 * @enum {string}
 * @property {string} PERCENTAGE - A percentage-based discount coupon.
 * @property {string} FIXED - A fixed amount discount coupon.
 */
export enum CouponTypes {
	PERCENTAGE = "PERCENTAGE",
	FIXED = "FIXED",
}

/**
 * Data Transfer Object for creating a new coupon.
 * @interface AddCouponDTO
 * @property {string} code - The unique code for the coupon.
 * @property {CouponTypes} type - The type of discount (percentage or fixed).
 * @property {number} value - The numeric value of the discount.
 * @property {number} maxUsage - The maximum number of times this coupon can be used in total.
 * @property {Date} startPeriod - The date from which the coupon is valid.
 * @property {Date} endPeriod - The date until which the coupon is valid.
 * @property {boolean} [isActive] - Whether the coupon is active. Defaults to true.
 * @property {string} [description] - A description of the coupon.
 * @property {string} [imgUrl] - A URL for an image associated with the coupon.
 * @property {string} [title] - The title of the coupon.
 */
export interface AddCouponDTO {
	code: string;
	type: CouponTypes;
	value: number;
	maxUsage: number;
	startPeriod: Date;
	endPeriod: Date;
	currentUsageCount: number;
	isActive: boolean;
	description?: string;
	imgUrl?: string;
	title?: string;
}

/**
 * Data Transfer Object for updating an existing coupon.
 * All fields are optional.
 * @interface UpdateCouponDTO
 * @property {string} [code] - The unique code for the coupon.
 * @property {CouponTypes} [type] - The type of discount.
 * @property {number} [value] - The numeric value of the discount.
 * @property {number} [maxUsage] - The maximum number of times this coupon can be used.
 * @property {Date} startPeriod - The date from which the coupon is valid.
 * @property {Date} endPeriod - The date until which the coupon is valid.
 * @property {boolean} [isActive] - Whether the coupon is active.
 * @property {string} [description] - A description of the coupon.
 * @property {string} [imgUrl] - A URL for an image associated with the coupon.
 * @property {string} [title] - The title of the coupon.
 */
export interface UpdateCouponDTO {
	code?: string;
	type?: CouponTypes;
	value?: number;
	maxUsage?: number;
	startPeriod?: Date;
	endPeriod?: Date;
	isActive?: boolean;
	description?: string;
	imgUrl?: string;
	title?: string;
}

/**
 * DTO for previewing a coupon's discount against an order total.
 * @interface PreviewCouponDTO
 * @property {string} code - The coupon code to validate.
 * @property {number} orderTotal - The order's total base price before discount.
 * @property {string | null} userId - The user's ID, or null for guest orders.
 */
export interface PreviewCouponDTO {
    code: string;
    orderTotal: number;
    userId: string | null;
}

/**
 * DTO for reserving or consuming a coupon at order creation or payment confirmation.
 * @interface CouponReservationDTO
 * @property {number} couponId - The ID of the coupon to reserve/consume.
 * @property {string} orderId - The order ID associated with this usage.
 * @property {string | null} userId - The user's ID, or null for guest orders.
 * @property {number} discountAmount - The computed discount amount applied.
 */
export interface CouponReservationDTO {
	couponId: number;
	orderId: string;
	userId: string | null;
	discountAmount: number;
}