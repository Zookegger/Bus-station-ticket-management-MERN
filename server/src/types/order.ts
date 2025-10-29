import { OrderAttributes, OrderStatus } from "@models/orders";
import { Ticket } from "@models/ticket";
import { PaymentAdditionalData, PaymentMethod } from "@my_types/payments";

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
		tickets: Ticket[];
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
	sortBy?: keyof OrderAttributes;
	/** Sort order. */
	sortOrder?: "ASC" | "DESC";
	/** Optional associations to include. */
	include?: ("tickets" | "payment" | "couponUsage")[];
}
