/**
 * Enum for the available payment methods.
 * @enum {string}
 * @property {string} VNPAY - VNPay payment gateway.
 * @property {string} MOMO - MoMo payment gateway.
 * @property {string} ZALOPAY - ZaloPay payment gateway.
 * @property {string} CASH - Cash payment.
 */
export enum PaymentMethod {
	VNPAY = "vnpay",
	MOMO = "momo",
	ZALOPAY = "zalopay",
	CASH = "cash",
}

/**
 * Enum for the status of a payment.
 * @enum {string}
 * @property {string} PENDING - Payment is pending.
 * @property {string} PROCESSING - Payment is being processed.
 * @property {string} COMPLETED - Payment has been completed successfully.
 * @property {string} FAILED - Payment has failed.
 * @property {string} CANCELLED - Payment has been cancelled.
 * @property {string} EXPIRED - Payment has expired.
 */
export enum PaymentStatus {
	PENDING = "pending",
	PROCESSING = "processing",
	COMPLETED = "completed",
	FAILED = "failed",
	CANCELLED = "cancelled",
	EXPIRED = "expired",
}

/**
 * Interface for a payment request.
 * @interface PaymentRequest
 * @property {number} amount - The amount to be paid.
 * @property {string} orderInfo - Information about the order.
 * @property {string} orderRef - Reference for the order.
 * @property {string} ipAddress - The IP address of the client.
 * @property {string} returnUrl - The URL to return to after payment.
 * @property {PaymentMethod} paymentMethod - The payment method used.
 */
export interface PaymentRequest {
	amount: number;
	orderInfo: string;
	orderRef: string;
	ipAddress: string;
	returnUrl: string;
	paymentMethod: PaymentMethod;
}

/**
 * Interface for the response from initiating a payment.
 * @interface PaymentInitResponse
 * @property {boolean} success - Whether the payment initiation was successful.
 * @property {string} paymentUrl - The URL to redirect for payment.
 * @property {string} transactionNo - The transaction number.
 * @property {any} rawData - Raw data from the payment gateway.
 * @property {string} [message] - Optional message.
 */
export interface PaymentInitResponse {
	success: boolean;
	paymentUrl: string;
	transactionNo: string;
	rawData: any;
	message?: string;
}

/**
 * Interface for payment callback data.
 * @interface PaymentCallbackData
 * @property {string} transactionNo - The transaction number.
 * @property {number} amount - The payment amount.
 * @property {string} orderRef - The order reference.
 * @property {PaymentMethod} paymentMethod - The payment method.
 * @property {string} signature - The signature for verification.
 * @property {any} rawData - Raw data from the callback.
 * @property {PaymentStatus} status - The payment status.
 */
export interface PaymentCallbackData {
	transactionNo: string;
	amount: number;
	orderRef: string;
	paymentMethod: PaymentMethod;
	signature: string;
	rawData: any;
	status: PaymentStatus;
}

/**
 * Interface for payment status response.
 * @interface PaymentStatusResponse
 * @property {PaymentStatus} status - The current payment status.
 * @property {string} transactionNo - The transaction number.
 * @property {number} amount - The payment amount.
 * @property {string} [message] - Optional message.
 */
export interface PaymentStatusResponse {
	status: PaymentStatus;
	transactionNo: string;
	amount: number;
	message?: string;
}

/**
 * Interface for creating a payment.
 * @interface CreatePaymentDTO
 * @property {number} totalAmount - The total amount for the payment.
 * @property {string} paymentMethodId - The ID of the payment method.
 * @property {string} merchantOrderRef - The merchant order reference.
 * @property {Date} expiredAt - The expiration date of the payment.
 */
export interface CreatePaymentDTO {
	totalAmount: number;
	paymentMethodId: string;
	merchantOrderRef: string;
	expiredAt: Date;
}

/**
 * Interface for updating a payment.
 * @interface UpdatePaymentDTO
 * @property {PaymentStatus} [paymentStatus] - The updated payment status.
 * @property {string} [gatewayTransactionNo] - The gateway transaction number.
 * @property {any} [gatewayResponseData] - Response data from the gateway.
 * @property {Date} [expiredAt] - The updated expiration date.
 */
export interface UpdatePaymentDTO {
	paymentStatus?: PaymentStatus;
	gatewayTransactionNo?: string;
	gatewayResponseData?: any;
	expiredAt?: Date;
}

/**
 * Interface for payment response DTO.
 * @interface PaymentResponseDTO
 * @property {string} id - The payment ID.
 * @property {number} totalAmount - The total amount.
 * @property {string} paymentMethodId - The payment method ID.
 * @property {PaymentStatus} paymentStatus - The payment status.
 * @property {string} merchantOrderRef - The merchant order reference.
 * @property {string | null} gatewayTransactionNo - The gateway transaction number.
 * @property {any | null} gatewayResponseData - The gateway response data.
 * @property {string} createdAt - The creation timestamp.
 * @property {string} expiredAt - The expiration timestamp.
 * @property {string} updatedAt - The update timestamp.
 * @property {Object} [paymentMethod] - The associated payment method.
 * @property {string} paymentMethod.id - The payment method ID.
 * @property {string} paymentMethod.name - The payment method name.
 * @property {string} paymentMethod.code - The payment method code.
 */
export interface PaymentResponseDTO {
	id: string;
	totalAmount: number;
	paymentMethodId: string;
	paymentStatus: PaymentStatus;
	merchantOrderRef: string;
	gatewayTransactionNo: string | null;
	gatewayResponseData: any | null;
	createdAt: string;
	expiredAt: string;
	updatedAt: string;
	paymentMethod?: {
		id: string;
		name: string;
		code: string;
	};
}

/**
 * Interface for initiating a payment.
 * @interface InitiatePaymentDTO
 * @property {string} orderId - The ID of the order.
 * @property {PaymentMethod} paymentMethodCode - The payment method code.
 * @property {PaymentAdditionalData} [additionalData] - Additional payment data.
 */
export interface InitiatePaymentDTO {
	orderId: string;
	paymentMethodCode: PaymentMethod;
	additionalData?: PaymentAdditionalData;
}

/**
 * Interface for additional payment data.
 * @interface PaymentAdditionalData
 * @property {string} [ipAddress] - The client's IP address.
 * @property {string} [returnUrl] - The return URL after payment.
 * @property {string} [orderInfo] - Information about the order.
 * @property {string} [locale] - The locale for the payment.
 * @property {any} [key] - Additional key-value pairs.
 */
export interface PaymentAdditionalData {
	ipAddress?: string;
	returnUrl?: string;
	orderInfo?: string;
	locale?: string;
	[key: string]: any;
}

/**
 * Interface for payment callback DTO.
 * @interface PaymentCallbackDTO
 * @property {string} paymentMethodCode - The payment method code.
 * @property {any} callbackData - The callback data.
 */
export interface PaymentCallbackDTO {
	paymentMethodCode: string;
	callbackData: any;
}

/**
 * Interface for payment verification result.
 * @interface PaymentVerificationResult
 * @property {boolean} isValid - Whether the payment is valid.
 * @property {PaymentStatus} status - The payment status.
 * @property {string} [gatewayTransactionNo] - The gateway transaction number.
 * @property {string} merchantOrderRef - The merchant order reference.
 * @property {string} [message] - Optional message.
 * @property {any} [gatewayResponseData] - The gateway response data.
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
 * Interface for payment refund DTO.
 * @interface PaymentRefundDTO
 * @property {string} paymentId - The ID of the payment to refund.
 * @property {number} amount - The amount to refund.
 * @property {string} [reason] - The reason for the refund.
 * @property {string} [performedBy] - Identifier for the user/system performing the refund.
 * @property {string} [ipAddress] - IP address of the client initiating the refund.
 */
export interface PaymentRefundDTO {
    paymentId: string;
    amount: number;
    reason?: string;
    performedBy?: string;
    ipAddress?: string;
}

/**
 * Interface for payment refund result.
 * @interface PaymentRefundResult
 * @property {boolean} isSuccess - Whether the refund was successful.
 * @property {string} [transactionId] - The transaction ID from the payment gateway for the refund.
 * @property {string} [reason] - The reason for the refund.
 */
export interface PaymentRefundResult {
	isSuccess: boolean;
    transactionId?: string;
	gatewayResponseData?: any;
}

/**
 * Interface for gateway refund options.
 * @interface GatewayRefundOptions
 * @property {number} amount - The refund amount.
 * @property {string} [reason] - The reason for the refund.
 * @property {string} originalGatewayTxnId - The original transaction ID from the gateway.
 * @property {string} [performedBy] - Identifier for the user/system performing the refund.
 * @property {string} [ipAddress] - IP address of the client initiating the refund.
 * @property {any} [key] - Allows for additional gateway-specific properties.
 */
export interface GatewayRefundOptions {
    amount: number;
    reason?: string;
    originalGatewayTxnId: string;
    performedBy?: string;
    ipAddress?: string;
    [key: string]: any; // Allow any other gateway-specific properties
}