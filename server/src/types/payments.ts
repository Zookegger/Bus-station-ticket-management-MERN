export enum PaymentMethod {
	VNPAY = "vnpay",
	MOMO = "momo",
	ZALOPAY = "zalopay",
	CASH = "cash",
}

export enum PaymentStatus {
	PENDING = "pending",
	PROCESSING = "processing",
	COMPLETED = "completed",
	FAILED = "failed",
	CANCELLED = "cancelled",
	EXPIRED = "expired",
}

export interface PaymentRequest {
	amount: number;
	orderInfo: string;
	orderRef: string;
	ipAddress: string;
	returnUrl: string;
	paymentMethod: PaymentMethod;
}

export interface PaymentInitResponse {
	success: boolean;
	paymentUrl: string;
	transactionNo: string;
	rawData: any;
	message?: string;
}

export interface PaymentCallbackData {
	transactionNo: string;
	amount: number;
	orderRef: string;
	paymentMethod: PaymentMethod;
	signature: string;
	rawData: any;
	status: PaymentStatus;
}

export interface PaymentStatusResponse {
	status: PaymentStatus;
	transactionNo: string;
	amount: number;
	message?: string;
}

export interface CreatePaymentDTO {
	totalAmount: number;
	paymentMethodId: string;
	merchantOrderRef: string;
	expiredAt: Date;
}

export interface UpdatePaymentDTO {
	paymentStatus?: PaymentStatus;
	gatewayTransactionNo?: string;
	gatewayResponseData?: any;
	expiredAt?: Date;
}

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

export interface InitiatePaymentDTO {
	ticketIds?: string[];
	paymentMethodCode: PaymentMethod;
	additionalData?: PaymentAdditionalData
}

export interface PaymentAdditionalData {
	ipAddress?: string;
	returnUrl?: string;
	orderInfo?: string;
	locale?: string;
	[key: string]: any;
}

export interface PaymentCallbackDTO {
	paymentMethodCode: string;
	callbackData: any;
}

