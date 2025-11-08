import type { Seat } from "@my-types/seat";
import type { PaymentInitResponse, PaymentMethodCode } from "@my-types/payment";

/**
 * Client-side type definitions for Tickets.
 * Based on server/src/types/ticket.ts
 */

export type TicketStatus = "PENDING" | "BOOKED" | "CANCELLED" | "COMPLETED" | "REFUNDED" | "INVALID" | "EXPIRED";

/**
 * Represents a single ticket on the client-side.
 */
export interface Ticket {
	id: number;
	orderId: string;
	userId: string | null;
	seatId: number;
	basePrice: number;
	finalPrice: number;
	status: TicketStatus;
	createdAt: string; // ISO Date string
	updatedAt: string; // ISO Date string
	seat?: Seat;
}

/**
 * DTO for creating a new Ticket record.
 */
export interface BookTicketDTO {
	userId: string;
	seatIds?: number | number[] | null;
	couponIds?: string | null;
  	paymentMethodCode: PaymentMethodCode;
	additionalData?: Record<string, any>;
}

/**
 * Response returned by the booking flow to the client.
 */
export interface BookTicketResult {
  ticketIds: number[];
  paymentUrl?: string;
  payment?: PaymentInitResponse;
}

/**
 * DTO for filtering or searching Tickets.
 */
export interface GetTicketQueryDTO {
	userId?: string;
	tripId?: number;
	status?: TicketStatus;
	minBasePrice?: number;
	maxBasePrice?: number;
	minFinalPrice?: number;
	maxFinalPrice?: number;
}

/**
 * Options for querying tickets.
 */
export interface TicketQueryOptions {
	status?: TicketStatus;
	orderId?: string;
	seatId?: number;
	dateFrom?: string; // ISO Date string
	dateTo?: string; // ISO Date string
	updatedFrom?: string; // ISO Date string
	updatedTo?: string; // ISO Date string
	minBasePrice?: number;
	maxBasePrice?: number;
	minFinalPrice?: number;
	maxFinalPrice?: number;
	limit?: number;
	offset?: number;
	sortBy?: 'id' | 'basePrice' | 'finalPrice' | 'status' | 'createdAt' | 'updatedAt';
	sortOrder?: "ASC" | "DESC";
	include?: ("user" | "seat" | "order" | "payments")[];
}

/**
 * DTO for admin ticket updates.
 */
export interface AdminUpdateTicketDTO {
    status?: TicketStatus;
    seatId?: number | null;
    note?: string | null;
}
