import axios from "axios";
import crypto from "crypto";
import { format } from "date-fns";
import { Payment } from "@models/payment";
import { Ticket } from "@models/ticket";
import logger from "@utils/logger";
import type { IPaymentGateway } from "@services/paymentServices";
import { GatewayRefundOptions, PaymentRefundResult, PaymentStatus, PaymentVerificationResult } from "@my_types/payments";

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
 * for a 'pay' command.
 * @see https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 */
export interface VNPayParams {
	/** API Version. Value: "2.1.0" */
	vnp_Version: "2.1.0";

	/** Command type. Value: "pay" */
	vnp_Command: "pay";

	/** Merchant's unique Terminal Code from VNPAY */
	vnp_TmnCode: string;

	/** * Total amount. Must be in the smallest currency unit.
	 * (e.g., for 10,000 VND, this value must be 1000000)
	 */
	vnp_Amount: number;

	/** Currency code. Value: "VND" */
	vnp_CurrCode: "VND";

	/** * Merchant's unique order reference ID.
	 * Must be unique for each day.
	 */
	vnp_TxnRef: string;

	/** * Order information.
	 * Must be in Vietnamese without accents or special characters.
	 * e.g., "Thanh toan don hang 123"
	 */
	vnp_OrderInfo: string;

	/** * Category code for the order (e.g., "travel", "billpayment").
	 * Refer to VNPAY's "Goods Category" table.
	 */
	vnp_OrderType: string;

	/** * The URL VNPAY will redirect the user back to after payment.
	 * This is the "Return URL" on your server.
	 */
	vnp_ReturnUrl: string;

	/** The IP address of the customer making the purchase */
	vnp_IpAddr: string;

	/** * The creation date of the transaction.
	 * Format: yyyyMMddHHmmss (e.g., 20251025001000)
	 */
	vnp_CreateDate: string;

	/** * Checksum to ensure data integrity, generated using HmacSHA512.
	 * This must be the last parameter in the query string.
	 */
	vnp_SecureHash: string;

	// --- Optional Parameters ---

	/** * Language for the payment gateway.
	 * @default "vn"
	 */
	vnp_Locale?: "vn" | "en";

	/**
	 * Bank code. If provided, the user is redirected to the bank's page.
	 * If omitted, the user selects their bank/payment method on the VNPAY page.
	 * (e.g., "VNBANK", "VNPAYQR", "INTCARD")
	 */
	vnp_BankCode?: string;

	/**
	 * Payment expiration date.
	 * Format: yyyyMMddHHmmss (e.g., 20251025002000)
	 */
	vnp_ExpireDate?: string;
}

type VNPayBaseParams = Omit<VNPayParams, "vnp_SecureHash">;

/**
 * Normalizes an object into sorted string tuples while removing empty values.
 *
 * @param params - Arbitrary parameter object to serialize.
 * @returns Sorted key/value tuples that only contain non-empty values.
 */
const normalizeEntries = (params: object): [string, string][] =>
	Object.entries(params as Record<string, unknown>)
		.filter(
			([, value]) => value !== undefined && value !== null && value !== ""
		)
		.map(([key, value]) => [key, String(value)] as [string, string])
		.sort(([a], [b]) => (a > b ? 1 : -1));

/**
 * Computes VNPay's HMAC signature and returns hydrated parameters.
 *
 * @param baseParams - Unsigned payload.
 * @param secret - Merchant hash secret used for signing.
 * @returns Payload augmented with the `vnp_SecureHash` field.
 */
const signVNPayParams = (
	baseParams: VNPayBaseParams,
	secret: string
): VNPayParams => {
	const orderedEntries = normalizeEntries(baseParams);
	const canonical = orderedEntries.map(([k, v]) => `${k}=${v}`).join("&");
	const signature = crypto
		.createHmac("sha512", secret)
		.update(Buffer.from(canonical, "utf-8"))
		.digest("hex");

	return {
		...baseParams,
		vnp_SecureHash: signature,
	};
};

/**
 * Builds URL search params from signed VNPay parameters.
 *
 * @param params - Signed VNPay parameter map.
 * @returns URLSearchParams ready for stringification.
 */
const buildSearchParams = (params: VNPayParams): URLSearchParams => {
	const searchParams = new URLSearchParams();
	for (const [key, value] of normalizeEntries(params)) {
		searchParams.append(key, value);
	}

	return searchParams;
};

/**
 * Creates a generic HMAC signature for VNPay auxiliary endpoints (e.g., refund).
 *
 * @param params - Payload to sign.
 * @param secret - Merchant hash secret used for signing.
 * @returns Signed payload including `vnp_SecureHash`.
 */
const signGenericParams = (
	params: Record<string, unknown>,
	secret: string
): Record<string, string> => {
	const ordered = normalizeEntries(params);
	const canonical = ordered.map(([k, v]) => `${k}=${v}`).join("&");
	const signature = crypto
		.createHmac("sha512", secret)
		.update(Buffer.from(canonical, "utf-8"))
		.digest("hex");

	return {
		...ordered.reduce<Record<string, string>>((acc, [k, v]) => {
			acc[k] = v;
			return acc;
		}, {}),
		vnp_SecureHash: signature,
	};
};

/**
 * Drops a trailing slash to avoid double-slash concatenation.
 *
 * @param endpoint - Configured endpoint.
 * @returns Sanitized endpoint without trailing slash.
 */
const sanitizeEndpoint = (endpoint: string): string => endpoint.replace(/\/$/, "");

/**
 * VNPay concrete gateway implementation.
 */
export class VNPayGateway implements IPaymentGateway {
	getName(): string {
		return "VNPay";
	}

	/**
	 * Builds a signed VNPay redirect URL for the incoming payment request.
	 *
	 * @param payment - Persisted payment entity.
	 * @param tickets - Tickets associated to the payment.
	 * @param config - Merchant configuration values.
	 * @param additionalData - Optional caller-provided overrides.
	 * @returns The redirect URL that should be sent to the client.
	 */
	async createPaymentUrl(
		payment: Payment,
		tickets: Ticket[],
		config: VNPayConfig,
		additionalData: VNPayAdditionalData = {}
	): Promise<string> {
		// Step 1: Prepare base parameters with defaults and caller overrides.
		const baseParams = {
			vnp_Version: "2.1.0",
			vnp_Command: "pay",
			vnp_TmnCode: config.VNP_TMN_CODE,
			vnp_Amount: Math.round(Number(payment.totalAmount) * 100),
			vnp_CurrCode: "VND",
			vnp_TxnRef: payment.merchantOrderRef,
			vnp_OrderInfo:
				additionalData.orderInfo ||
				`Bus tickets: ${tickets
					.map((t) => `#${t.seat?.number ?? t.id}`)
					.join(", ")}`,
			vnp_OrderType: config.VNP_ORDER_TYPE || "travel",
			vnp_ReturnUrl: config.VNP_RETURN_URL,
			vnp_IpAddr: additionalData.ipAddress || "127.0.0.1",
			vnp_CreateDate: format(new Date(), "yyyyMMddHHmmss"),
		} as VNPayBaseParams;

		// Step 2: Fill optional properties when provided by config or request.
		if (additionalData.locale || config.VNP_LOCALE) {
			baseParams.vnp_Locale = (additionalData.locale || config.VNP_LOCALE || "vn") as
				| "vn"
				| "en";
		}

		if (additionalData.bankCode) {
			baseParams.vnp_BankCode = additionalData.bankCode;
		}

		if (additionalData.expireDate) {
			baseParams.vnp_ExpireDate = additionalData.expireDate;
		}

		// Step 3: Sign parameters and emit ready-to-use redirect URL.
		const signedParams = signVNPayParams(baseParams, config.VNP_HASH_SECRET);
		const query = buildSearchParams(signedParams).toString();
		const url = `${sanitizeEndpoint(config.VNP_URL)}?${query}`;

		logger.debug(`[VNPay] Generated payment URL for order ${payment.merchantOrderRef}`);
		return url;
	}

	/**
	 * Validates VNPay callback data and maps the gateway status.
	 *
	 * @param data - Raw callback payload from VNPay.
	 * @param config - Merchant configuration used for signature verification.
	 * @returns Verification outcome including integrity check and mapped status.
	 */
	async verifyCallback(
		data: Record<string, unknown>,
		config: VNPayConfig
	): Promise<PaymentVerificationResult> {
		// Step 1: Remove the secure hash from the payload before recomputing the signature.
		const receivedHash =
			typeof data.vnp_SecureHash === "string" ? data.vnp_SecureHash : undefined;

		const canonicalEntries = normalizeEntries(
			Object.entries(data).reduce<Record<string, unknown>>((acc, [key, value]) => {
				if (key !== "vnp_SecureHash" && value !== undefined && value !== null && value !== "") {
					acc[key] = value;
				}
				return acc;
			}, {})
		);

		const canonical = canonicalEntries.map(([k, v]) => `${k}=${v}`).join("&");
		const expectedHash = crypto
			.createHmac("sha512", config.VNP_HASH_SECRET)
			.update(Buffer.from(canonical, "utf-8"))
			.digest("hex");

		// Step 2: Determine validity and translate VNPay response to local status.
		const isValid = receivedHash === expectedHash;
		const status =
			data.vnp_ResponseCode === "00"
				? PaymentStatus.COMPLETED
				: PaymentStatus.FAILED;

		// Step 3: Package verification results including transaction number if present.
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

	/**
	 * Requests a refund through VNPay's refund API.
	 *
	 * @param payment - Persisted payment entity including gateway transaction number.
	 * @param config - Merchant configuration values.
	 * @param options - Caller provided refund context such as reason and amount.
	 * @returns Refund result propagated to the caller.
	 */
	async refundPayment(
		payment: Payment,
		config: VNPayConfig,
		options: GatewayRefundOptions
	): Promise<PaymentRefundResult> {
		// Step 1: Validate that the original gateway transaction number is available.
		if (!payment.gatewayTransactionNo) {
			throw new Error("VNPay refund requires gatewayTransactionNo");
		}

		// Step 2: Map refund information into VNPay's expected payload format.
		const refundAmount = Math.round(options.amount * 100);
		const now = new Date();
		const baseParams: Record<string, string | number> = {
			vnp_RequestId: `${Date.now()}`,
			vnp_Version: "2.1.0",
			vnp_Command: "refund",
			vnp_TmnCode: config.VNP_TMN_CODE,
			vnp_TransactionType: "02",
			vnp_TxnRef: payment.merchantOrderRef,
			vnp_Amount: refundAmount,
			vnp_TransactionNo: payment.gatewayTransactionNo,
			vnp_OrderInfo: options.reason || `Refund for ${payment.merchantOrderRef}`,
			vnp_TransactionDate: format(payment.createdAt, "yyyyMMddHHmmss"),
			vnp_CreateBy: options.performedBy || "system",
			vnp_CreateDate: format(now, "yyyyMMddHHmmss"),
			vnp_IpAddr: options.ipAddress || "127.0.0.1",
		};

		// Step 3: Sign the payload and submit the refund request to VNPay.
		const signedPayload = signGenericParams(baseParams, config.VNP_HASH_SECRET);
		const body = new URLSearchParams(normalizeEntries(signedPayload));
		const refundEndpoint = sanitizeEndpoint(
			config.VNP_REFUND_URL || config.VNP_API_URL || config.VNP_URL
		);

		const response = await axios.post(refundEndpoint, body.toString(), {
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			timeout: 10_000,
		});

		const data = response?.data ?? {};
		const isSuccess = data.vnp_ResponseCode === "00";

		// Step 4: Surface failure details in the logs for easier troubleshooting.
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
