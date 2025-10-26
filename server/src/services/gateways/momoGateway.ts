import crypto from "crypto";
import axios from "axios";
import { Payment } from "@models/payment";
import { Ticket } from "@models/ticket";
import logger from "@utils/logger";
import type { IPaymentGateway } from "@services/paymentServices";
import { GatewayRefundOptions, PaymentRefundResult, PaymentStatus, PaymentVerificationResult } from "@my_types/payments";

/**
 * Configuration values supplied by the merchant for MoMo integration.
 */
interface MoMoConfig {
    /** Merchant code issued by MoMo. */
    MOMO_PARTNER_CODE: string;
    /** Access key paired with the secret for signing requests. */
    MOMO_ACCESS_KEY: string;
    /** Secret key used when generating HMAC signatures. */
    MOMO_SECRET_KEY: string;
    /** Base URL for MoMo REST APIs. */
    MOMO_API_ENDPOINT: string;
    /** URL MoMo redirects the customer to after payment. */
    MOMO_REDIRECT_URL: string;
    /** Endpoint on our side that receives IPN callbacks. */
    MOMO_IPN_URL: string;
}

/**
 * Optional overrides used when initiating a payment.
 */
interface MoMoAdditionalData {
    /** Human readable order description that shows up in MoMo screens. */
    orderInfo?: string;
    /** Locale hint for MoMo UI. Defaults to "en" in our requests. */
    lang?: string;
}

type SignatureField = [string, string];

/**
 * Calculates the MoMo HMAC signature for the provided fields.
 *
 * @param fields - Ordered key/value tuples that make up the signature payload.
 * @param secret - Merchant secret key used for signing.
 * @returns Signature string in hexadecimal format.
 */
const buildSignature = (fields: SignatureField[], secret: string): string =>
    crypto
        .createHmac("sha256", secret)
        .update(fields.map(([key, value]) => `${key}=${value}`).join("&"))
        .digest("hex");

/**
 * Drops trailing slash characters to ensure stable endpoint concatenation.
 *
 * @param endpoint - Configured API base URL.
 * @returns Endpoint without a trailing slash.
 */
const sanitizeEndpoint = (endpoint: string): string => endpoint.replace(/\/$/, "");

/**
 * Converts a payment amount into the format required by MoMo.
 *
 * @param amount - Amount in currency units.
 * @returns Rounded integer value accepted by MoMo.
 */
const toMoMoAmount = (amount: number): number => Math.round(Number(amount));

/**
 * MoMo concrete gateway implementation.
 */
export class MoMoGateway implements IPaymentGateway {
    getName(): string {
        return "MoMo";
    }

    /**
     * Creates a MoMo payment session and returns a redirect URL.
     *
     * @param payment - Persisted payment entity.
     * @param tickets - Tickets tied to the payment.
     * @param config - Merchant configuration values.
     * @param additionalData - Optional overrides such as custom order info.
     * @returns Redirect URL provided by MoMo.
     */
    async createPaymentUrl(
        payment: Payment,
        tickets: Ticket[],
        config: MoMoConfig,
        additionalData: MoMoAdditionalData = {}
    ): Promise<string> {
        // Step 1: Assemble order context (amount, user-friendly description, IDs).
        const amount = toMoMoAmount(payment.totalAmount);
        const ticketInfo = tickets
            .map((ticket) => `#${ticket.seat?.number ?? ticket.id}`)
            .join(", ");
        const orderInfo = additionalData.orderInfo || `Bus tickets: ${ticketInfo}`;
        const orderId = payment.merchantOrderRef;
        const requestId = orderId;

        // Step 2: Collect signature fields in the exact order required by MoMo docs.
        const signatureFields: SignatureField[] = [
            ["accessKey", config.MOMO_ACCESS_KEY],
            ["amount", amount.toString()],
            ["extraData", ""],
            ["ipnUrl", config.MOMO_IPN_URL],
            ["orderId", orderId],
            ["orderInfo", orderInfo],
            ["partnerCode", config.MOMO_PARTNER_CODE],
            ["redirectUrl", config.MOMO_REDIRECT_URL],
            ["requestId", requestId],
            ["requestType", "captureWallet"],
        ];

        // Sign the payload exactly as MoMo expects.
        const signature = buildSignature(signatureFields, config.MOMO_SECRET_KEY);

        // Step 3: Construct the API payload (signature plus business data).
        const payload = {
            partnerCode: config.MOMO_PARTNER_CODE,
            accessKey: config.MOMO_ACCESS_KEY,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl: config.MOMO_REDIRECT_URL,
            ipnUrl: config.MOMO_IPN_URL,
            extraData: "",
            requestType: "captureWallet",
            signature,
            lang: additionalData.lang || "en",
        };

        // Step 4: Call MoMo's create endpoint and capture the redirect URL.
        const endpoint = `${sanitizeEndpoint(config.MOMO_API_ENDPOINT)}/v2/gateway/api/create`;
        const response = await axios.post(endpoint, payload, { timeout: 10_000 });

        if (response?.data?.resultCode !== 0) {
            logger.error("[MoMo] create payment failed:", response.data);
            throw new Error(response.data?.message || response.data?.localMessage || "MoMo error");
        }

        logger.debug(`[MoMo] Generated payment URL for order ${orderId}`);
        return response.data.payUrl || response.data.payUrlRedirect || "";
    }

    /**
     * Validates MoMo callback payloads and maps result status.
     *
     * @param body - Raw callback payload from MoMo.
     * @param config - Merchant configuration used for signature validation.
     * @returns Verification result with signature status and mapped payment state.
     */
    async verifyCallback(
        body: Record<string, unknown>,
        config: MoMoConfig
    ): Promise<PaymentVerificationResult> {
        // Step 1: Re-create the signature using the documented field order.
        const signatureFields: SignatureField[] = [
            ["accessKey", config.MOMO_ACCESS_KEY],
            ["amount", String(body.amount ?? "")],
            ["extraData", String(body.extraData ?? "")],
            ["message", String(body.message ?? "")],
            ["orderId", String(body.orderId ?? "")],
            ["orderInfo", String(body.orderInfo ?? "")],
            ["orderType", String(body.orderType ?? "")],
            ["partnerCode", String(body.partnerCode ?? "")],
            ["payType", String(body.payType ?? "")],
            ["requestId", String(body.requestId ?? "")],
            ["responseTime", String(body.responseTime ?? "")],
            ["resultCode", String(body.resultCode ?? "")],
            ["transId", String(body.transId ?? "")],
        ];

        const expectedSignature = buildSignature(signatureFields, config.MOMO_SECRET_KEY);
        const isValid = expectedSignature === body.signature;
        // Step 2: Translate MoMo's numerical result code into our enum.
        const status = Number(body.resultCode) === 0 ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;

        // Step 3: Return verification payload including gateway transaction number if available.
        const gatewayTransactionNo =
            typeof body.transId === "string" ? body.transId : undefined;

        return {
            isValid,
            status,
            ...(gatewayTransactionNo ? { gatewayTransactionNo } : {}),
            merchantOrderRef: String(body.orderId ?? ""),
            message: String(
                body.message ?? (isValid ? "MoMo callback verified" : "Invalid MoMo signature")
            ),
            gatewayResponseData: body,
        };
    }

    /**
     * Initiates a MoMo refund request for a previously captured payment.
     *
     * @param payment - Payment entity containing the original transaction ID.
     * @param config - Merchant configuration values.
     * @param options - Refund context such as amount and reason.
     * @returns Refund outcome as reported by MoMo.
     */
    async refundPayment(
        payment: Payment,
        config: MoMoConfig,
        options: GatewayRefundOptions
    ): Promise<PaymentRefundResult> {
        // Step 1: Validate prerequisites (must have the capture transaction number).
        if (!payment.gatewayTransactionNo) {
            throw new Error("MoMo refund requires gatewayTransactionNo");
        }

        // Step 2: Map refund inputs to the payload model.
        const amount = toMoMoAmount(options.amount);
        const orderId = payment.merchantOrderRef;
        const requestId = `${orderId}-refund-${Date.now()}`;
        const description = options.reason || `Refund for ${orderId}`;

        const signatureFields: SignatureField[] = [
            ["accessKey", config.MOMO_ACCESS_KEY],
            ["amount", amount.toString()],
            ["description", description],
            ["orderId", orderId],
            ["partnerCode", config.MOMO_PARTNER_CODE],
            ["requestId", requestId],
            ["transId", String(payment.gatewayTransactionNo)],
        ];

        const signature = buildSignature(signatureFields, config.MOMO_SECRET_KEY);

        const payload = {
            partnerCode: config.MOMO_PARTNER_CODE,
            accessKey: config.MOMO_ACCESS_KEY,
            requestId,
            orderId,
            amount,
            transId: payment.gatewayTransactionNo,
            lang: "en",
            description,
            signature,
        };

        // Step 3: Submit the refund to MoMo and analyze their response.
        const endpoint = `${sanitizeEndpoint(config.MOMO_API_ENDPOINT)}/v2/gateway/api/refund`;
        const response = await axios.post(endpoint, payload, { timeout: 10_000 });
        const data = response?.data ?? {};
        const isSuccess = Number(data.resultCode) === 0;

        // Step 4: Log failures so operations staff can investigate quickly.
        if (!isSuccess) {
            logger.error("[MoMo] refund failed:", data);
        }

        return {
            isSuccess,
            transactionId: response.data.transId,
            gatewayResponseData: data,
        };
    }
}