/**
 * Enum for the types of coupons available in the system.
 * @enum {string}
 * @property {string} PERCENTAGE - A percentage-based discount coupon.
 * @property {string} FIXED - A fixed amount discount coupon.
 */
export enum CouponTypes {
	PERCENTAGE = "percentage",
	FIXED = "fixed"
}