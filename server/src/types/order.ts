import { OrderStatus } from "@models/orders";
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
	email?: string;
	name?: string;
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
	seatIds: number[];
	userId?: string | null;
	guestInfo?: GuestPurchaserInfo | null;
	paymentMethodCode: PaymentMethod;
	couponCode?: string | null;
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
	orderId: string;
	ticketIds: number[];
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
	order: {
		id: string;
		status: OrderStatus;
		totalFinalPrice: number;
		tickets: Ticket[];
	};
	paymentUrl?: string;
}
