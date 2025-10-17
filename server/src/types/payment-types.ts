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
	paymentMethod: PaymentMethod;
	orderInfo: string;
	userId: string;
	ticketIds?: string[];
}
