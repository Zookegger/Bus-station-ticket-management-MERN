import type { CouponUsage } from "./coupon";
import type { Payment, PaymentAdditionalData } from "./payment";
import type { PaymentMethod } from "./paymentMethods";
import type { Ticket, TicketAttributes } from "./ticket";
import type { User } from "./user";


/**
 * Information for guest purchasers.
 * Email is mandatory for guest checkouts.
 * @interface GuestPurchaserInfo
 * @property {string} [email] - The email address of the guest purchaser.
 * @property {string} [name] - The name of the guest purchaser.
 * @property {string} [phone] - The phone number of the guest purchaser.
 */
export type GuestPurchaserInfo = {
	/** The email address of the guest purchaser. */
	email?: string;
	/** The name of the guest purchaser. */
	name?: string;
	/** The phone number of the guest purchaser. */
	phone?: string;
};

/**
 * DTO for creating a new Order.
 * Supports both registered users (via userId) and guests (via guestInfo).
 * @interface CreateOrderDTO
 * @property {number[]} seatIds - Array of seat IDs to book.
 * @property {string | null} [userId] - ID of the registered user (null for guests).
 * @property {GuestPurchaserInfo | null} [guestInfo] - Information for guest purchasers.
 * @property {PaymentMethod} paymentMethodCode - The payment method code.
 * @property {string | null} [couponCode] - Optional coupon code for discount.
 * @property {PaymentAdditionalData | null} [additionalData] - Additional payment data.
 */
export interface CreateOrderDTO {
	/** Array of seat IDs to book. */
	seatIds: number[];
	/** ID of the registered user (null for guests). */
	userId?: string | null;
	/** Information for guest purchasers. */
	guestInfo?: GuestPurchaserInfo | null;
	/** The payment method code. */
	paymentMethodCode: PaymentMethod;
	/** Optional coupon code for discount. */
	couponCode?: string | null;
	/** Additional payment data. */
	additionalData?: PaymentAdditionalData | null;
}

/**
 * DTO for refunding one or more tickets within an order.
 * @interface RefundTicketDTO
 * @property {string} orderId - The ID of the order containing the tickets.
 * @property {number[]} ticketIds - Array of ticket IDs to refund.
 * @property {string} [refundReason] - Optional reason for the refund.
 */
export interface RefundTicketDTO {
	/** The ID of the order containing the tickets. */
	orderId: string;
	/** Array of ticket IDs to refund. */
	ticketIds: number[];
	/** Optional reason for the refund. */
	refundReason?: string;
}

/**
 * Result returned after creating an order.
 * @interface CreateOrderResult
 * @property {Object} order - The created order details.
 * @property {string} order.id - The unique ID of the order.
 * @property {OrderStatus} order.status - The status of the order.
 * @property {number} order.totalFinalPrice - The total final price after discounts.
 * @property {Ticket[]} order.tickets - Array of tickets in the order.
 * @property {string} [paymentUrl] - Optional URL to redirect for payment.
 */
export interface CreateOrderResult {
	/** The created order details. */
	order: {
		/** The unique ID of the order. */
		id: string;
		/** The status of the order. */
		status: OrderStatus;
		/** The total final price after discounts. */
		totalFinalPrice: number;
		/** Array of tickets in the order. */
		tickets: TicketAttributes[];
	};
	/** Optional URL to redirect for payment. */
	paymentUrl?: string;
}


/**
 * Options for querying orders with filtering, sorting, and pagination.
 * Used by functions like getUserOrders and getGuestOrders.
 * @interface OrderQueryOptions
 * @property {OrderStatus} [status] - Filter by order status.
 * @property {Date} [dateFrom] - Filter by creation date from.
 * @property {Date} [dateTo] - Filter by creation date to.
 * @property {Date} [updatedFrom] - Filter by last updated date from.
 * @property {Date} [updatedTo] - Filter by last updated date to.
 * @property {number} [limit] - Limit the number of results.
 * @property {number} [offset] - Offset for pagination.
 * @property {keyof OrderAttributes} [sortBy] - Sort by field.
 * @property {"ASC" | "DESC"} [sortOrder] - Sort order.
 * @property {("tickets" | "payment" | "couponUsage")[]} [include] - Optional associations to include.
 */
export interface OrderQueryOptions {
	/** Filter by order status. */
	status?: OrderStatus;
	/** Filter by creation date from. */
	dateFrom?: Date;
	/** Filter by creation date to. */
	dateTo?: Date;
	/** Filter by last updated date from. */
	updatedFrom?: Date;
	/** Filter by last updated date to. */
	updatedTo?: Date;
	/** Limit the number of results. */
	limit?: number;
	/** Offset for pagination. */
	offset?: number;
	/** Sort by field. */
	sortBy?: keyof Order;
	/** Sort order. */
	sortOrder?: "ASC" | "DESC";
	/** Optional associations to include. */
	include?: ("tickets" | "payment" | "couponUsage")[];
}

/**
 * Order status values (mirrors server `OrderStatus` enum).
 */
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

/**
 * Enum for the status of an order.
 * @enum {string}
 * @property {string} PENDING - The order is pending and awaiting confirmation or payment.
 * @property {string} CONFIRMED - The order has been confirmed.
 * @property {string} CANCELLED - The order has been cancelled.
 * @property {string} PARTIALLY_REFUNDED - The order has been partially refunded.
 * @property {string} REFUNDED - The order has been fully refunded.
 * @property {string} EXPIRED - The order has expired.
 */
export const OrderStatus = {
	/** The order is pending and awaiting confirmation or payment. */
	PENDING: "PENDING",
	/** The order has been confirmed. */
	CONFIRMED: "CONFIRMED",
	/** The order has been cancelled. */
	CANCELLED: "CANCELLED",
	/** The order has been partially refunded. */
	PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
	/** The order has been fully refunded. */
	REFUNDED: "REFUNDED",
	/** The order has expired. */
	EXPIRED: "EXPIRED"
} as const;

/**
 * Model attribute interface for Order (server-aligned)
 */
export interface Order {
	id: string; // UUID
	/** The user id for the order; null for guest checkouts. */
	userId: string | null;
	user?: User | null;
	tickets: Ticket[];
	payment: Payment[] | null;
	couponUsage: CouponUsage | null;
	totalBasePrice: number;
	totalDiscount: number;
	totalFinalPrice: number;
	guestPurchaserEmail?: string | null;
	guestPurchaserName?: string | null;
	guestPurchaserPhone?: string | null;
	status: OrderStatus;
	createdAt?: Date | string;
	updatedAt?: Date | string;
}

/**
 * DTO for check-in request.
 * @interface OrderCheckInRequest
 * @property {string} orderId - The ID of the order to check in.
 * @property {string} token - The security token for verification.
 */
export interface OrderCheckInRequest {
	/** The ID of the order to check in. */
	orderId: string;
	/** The security token for verification. */
	token: string;
}

/**
 * Response for check-in verification.
 * @interface OrderCheckInResponse
 * @property {Order} order - The order details after successful check-in.
 * @property {string} [message] - Optional success message.
 */
export interface OrderCheckInResponse {
	/** The order details after successful check-in. */
	order: Order | null;
	/** Optional success message. */
	message?: string;
}