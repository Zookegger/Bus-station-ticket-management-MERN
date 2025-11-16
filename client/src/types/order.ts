import type { Ticket } from "@my-types/ticket";
import type { Payment } from "@my-types/payment";
import type { PaymentMethodCode } from "@my-types/payment";

/**
 * Client-side type definitions for Orders.
 * Based on server/src/types/order.ts
 */

export type OrderStatus =
	| "PENDING"
	| "CONFIRMED"
	| "CANCELLED"
	| "PARTIALLY_REFUNDED"
	| "REFUNDED"
	| "EXPIRED";

/**
 * Information for guest purchasers.
 */
export interface GuestPurchaserInfo {
	email?: string;
	name?: string;
	phone?: string;
}

/**
 * Represents the structure of an order on the client-side.
 */
export interface Order {
	id: string;
	userId: string | null;
	guestPurchaserEmail: string | null;
	guestPurchaserName: string | null;
	guestPurchaserPhone: string | null;
	totalBasePrice: number;
	totalDiscount: number;
	totalFinalPrice: number;
	status: OrderStatus;
	createdAt: string; // ISO Date string
	updatedAt: string; // ISO Date string
	tickets?: Ticket[];
	payment?: Payment;
}

/**
 * DTO for creating a new Order.
 */
export interface CreateOrderDTO {
	seatIds: number[];
	userId?: string | null;
	guestInfo?: GuestPurchaserInfo | null;
	paymentMethodCode: PaymentMethodCode;
	couponCode?: string | null;
	additionalData?: Record<string, any> | null;
}

/**
 * DTO for refunding one or more tickets within an order.
 */
export interface RefundTicketDTO {
	orderId: string;
	ticketIds: number[];
	refundReason?: string;
}

/**
 * Result returned after creating an order.
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

/**
 * Options for querying orders.
 */
export interface OrderQueryOptions {
	status?: OrderStatus;
	dateFrom?: string; // ISO Date string
	dateTo?: string; // ISO Date string
	updatedFrom?: string; // ISO Date string
	updatedTo?: string; // ISO Date string
	limit?: number;
	offset?: number;
	sortBy?: 'id' | 'status' | 'totalFinalPrice' | 'createdAt' | 'updatedAt';
	sortOrder?: "ASC" | "DESC";
	include?: ("tickets" | "payment" | "couponUsage")[];
}

/**
 * Defines the shape of the request body for the check-in operation.
 */
export interface OrderCheckInRequest {
	orderId: string;
	token: string;
}

/**
 * Defines the shape of the successful response from the check-in operation.
 */
export interface OrderCheckInResponse {
	message: string;
	order: Order;
}
