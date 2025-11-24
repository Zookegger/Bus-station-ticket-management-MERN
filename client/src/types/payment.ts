/**
 * Client-side type definitions for Payments.
 * Based on server/src/types/payments.ts
 */

export type PaymentMethodCode = "vnpay" | "momo" | "zalopay" | "cash";

export type PaymentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED" | "EXPIRED" | "REFUNDED" | "PARTIALLY_REFUNDED";

/**
 * Represents a payment record on the client-side.
 */
export interface Payment {
	id: string;
	orderId: string;
	paymentMethodId: number;
	amount: number;
	paymentStatus: PaymentStatus;
	transactionId: string | null;
	paymentGateway: string;
	createdAt: Date | string; // Date on server, ISO string on client
	updatedAt: Date | string; // Date on server, ISO string on client
}

/**
 * Data for initiating a payment.
 */
export interface InitiatePaymentDTO {
	orderId: string;
	paymentMethodCode: PaymentMethodCode;
	additionalData?: PaymentAdditionalData;
}

/**
 * Additional data for payment gateways.
 */
export interface PaymentAdditionalData {
	ipAddress?: string;
	returnUrl?: string;
	orderInfo?: string;
	locale?: string;
	[key: string]: any;
}

/**
 * Response from initiating a payment.
 */
export interface PaymentInitResponse {
	success: boolean;
	paymentUrl: string;
	transactionNo: string;
	rawData: any;
	message?: string;
}

/**
 * DTO for handling payment callbacks.
 */
export interface PaymentCallbackDTO {
	paymentMethodCode: string;
	callbackData: any;
}

/**
 * Result of payment verification.
 */
export interface PaymentVerificationResult {
	isValid: boolean;
	status: PaymentStatus;
	gatewayTransactionNo?: string;
	merchantOrderRef: string;
	message?: string;
	gatewayResponseData?: any;
}

/**
 * DTO for refunding a payment.
 */
export interface PaymentRefundDTO {
    paymentId: string;
    amount: number;
    reason?: string;
    performedBy?: string;
    ipAddress?: string;
}

/**
 * Result of a payment refund.
 */
export interface PaymentRefundResult {
	isSuccess: boolean;
    transactionId?: string;
	gatewayResponseData?: any;
}

/** Model attribute interfaces for Payment (server-aligned) */
export interface PaymentAttributes {
	id: string;
	orderId: string;
	totalAmount: number;
	paymentMethodId: string;
	paymentStatus: PaymentStatus;
	merchantOrderRef: string;
	gatewayTransactionNo?: string | null;
	gatewayResponseData?: any | null;
	createdAt?: Date | string;
	expiredAt?: Date | string;
	updatedAt?: Date | string;
}

export type PaymentCreationAttributes = Omit<Partial<PaymentAttributes>, 'id'> & Partial<Pick<PaymentAttributes, 'id'>>;
