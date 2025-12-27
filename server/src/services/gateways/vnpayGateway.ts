import axios from "axios";
import crypto from "crypto";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Payment } from "@models/payment";
import { Ticket } from "@models/ticket";
import logger from "@utils/logger";
import type { IPaymentGateway } from "@services/paymentServices";
import {
	GatewayRefundOptions,
	PaymentRefundResult,
	PaymentStatus,
	PaymentVerificationResult,
} from "@my_types/payments";

/**
 * Configuration values supplied by the merchant for VNPay integration.
 */
interface VNPayConfig {
	/** Terminal code issued by VNPay. */
	VNP_TMN_CODE: string;
	/** Secret string used when generating request signatures. */
	VNP_HASH_SECRET: string;
	/** Base URL for VNPay payment gateway redirects. */
	VNP_URL: string;
	/** URL VNPay will redirect customers back to after payment. */
	VNP_RETURN_URL: string;
	/** Optional predefined order type (defaults to travel). */
	VNP_ORDER_TYPE?: string;
	/** Preferred locale for the payment page (vn/en). */
	VNP_LOCALE?: "vn" | "en";
	/** Direct refund endpoint if provided. */
	VNP_REFUND_URL?: string;
	/** General-purpose API endpoint fallback for refunds. */
	VNP_API_URL?: string;
}

/**
 * Optional caller-provided overrides used at payment creation time.
 */
interface VNPayAdditionalData {
	/** Human readable order description shown on VNPay screens. */
	orderInfo?: string;
	/** Locale override for the payment page. */
	locale?: "vn" | "en";
	/** IP address forwarded to VNPay for audit purposes. */
	ipAddress?: string;
	/** Bank code to preselect a specific payment method. */
	bankCode?: string;
	/** Expiration timestamp in yyyyMMddHHmmss format. */
	expireDate?: string;
}

/**
 * Defines the shape of the parameters object to be sent to VNPay
 */
export interface VNPayParams {
	vnp_Version: "2.1.0";
	vnp_Command: "pay";
	vnp_TmnCode: string;
	vnp_Amount: number;
	vnp_CurrCode: "VND";
	vnp_TxnRef: string;
	vnp_OrderInfo: string;
	vnp_OrderType: string;
	vnp_ReturnUrl: string;
	vnp_IpAddr: string;
	vnp_CreateDate: string;
	vnp_SecureHash: string;
	vnp_Locale?: "vn" | "en";
	vnp_BankCode?: string;
	vnp_ExpireDate?: string;
}

type VNPayBaseParams = Omit<VNPayParams, "vnp_SecureHash">;

/**
 * HELPER: Sorts object by key (ASCII), filters empty values, and encodes values
 * to match C# WebUtility.UrlEncode behavior.
 */
const stringifyAndSortParams = (params: object): string => {
	// 1. Get entries and filter out empty values
	const entries = Object.entries(params as Record<string, unknown>)
		.filter(
			([_, value]) =>
				value !== undefined && value !== null && value !== ""
		)
		.map(([key, value]) => [key, String(value)] as [string, string]);

	// 2. Sort by Key using ASCII comparison (Matches C# SortedDictionary default behavior)
	//    CRITICAL: Do NOT use localeCompare. VNPay requires strict ASCII order.
	entries.sort(([key1], [key2]) => {
		if (key1 > key2) return 1;
		if (key1 < key2) return -1;
		return 0;
	});

	// 3. Build the query string: key=UrlEncode(value)
	//    Matches C# logic: $"{p.Key}={WebUtility.UrlEncode(p.Value)}"
	return entries
		.map(([key, value]) => {
			// Encode value to match .NET WebUtility.UrlEncode
			// 1. encodeURIComponent handles most chars
			// 2. Replace %20 with + (standard form encoding)
			const encodedValue = encodeURIComponent(value).replace(/%20/g, "+");

			// The key is NOT encoded in the C# implementation provided, so we leave it raw.
			return `${key}=${encodedValue}`;
		})
		.join("&");
};

/**
 * Computes VNPay's HMAC signature and returns the full signature string.
 */
const calculateSecureHash = (queryString: string, secret: string): string => {
	return crypto
		.createHmac("sha512", secret)
		.update(Buffer.from(queryString, "utf-8"))
		.digest("hex");
};

// /**
//  * Creates a generic HMAC signature for VNPay auxiliary endpoints (e.g., refund).
//  */
// const signGenericParams = (
// 	params: Record<string, unknown>,
// 	secret: string
// ): Record<string, string> => {
// 	// 1. Build the canonical query string (Sorted & Encoded)
// 	const canonical = stringifyAndSortParams(params);

// 	// 2. Hash the string
// 	const signature = calculateSecureHash(canonical, secret);

// 	// 3. Return object with sorted keys + hash (Required for the body)
// 	const result: Record<string, string> = {};

// 	Object.keys(params)
// 		.sort()
// 		.forEach((key) => {
// 			const val = params[key];
// 			if (val !== undefined && val !== null && val !== "") {
// 				result[key] = String(val);
// 			}
// 		});

// 	result["vnp_SecureHash"] = signature;
// 	return result;
// };

const sanitizeEndpoint = (endpoint: string): string =>
	endpoint.replace(/\/$/, "");

/**
 * Helper to get current time in Vietnam (GMT+7)
 */
const getVietnamTime = (): Date => {
	return toZonedTime(new Date(), "Asia/Ho_Chi_Minh");
};

/**
 * VNPay concrete gateway implementation.
 */
export class VNPayGateway implements IPaymentGateway {
	getName(): string {
		return "VNPay";
	}

	async createPaymentUrl(
		payment: Payment,
		tickets: Ticket[],
		config: VNPayConfig,
		additionalData: VNPayAdditionalData = {}
	): Promise<string> {
		// Use payment.createdAt to ensure consistency with refund's vnp_TransactionDate
		const createDate = format(
			toZonedTime(new Date(payment.createdAt), "Asia/Ho_Chi_Minh"),
			"yyyyMMddHHmmss"
		);

		const baseParams = {
			vnp_Version: "2.1.0",
			vnp_Command: "pay",
			vnp_TmnCode: config.VNP_TMN_CODE,
			vnp_Amount: Math.round(Number(payment.totalAmount) * 100),
			vnp_CurrCode: "VND",
			vnp_TxnRef: payment.merchantOrderRef,
			vnp_OrderInfo:
				additionalData.orderInfo ||
				`Payment for ${
					payment.merchantOrderRef
				} - Bus tickets: ${tickets
					.map((t) => `#${t.seat?.number ?? t.id}`)
					.join(", ")}`,
			vnp_OrderType: config.VNP_ORDER_TYPE || "travel",
			vnp_ReturnUrl: config.VNP_RETURN_URL,
			vnp_IpAddr:
				additionalData.ipAddress && additionalData.ipAddress !== "::1"
					? additionalData.ipAddress
					: "127.0.0.1",
			vnp_CreateDate: createDate,
		} as VNPayBaseParams;

		if (additionalData.locale || config.VNP_LOCALE) {
			baseParams.vnp_Locale = (additionalData.locale ||
				config.VNP_LOCALE ||
				"vn") as "vn" | "en";
		}
		if (additionalData.bankCode) {
			baseParams.vnp_BankCode = additionalData.bankCode;
		}
		if (additionalData.expireDate) {
			baseParams.vnp_ExpireDate = additionalData.expireDate;
		}

		// 1. Build the query string (Sorted & Encoded)
		// This string MUST be the exact one hashed and the exact one used in the URL
		const queryString = stringifyAndSortParams(baseParams);

		// 2. Calculate Hash
		const signature = calculateSecureHash(
			queryString,
			config.VNP_HASH_SECRET
		);

		logger.debug(`[VNPay] Hash secret: ${config.VNP_HASH_SECRET}`);

		// 3. Construct Final URL manually to avoid re-encoding/re-sorting by URL constructors
		const url = `${sanitizeEndpoint(
			config.VNP_URL
		)}?${queryString}&vnp_SecureHash=${signature}`;

		logger.debug(
			`[VNPay] Generated payment URL for order ${payment.merchantOrderRef}`
		);
		logger.debug(url);

		return url;
	}

	async verifyCallback(
		data: Record<string, unknown>,
		config: VNPayConfig
	): Promise<PaymentVerificationResult> {
		const receivedHash =
			typeof data.vnp_SecureHash === "string"
				? data.vnp_SecureHash
				: undefined;

		const checksumParams: Record<string, unknown> = {};

		// Filter out the hash field
		for (const [key, value] of Object.entries(data)) {
			if (key !== "vnp_SecureHash") {
				checksumParams[key] = value;
			}
		}

		// Re-encode the incoming data to match how VNPay hashed it originally
		const canonical = stringifyAndSortParams(checksumParams);

		const expectedHash = calculateSecureHash(
			canonical,
			config.VNP_HASH_SECRET
		);

		const isValid = receivedHash === expectedHash;
		const status =
			data.vnp_ResponseCode === "00"
				? PaymentStatus.COMPLETED
				: PaymentStatus.FAILED;

		const gatewayTransactionNo =
			typeof data.vnp_TransactionNo === "string"
				? data.vnp_TransactionNo
				: undefined;

		return {
			isValid,
			status,
			...(gatewayTransactionNo ? { gatewayTransactionNo } : {}),
			merchantOrderRef: String(data.vnp_TxnRef ?? ""),
			message: isValid
				? "VNPay callback verified"
				: "Invalid VNPay signature",
			gatewayResponseData: data,
		};
	}

	async refundPayment(
		payment: Payment,
		config: VNPayConfig,
		options: GatewayRefundOptions
	): Promise<PaymentRefundResult> {
		if (!payment.gatewayTransactionNo) {
			throw new Error("VNPay refund requires gatewayTransactionNo");
		}

		const refundAmount = Math.round(options.amount * 100);
		const originalAmount = Math.round(Number(payment.totalAmount) * 100);
		const vnp_TransactionType = refundAmount < originalAmount ? "03" : "02";

		const now = getVietnamTime();

		const vnp_RequestId = `${Date.now()}`;
		const vnp_Version = "2.1.0";
		const vnp_Command = "refund";
		const vnp_TmnCode = config.VNP_TMN_CODE;
		const vnp_TxnRef = payment.merchantOrderRef;
		const vnp_TransactionNo = payment.gatewayTransactionNo;
		const vnp_OrderInfo =
			options.reason || `Refund for ${payment.merchantOrderRef}`;

		// Try to get the original transaction date from the gateway response data
		// If not available, fall back to payment creation time
		let vnp_TransactionDate = "";
		if (
			payment.gatewayResponseData &&
			typeof payment.gatewayResponseData === "object" &&
			"vnp_PayDate" in payment.gatewayResponseData
		) {
			vnp_TransactionDate = String(
				(payment.gatewayResponseData as any).vnp_PayDate
			);
		}
		
		// Fallback if vnp_PayDate is missing or invalid format
		if (!vnp_TransactionDate || vnp_TransactionDate.length !== 14) {
			vnp_TransactionDate = format(
				toZonedTime(new Date(payment.createdAt), "Asia/Ho_Chi_Minh"),
				"yyyyMMddHHmmss"
			);
		}

		const vnp_CreateBy = options.performedBy || "system";
		const vnp_CreateDate = format(now, "yyyyMMddHHmmss");
		
		// Ensure IPv4 for VNPay
		let vnp_IpAddr = options.ipAddress || "127.0.0.1";
		if (vnp_IpAddr === "::1") {
			vnp_IpAddr = "127.0.0.1";
		}

		const dataToHash = [
			vnp_RequestId,
			vnp_Version,
			vnp_Command,
			vnp_TmnCode,
			vnp_TransactionType,
			vnp_TxnRef,
			refundAmount,
			vnp_TransactionNo,
			vnp_TransactionDate,
			vnp_CreateBy,
			vnp_CreateDate,
			vnp_IpAddr,
			vnp_OrderInfo,
		].join("|");

		const vnp_SecureHash = crypto
			.createHmac("sha512", config.VNP_HASH_SECRET)
			.update(Buffer.from(dataToHash, "utf-8"))
			.digest("hex");

		const body = new URLSearchParams();
		body.append("vnp_RequestId", vnp_RequestId);
		body.append("vnp_Version", vnp_Version);
		body.append("vnp_Command", vnp_Command);
		body.append("vnp_TmnCode", vnp_TmnCode);
		body.append("vnp_TransactionType", vnp_TransactionType);
		body.append("vnp_TxnRef", vnp_TxnRef);
		body.append("vnp_Amount", String(refundAmount));
		body.append("vnp_TransactionNo", vnp_TransactionNo);
		body.append("vnp_TransactionDate", vnp_TransactionDate);
		body.append("vnp_CreateBy", vnp_CreateBy);
		body.append("vnp_CreateDate", vnp_CreateDate);
		body.append("vnp_IpAddr", vnp_IpAddr);
		body.append("vnp_OrderInfo", vnp_OrderInfo);
		body.append("vnp_SecureHash", vnp_SecureHash);

		const refundEndpoint = sanitizeEndpoint(
			config.VNP_REFUND_URL || config.VNP_API_URL || config.VNP_URL
		);

		logger.info(
			`[VNPay] Sending refund request to ${refundEndpoint}. Body: ${body.toString()}`
		);

		const response = await axios.post(refundEndpoint, body.toString(), {
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			timeout: 10_000,
		});

		const data = response?.data ?? {};
		const isSuccess = data.vnp_ResponseCode === "00";

		if (!isSuccess) {
			logger.error("[VNPay] refund failed:", data);
		}

		return {
			isSuccess,
			transactionId: response.data.transactionNo,
			gatewayResponseData: data,
		};
	}
}
	