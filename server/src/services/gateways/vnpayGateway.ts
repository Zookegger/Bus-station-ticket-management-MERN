// import axios from "axios";
// import crypto from "crypto";
// import { format } from "date-fns";
// import { toZonedTime } from "date-fns-tz"; // New import for Timezone handling
// import { Payment } from "@models/payment";
// import { Ticket } from "@models/ticket";
// import logger from "@utils/logger";
// import type { IPaymentGateway } from "@services/paymentServices";
// import {
// 	GatewayRefundOptions,
// 	PaymentRefundResult,
// 	PaymentStatus,
// 	PaymentVerificationResult,
// } from "@my_types/payments";

// /**
//  * Configuration values supplied by the merchant for VNPay integration.
//  */
// interface VNPayConfig {
// 	/** Terminal code issued by VNPay. */
// 	VNP_TMN_CODE: string;
// 	/** Secret string used when generating request signatures. */
// 	VNP_HASH_SECRET: string;
// 	/** Base URL for VNPay payment gateway redirects. */
// 	VNP_URL: string;
// 	/** URL VNPay will redirect customers back to after payment. */
// 	VNP_RETURN_URL: string;
// 	/** Optional predefined order type (defaults to travel). */
// 	VNP_ORDER_TYPE?: string;
// 	/** Preferred locale for the payment page (vn/en). */
// 	VNP_LOCALE?: "vn" | "en";
// 	/** Direct refund endpoint if provided. */
// 	VNP_REFUND_URL?: string;
// 	/** General-purpose API endpoint fallback for refunds. */
// 	VNP_API_URL?: string;
// }

// /**
//  * Optional caller-provided overrides used at payment creation time.
//  */
// interface VNPayAdditionalData {
// 	/** Human readable order description shown on VNPay screens. */
// 	orderInfo?: string;
// 	/** Locale override for the payment page. */
// 	locale?: "vn" | "en";
// 	/** IP address forwarded to VNPay for audit purposes. */
// 	ipAddress?: string;
// 	/** Bank code to preselect a specific payment method. */
// 	bankCode?: string;
// 	/** Expiration timestamp in yyyyMMddHHmmss format. */
// 	expireDate?: string;
// }

// /**
//  * Defines the shape of the parameters object to be sent to VNPay
//  */
// export interface VNPayParams {
// 	vnp_Version: "2.1.0";
// 	vnp_Command: "pay";
// 	vnp_TmnCode: string;
// 	vnp_Amount: number;
// 	vnp_CurrCode: "VND";
// 	vnp_TxnRef: string;
// 	vnp_OrderInfo: string;
// 	vnp_OrderType: string;
// 	vnp_ReturnUrl: string;
// 	vnp_IpAddr: string;
// 	vnp_CreateDate: string;
// 	vnp_SecureHash: string;
// 	vnp_Locale?: "vn" | "en";
// 	vnp_BankCode?: string;
// 	vnp_ExpireDate?: string;
// }

// type VNPayBaseParams = Omit<VNPayParams, "vnp_SecureHash">;

// /**
//  * HELPER: Sorts object by key (ASCII), filters empty values, and encodes values
//  * to match C# WebUtility.UrlEncode behavior.
//  */
// const stringifyAndSortParams = (params: object): string => {
//    // 1. Get entries and filter out empty values (matches C# dict population logic)
//    const entries = Object.entries(params as Record<string, unknown>)
//       .filter(([_, value]) => value !== undefined && value !== null && value !== "")
//       .map(([key, value]) => [key, String(value)] as [string, string]);

//    // 2. Sort by Key using ASCII comparison (Matches C# SortedDictionary default behavior)
//    //    Do NOT use localeCompare.
//    entries.sort(([key1], [key2]) => {
//       if (key1 > key2) return 1;
//       if (key1 < key2) return -1;
//       return 0;
//    });

//    // 3. Build the query string: key=UrlEncode(value)
//    //    C# logic: $"{p.Key}={WebUtility.UrlEncode(p.Value)}"
//    return entries
//       .map(([key, value]) => {
//          // Encode value to match WebUtility.UrlEncode (spaces as +)
//          const encodedValue = encodeURIComponent(value)
//             .replace(/%20/g, "+")
//             .replace(/%2C/g, ",") // Preserve commas if C# does? (WebUtility usually encodes them, but check if needed. Standard is OK)
//             // Ensure standard special chars are encoded. encodeURIComponent does a good job,
//             // but does NOT encode: ! ' ( ) *
//             // WebUtility.UrlEncode DOES encode: ! ( ) * // So we must manually patch them to match C#.
//             .replace(/!/g, "%21")
//             .replace(/\(/g, "%28")
//             .replace(/\)/g, "%29")
//             .replace(/\*/g, "%2A");
//             // Note: C# WebUtility.UrlEncode might NOT encode single quote ' in older versions,
//             // but it is safer to leave it encoded or match exact output if you can debug.

//          // DO NOT encode the key (matches C# p.Key)
//          return `${key}=${encodedValue}`;
//       })
//       .join("&");
// };

// /**
//  * Computes VNPay's HMAC signature.
//  */
// const signVNPayParams = (
//    baseParams: VNPayBaseParams,
//    secret: string
// ): VNPayParams => {
//    // 1. Build the query string exactly as C# does
//    const queryString = stringifyAndSortParams(baseParams);

//    // 2. Hash it
//    const signature = crypto
//       .createHmac("sha512", secret)
//       .update(Buffer.from(queryString, "utf-8"))
//       .digest("hex");

//    return {
//       ...baseParams,
//       vnp_SecureHash: signature,
//    };
// };

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
// 	const signature = crypto
// 		.createHmac("sha512", secret)
// 		.update(Buffer.from(canonical, "utf-8"))
// 		.digest("hex");

// 	// 3. Return object with sorted keys + hash (Required for the body)
// 	// We reconstruct the object because axios needs an object, but we need the hash calculated on the sorted string
// 	const result: Record<string, string> = {};

// 	// Re-map the raw values (axios will handle standard form encoding, but we need the hash from our special encoding)
// 	// NOTE: For the body sent to axios, we usually send raw values and let axios/URLSearchParams encode.
// 	// However, VNPay expects the ORDER of fields in the body to match the hash calculation order sometimes.
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

// const sanitizeEndpoint = (endpoint: string): string =>
// 	endpoint.replace(/\/$/, "");

// /**
//  * Helper to get current time in Vietnam (GMT+7)
//  */
// const getVietnamTime = (): Date => {
// 	return toZonedTime(new Date(), "Asia/Ho_Chi_Minh");
// };

// /**
//  * VNPay concrete gateway implementation.
//  */
// export class VNPayGateway implements IPaymentGateway {
// 	getName(): string {
// 		return "VNPay";
// 	}

// 	// async createPaymentUrl(
//    //    payment: Payment,
//    //    tickets: Ticket[],
//    //    config: VNPayConfig,
//    //    additionalData: VNPayAdditionalData = {}
//    // ): Promise<string> {
//    //    const createDate = format(getVietnamTime(), "yyyyMMddHHmmss");

//    //    // All your params (WITHOUT SecureHash)
//    //    const baseParams = {
//    //       vnp_Version: "2.1.0",
//    //       vnp_Command: "pay",
//    //       vnp_TmnCode: config.VNP_TMN_CODE,
//    //       vnp_Amount: Math.round(Number(payment.totalAmount) * 100),
//    //       vnp_CurrCode: "VND",
//    //       vnp_TxnRef: payment.merchantOrderRef,
//    //       vnp_OrderInfo:
//    //          additionalData.orderInfo ||
//    //          `Bus tickets: ${tickets
//    //             .map((t) => `#${t.seat?.number ?? t.id}`)
//    //             .join(", ")}`,
//    //       vnp_OrderType: config.VNP_ORDER_TYPE || "travel",
//    //       vnp_ReturnUrl: config.VNP_RETURN_URL,
//    //       vnp_IpAddr: additionalData.ipAddress || "127.0.0.1",
//    //       vnp_CreateDate: createDate,
//    //    } as VNPayBaseParams;

//    //    if (additionalData.locale || config.VNP_LOCALE) {
//    //       baseParams.vnp_Locale = (additionalData.locale ||
//    //          config.VNP_LOCALE ||
//    //          "vn") as "vn" | "en";
//    //    }
//       // if (additionalData.bankCode)
//       //    baseParams.vnp_BankCode = additionalData.bankCode;
//       // if (additionalData.expireDate)
//       //    baseParams.vnp_ExpireDate = additionalData.expireDate;

// 	// 	// 1. Calculate the signature
// 	// 	const signedParams = signVNPayParams(baseParams, config.VNP_HASH_SECRET);

// 	// 	logger.debug(`[VNPay] Hash secret: ${config.VNP_HASH_SECRET}`);

// 	// 	// 2. Build the query string from the BASE params (sorted A-Z)
// 	// 	const query = stringifyAndSortParams(baseParams);

// 	// 	// 3. FORCE Append the SecureHash at the very end
// 	// 	const url = `${sanitizeEndpoint(
// 	// 		config.VNP_URL
// 	// 	)}?${query}&vnp_SecureHash=${signedParams.vnp_SecureHash}`;

// 	// 	logger.debug(
// 	// 		`[VNPay] Generated payment URL for order ${payment.merchantOrderRef}`
// 	// 	);

// 	// 	return url;
// 	// }
// 	async createPaymentUrl(
//       payment: Payment,
//       tickets: Ticket[],
//       config: VNPayConfig,
//       additionalData: VNPayAdditionalData = {}
//    ): Promise<string> {
//       const createDate = format(getVietnamTime(), "yyyyMMddHHmmss");

//       const baseParams = {
//          vnp_Version: "2.1.0",
//          vnp_Command: "pay",
//          vnp_TmnCode: config.VNP_TMN_CODE,
//          vnp_Amount: Math.round(Number(payment.totalAmount) * 100),
//          vnp_CurrCode: "VND",
//          vnp_TxnRef: payment.merchantOrderRef,
//          vnp_OrderInfo:
//             additionalData.orderInfo ||
//             `Payment for ${payment.merchantOrderRef}`, // Simplified to match C# style stability
//          vnp_OrderType: config.VNP_ORDER_TYPE || "travel",
//          vnp_ReturnUrl: config.VNP_RETURN_URL,
//          vnp_IpAddr: additionalData.ipAddress || "127.0.0.1",
//          vnp_CreateDate: createDate,
//       } as VNPayBaseParams;

//       // ... (Add optional params: locale, bankCode, expireDate) ...
//       if (additionalData.locale) baseParams.vnp_Locale = additionalData.locale;
//       // etc...

//       // 1. Build the query string (Sorted & Encoded)
//       const queryString = stringifyAndSortParams(baseParams);

//       // 2. Calculate Hash
//       const signature = crypto
//          .createHmac("sha512", config.VNP_HASH_SECRET)
//          .update(Buffer.from(queryString, "utf-8"))
//          .digest("hex");

//       // 3. Construct Final URL
//       // Matches C#: return $"{setting.BaseUrl}?{queryString}&vnp_SecureHash={secureHash}";
//       const url = `${sanitizeEndpoint(config.VNP_URL)}?${queryString}&vnp_SecureHash=${signature}`;

// 		logger.debug(url);

//       return url;
//    }

// 	async verifyCallback(
// 		data: Record<string, unknown>,
// 		config: VNPayConfig
// 	): Promise<PaymentVerificationResult> {
// 		const receivedHash =
// 			typeof data.vnp_SecureHash === "string"
// 				? data.vnp_SecureHash
// 				: undefined;
// 		const checksumParams: Record<string, unknown> = {};

// 		// Filter out the hash field
// 		for (const [key, value] of Object.entries(data)) {
// 			if (key !== "vnp_SecureHash") {
// 				checksumParams[key] = value;
// 			}
// 		}

// 		// FIX: Re-encode the incoming data to match how VNPay hashed it originally
// 		const canonical = stringifyAndSortParams(checksumParams);

// 		const expectedHash = crypto
// 			.createHmac("sha512", config.VNP_HASH_SECRET)
// 			.update(Buffer.from(canonical, "utf-8"))
// 			.digest("hex");

// 		const isValid = receivedHash === expectedHash;
// 		const status =
// 			data.vnp_ResponseCode === "00"
// 				? PaymentStatus.COMPLETED
// 				: PaymentStatus.FAILED;

// 		const gatewayTransactionNo =
// 			typeof data.vnp_TransactionNo === "string"
// 				? data.vnp_TransactionNo
// 				: undefined;

// 		return {
// 			isValid,
// 			status,
// 			...(gatewayTransactionNo ? { gatewayTransactionNo } : {}),
// 			merchantOrderRef: String(data.vnp_TxnRef ?? ""),
// 			message: isValid
// 				? "VNPay callback verified"
// 				: "Invalid VNPay signature",
// 			gatewayResponseData: data,
// 		};
// 	}

// 	async refundPayment(
// 		payment: Payment,
// 		config: VNPayConfig,
// 		options: GatewayRefundOptions
// 	): Promise<PaymentRefundResult> {
// 		if (!payment.gatewayTransactionNo) {
// 			throw new Error("VNPay refund requires gatewayTransactionNo");
// 		}

// 		const refundAmount = Math.round(options.amount * 100);
// 		const now = getVietnamTime(); // FIX: Use Vietnam time

// 		const baseParams: Record<string, string | number> = {
// 			vnp_RequestId: `${Date.now()}`,
// 			vnp_Version: "2.1.0",
// 			vnp_Command: "refund",
// 			vnp_TmnCode: config.VNP_TMN_CODE,
// 			vnp_TransactionType: "02",
// 			vnp_TxnRef: payment.merchantOrderRef,
// 			vnp_Amount: refundAmount,
// 			vnp_TransactionNo: payment.gatewayTransactionNo,
// 			vnp_OrderInfo:
// 				options.reason || `Refund for ${payment.merchantOrderRef}`,
// 			vnp_TransactionDate: format(
// 				toZonedTime(payment.createdAt, "Asia/Ho_Chi_Minh"),
// 				"yyyyMMddHHmmss"
// 			),
// 			vnp_CreateBy: options.performedBy || "system",
// 			vnp_CreateDate: format(now, "yyyyMMddHHmmss"),
// 			vnp_IpAddr: options.ipAddress || "127.0.0.1",
// 		};

// 		const signedPayload = signGenericParams(
// 			baseParams,
// 			config.VNP_HASH_SECRET
// 		);

// 		// We can use URLSearchParams here because the hash is already inside signedPayload
// 		// and correctly calculated using the special encoding.
// 		const body = new URLSearchParams(
// 			signedPayload as Record<string, string>
// 		);

// 		const refundEndpoint = sanitizeEndpoint(
// 			config.VNP_REFUND_URL || config.VNP_API_URL || config.VNP_URL
// 		);

// 		const response = await axios.post(refundEndpoint, body.toString(), {
// 			headers: { "Content-Type": "application/x-www-form-urlencoded" },
// 			timeout: 10_000,
// 		});

// 		const data = response?.data ?? {};
// 		const isSuccess = data.vnp_ResponseCode === "00";

// 		if (!isSuccess) {
// 			logger.error("[VNPay] refund failed:", data);
// 		}

// 		return {
// 			isSuccess,
// 			transactionId: response.data.transactionNo,
// 			gatewayResponseData: data,
// 		};
// 	}
// }

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
			// 3. Manually encode specific special chars that encodeURIComponent skips but VNPay might expect
			const encodedValue = encodeURIComponent(value)
				.replace(/%20/g, "+")
				.replace(/%2C/g, ",")
				.replace(/!/g, "%21")
				.replace(/\(/g, "%28")
				.replace(/\)/g, "%29")
				.replace(/\*/g, "%2A");

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

/**
 * Creates a generic HMAC signature for VNPay auxiliary endpoints (e.g., refund).
 */
const signGenericParams = (
	params: Record<string, unknown>,
	secret: string
): Record<string, string> => {
	// 1. Build the canonical query string (Sorted & Encoded)
	const canonical = stringifyAndSortParams(params);

	// 2. Hash the string
	const signature = calculateSecureHash(canonical, secret);

	// 3. Return object with sorted keys + hash (Required for the body)
	const result: Record<string, string> = {};

	Object.keys(params)
		.sort()
		.forEach((key) => {
			const val = params[key];
			if (val !== undefined && val !== null && val !== "") {
				result[key] = String(val);
			}
		});

	result["vnp_SecureHash"] = signature;
	return result;
};

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
		const createDate = format(getVietnamTime(), "yyyyMMddHHmmss");

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
			vnp_IpAddr: additionalData.ipAddress || "127.0.0.1",
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
		const now = getVietnamTime();

		const baseParams: Record<string, string | number> = {
			vnp_RequestId: `${Date.now()}`,
			vnp_Version: "2.1.0",
			vnp_Command: "refund",
			vnp_TmnCode: config.VNP_TMN_CODE,
			vnp_TransactionType: "02",
			vnp_TxnRef: payment.merchantOrderRef,
			vnp_Amount: refundAmount,
			vnp_TransactionNo: payment.gatewayTransactionNo,
			vnp_OrderInfo:
				options.reason || `Refund for ${payment.merchantOrderRef}`,
			vnp_TransactionDate: format(
				toZonedTime(payment.createdAt, "Asia/Ho_Chi_Minh"),
				"yyyyMMddHHmmss"
			),
			vnp_CreateBy: options.performedBy || "system",
			vnp_CreateDate: format(now, "yyyyMMddHHmmss"),
			vnp_IpAddr: options.ipAddress || "127.0.0.1",
		};

		const signedPayload = signGenericParams(
			baseParams,
			config.VNP_HASH_SECRET
		);

		// Use URLSearchParams here for the body content
		const body = new URLSearchParams(
			signedPayload as Record<string, string>
		);

		const refundEndpoint = sanitizeEndpoint(
			config.VNP_REFUND_URL || config.VNP_API_URL || config.VNP_URL
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
