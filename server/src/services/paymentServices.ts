import { COMPUTED } from "@constants/config";
import { Payment, PaymentAttributes } from "@models/payment";
import { PaymentTicket } from "@models/paymentTicket";
import { Ticket, TicketStatus } from "@models/ticket";
import { Trip } from "@models/trip";
import { Seat } from "@models/seat";
import { PaymentMethod } from "@models/paymentMethod";
import { InitiatePaymentDTO, PaymentCallbackDTO, PaymentResponseDTO, PaymentStatus} from "@my_types/payments";
import * as paymentMethodServices from "@services/paymentMethodServices";
import * as ticketServices from "@services/ticketServices";
import logger from "@utils/logger";
import { SeatStatus } from "@my_types/seat";

/**
 * Payment verification result from gateway callbacks
 */
export interface PaymentVerificationResult {
	isValid: boolean;
	status: PaymentStatus;
	gatewayTransactionNo?: string;
	merchantOrderRef: string;
	message?: string;
	gatewayResponseData?: any;
}

export interface GatewayRefundOptions {
	amount: number;
	reason?: string;
	ipAddress?: string;
	performedBy?: string;
}

export interface PaymentRefundResult {
	isSuccess: boolean;
	message?: string;
	gatewayResponseData?: any;
}

/**
 * Payment gateway interface - all gateways must implement this
 */
export interface IPaymentGateway {
	createPaymentUrl(
		payment: Payment,
		tickets: Ticket[],
		config: any,
		additionalData?: any
	): Promise<string>;
	verifyCallback(data: any, config: any): Promise<PaymentVerificationResult>;
	refundPayment?(
		payment: Payment,
		config: any,
		options: GatewayRefundOptions
	): Promise<PaymentRefundResult>;
	getName(): string;
}

/**
 * Registry of payment gateways
 */
class PaymentGatewayRegistry {
	private gateways: Map<string, IPaymentGateway> = new Map();

	register(code: string, gateway: IPaymentGateway): void {
		this.gateways.set(code.toLowerCase(), gateway);
	}

	get(code: string): IPaymentGateway | undefined {
		return this.gateways.get(code.toLowerCase());
	}

	has(code: string): boolean {
		return this.gateways.has(code.toLowerCase());
	}

	list(): string[] {
		return Array.from(this.gateways.keys());
	}
}

// Global registry instance
const gatewayRegistry = new PaymentGatewayRegistry();

/**
 * Creates a payment record and initiates payment with the selected gateway
 */
export const initiatePayment = async (
	data: InitiatePaymentDTO
): Promise<{ paymentUrl?: string; payment: PaymentResponseDTO }> => {
	const { ticketIds, paymentMethodCode, additionalData } = data;

	if (!ticketIds) {
		throw new Error("No ticket Id(s) provided");
	}

	const tickets = await ticketServices.getTicketsByIds(ticketIds, {
		include: [
			{
				model: Seat,
				as: "seat",
				include: [{ model: Trip, as: "trip" }],
			},
		],
	});

	if (tickets.count !== ticketIds.length || tickets.rows === null) {
		throw new Error("One or more tickets not found");
	}

	const paidTickets = tickets.rows.filter(
		(t) => t.status === TicketStatus.BOOKED
	);
	if (paidTickets.length > 0) {
		throw new Error("One or more tickets are already paid");
	}

	const totalAmount = tickets.rows.reduce(
		(sum, ticket) => sum + Number(ticket.finalPrice),
		0
	);

	// Get payment method configuration
	const payment_method = await paymentMethodServices.getPaymentMethodByCode(
		paymentMethodCode.toLowerCase()
	);

	if (!payment_method) {
		throw new Error(
			`Payment method ${paymentMethodCode} not found or inactive`
		);
	}

	// Get gateway handler
	const gateway = gatewayRegistry.get(paymentMethodCode);
	if (!gateway) {
		throw new Error(
			`No gateway handler registered for ${paymentMethodCode}`
		);
	}

	const merchant_order_ref = generateMerchantOrderRef();

	const payment = await Payment.create({
		totalAmount,
		paymentMethodId: payment_method.id,
		paymentStatus: PaymentStatus.PENDING,
		merchantOrderRef: merchant_order_ref,
		expiredAt: new Date(
			Date.now() + COMPUTED.TICKET_RESERVATION_MILLISECONDS
		),
	});

	await PaymentTicket.bulkCreate(
		tickets.rows.map((ticket) => ({
			paymentId: payment.id,
			ticketId: ticket.id,
			amount: Number(ticket.finalPrice),
		}))
	);

	await Ticket.update(
		{ status: TicketStatus.PENDING },
		{ where: { id: ticketIds } }
	);

    try {
        const payment_url = await gateway.createPaymentUrl(payment, tickets.rows, payment_method.configJson, additionalData);
    
        if (!payment_url) {
            throw new Error("Failed to generate payment url");
        }

        const completePayment = await getPaymentById(payment.id);
        
        if (!completePayment) {
            throw new Error("Failed to retrieve created payment");
        }

        return {
            paymentUrl: payment_url,
            payment: completePayment,
        }
    } catch (error) {
        // Rollback on error
        await payment.destroy();
        await PaymentTicket.destroy({ where: { paymentId: payment.id } });
        await Ticket.update({ status: TicketStatus.INVALID }, { where: { id: ticketIds } });
        throw error;
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generates unique merchant order reference
 */
const generateMerchantOrderRef = (): string => {
	return `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`;
};
/**
 * Registers a payment gateway
 */
export const registerPaymentGateway = (
	code: string,
	gateway: IPaymentGateway
): void => {
	gatewayRegistry.register(code, gateway);
	logger.info(`Payment gateway registered: ${code} (${gateway.getName()})`);
};

/**
 * Checks if a gateway is registered
 */
export const isGatewayRegistered = (code: string): boolean => {
	return gatewayRegistry.has(code);
};

/**
 * Lists all registered gateways
 */
export const listRegisteredGateways = (): string[] => {
	return gatewayRegistry.list();
};

/**
 * Gets a payment by ID with related data
 */
export const getPaymentById = async (
	paymentId: string
): Promise<PaymentResponseDTO | null> => {
	const payment = await Payment.findByPk(paymentId, {
		include: [
			{
				model: PaymentMethod,
				as: "paymentMethod",
				attributes: ["id", "name", "code"],
			},
		],
	});

	if (!payment) {
		return null;
	}

	const response: PaymentResponseDTO = {
		id: payment.id,
		totalAmount: Number(payment.totalAmount),
		paymentMethodId: payment.paymentMethodId,
		paymentStatus: payment.paymentStatus as PaymentStatus,
		merchantOrderRef: payment.merchantOrderRef,
		gatewayTransactionNo: payment.gatewayTransactionNo,
		gatewayResponseData: payment.gatewayResponseData,
		createdAt: payment.createdAt.toISOString(),
		expiredAt: payment.expiredAt.toISOString(),
		updatedAt: payment.updatedAt.toISOString(),
	};

	if (payment.paymentMethod) {
		response.paymentMethod = {
			id: payment.paymentMethod.id,
			name: payment.paymentMethod.name,
			code: payment.paymentMethod.code,
		};
	}

	return response;
};

/**
 * Verifies payment callback from gateway and updates payment status
 */
export const verifyPayment = async (
	data: PaymentCallbackDTO
): Promise<PaymentVerificationResult> => {
	const { paymentMethodCode, callbackData } = data;

	// Get gateway handler
	const gateway = gatewayRegistry.get(paymentMethodCode);
	if (!gateway) {
		throw new Error(
			`No gateway handler registered for ${paymentMethodCode}`
		);
	}

	// Get payment method configuration
	const payment_method = await paymentMethodServices.getPaymentMethodByCode(
		paymentMethodCode.toLowerCase()
	);

	if (!payment_method) {
		throw new Error(
			`Payment method ${paymentMethodCode} not found or inactive`
		);
	}

	// Verify callback data with gateway
	const verificationResult = await gateway.verifyCallback(
		callbackData,
		payment_method.configJson
	);

	return verificationResult;
};

/**
 * Handles payment callback and updates ticket/payment status accordingly
 */
export const handlePaymentCallback = async (
	verificationResult: PaymentVerificationResult
): Promise<Payment | null> => {
	const transaction = await require("@models/index").default.sequelize.transaction();

	try {
		// Find payment by merchant order ref
		const payment = await Payment.findOne({
			where: { merchantOrderRef: verificationResult.merchantOrderRef },
			include: [
				{
					model: Ticket,
					as: "tickets",
					include: [
						{
							model: Seat,
							as: "seat",
						},
					],
				},
			],
			transaction,
		});

		if (!payment) {
			await transaction.rollback();
			logger.error(
				`Payment not found for merchant order ref: ${verificationResult.merchantOrderRef}`
			);
			return null;
		}

		// Update payment status
		const updateData: Partial<PaymentAttributes> = {
			paymentStatus: verificationResult.status,
			gatewayResponseData: verificationResult.gatewayResponseData,
		};

		if (verificationResult.gatewayTransactionNo) {
			updateData.gatewayTransactionNo =
				verificationResult.gatewayTransactionNo;
		}

		await payment.update(updateData, { transaction });

		// If payment is successful, update tickets and seats
		if (verificationResult.status === PaymentStatus.COMPLETED) {
			const ticketIds = payment.tickets?.map((t) => t.id) || [];

			await Ticket.update(
				{ status: TicketStatus.BOOKED },
				{ where: { id: ticketIds }, transaction }
			);

			// Update seats status to booked
			const seatIds =
				payment.tickets
					?.map((t) => t.seatId)
					.filter((id) => id !== null) || [];

			if (seatIds.length > 0) {
				await require("@models/index").default.seat.update(
					{
						status: require("@my_types/seat").SeatStatus.BOOKED,
						reservedBy: null,
						reservedUntil: null,
					},
					{ where: { id: seatIds }, transaction }
				);
			}
		} else if (
			verificationResult.status === PaymentStatus.FAILED ||
			verificationResult.status === PaymentStatus.CANCELLED ||
			verificationResult.status === PaymentStatus.EXPIRED
		) {
			// If payment failed, release tickets and seats
			const ticketIds = payment.tickets?.map((t) => t.id) || [];

			await Ticket.update(
				{ status: TicketStatus.INVALID },
				{ where: { id: ticketIds }, transaction }
			);

			// Release seats
			const seatIds =
				payment.tickets
					?.map((t) => t.seatId)
					.filter((id) => id !== null) || [];

			if (seatIds.length > 0) {
				await require("@models/index").default.seat.update(
					{
						status: SeatStatus.AVAILABLE,
						reservedBy: null,
						reservedUntil: null,
					},
					{ where: { id: seatIds }, transaction }
				);
			}
		}

		await transaction.commit();
		return payment;
	} catch (error) {
		await transaction.rollback();
		logger.error("Error handling payment callback:", error);
		throw error;
	}
};

/**
 * Gets payment by merchant order reference
 */
export const getPaymentByMerchantOrderRef = async (
	merchantOrderRef: string
): Promise<Payment | null> => {
	return await Payment.findOne({
		where: { merchantOrderRef },
		include: [
			{
				model: PaymentMethod,
				as: "paymentMethod",
				attributes: ["id", "name", "code"],
			},
			{
				model: Ticket,
				as: "tickets",
				include: [
					{
						model: Seat,
						as: "seat",
						include: [{ model: Trip, as: "trip" }],
					},
				],
			},
		],
	});
};
