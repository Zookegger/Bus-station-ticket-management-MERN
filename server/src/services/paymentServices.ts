import { COMPUTED } from "@constants/config";
import { Payment, PaymentAttributes } from "@models/payment";
import { Ticket, TicketStatus } from "@models/ticket";
import { Trip } from "@models/trip";
import { Seat } from "@models/seat";
import { PaymentMethod } from "@models/paymentMethod";
import {
	GatewayRefundOptions,
	InitiatePaymentDTO,
	PaymentCallbackDTO,
	PaymentRefundDTO,
	PaymentRefundResult,
	PaymentResponseDTO,
	PaymentStatus,
	PaymentVerificationResult,
} from "@my_types/payments";
import * as paymentMethodServices from "@services/paymentMethodServices";
import logger from "@utils/logger";
import { SeatStatus } from "@my_types/seat";
import { Order, OrderStatus } from "@models/orders";
import db from "@models/index";
import { Transaction } from "sequelize";

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
	data: InitiatePaymentDTO,
	transaction: Transaction
): Promise<{ paymentUrl: string; payment: PaymentResponseDTO }> => {
	const { orderId, paymentMethodCode, additionalData } = data;

	if (!orderId) {
		throw new Error("No order Id provided");
	}

	const order = await db.Order.findByPk(orderId, {
		include: [
			{
				model: db.Ticket,
				as: "tickets",
				include: [
					{
						model: db.Seat,
						as: "seat",
						include: [{ model: db.Trip, as: "trip" }],
					},
				],
			},
		],
		transaction,
	});

	if (!order) {
		throw new Error("Order not found");
	}

	// Check if the order already has a different paymentId
	if (order.paymentId) {
		const payment = await db.Payment.findByPk(order.paymentId);
		if (
			payment &&
			(payment.paymentStatus === PaymentStatus.COMPLETED ||
				payment.paymentStatus === PaymentStatus.PROCESSING)
		) {
			throw {
				status: 409,
				message: "This order already has a payment associated with it.",
			};
		}
	}

	if (order.status !== OrderStatus.PENDING) {
		throw new Error("Order is not in pending state");
	}

	if (!order.tickets || order.tickets.length === 0) {
		throw new Error("No tickets found for this order");
	}

	const paidTickets = order.tickets.filter(
		(t) => t.status === TicketStatus.BOOKED
	);
	if (paidTickets.length > 0) {
		throw new Error(
			"One or more tickets are already paid for in this order"
		);
	}

	const totalAmount = Number(order.totalFinalPrice);

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

	try {
		const payment = await Payment.create(
			{
				totalAmount,
				orderId: order.id,
				paymentMethodId: payment_method.id,
				paymentStatus: PaymentStatus.PENDING,
				merchantOrderRef: merchant_order_ref,
				expiredAt: new Date(
					Date.now() + COMPUTED.TICKET_RESERVATION_MILLISECONDS
				),
			},
			{ transaction }
		);

		// Link payment to order
		await order.update({ paymentId: payment.id }, { transaction });

		await Ticket.update(
			{ status: TicketStatus.PENDING },
			{ where: { id: order.tickets.map((t) => t.id) }, transaction }
		);

		const payment_url = await gateway.createPaymentUrl(
			payment,
			order.tickets,
			payment_method.configJson,
			additionalData
		);

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
		};
	} catch (error) {
		// Rollback on error
		if (!transaction) {
			await Payment.destroy();
			await Order.update({ paymentId: null }, { where: { id: orderId } });
			await Ticket.update(
				{ status: TicketStatus.INVALID },
				{ where: { id: order.tickets.map((t) => t.id) } }
			);
		} else {
			await transaction.rollback();
		}

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
	const transaction =
		await require("@models/index").default.sequelize.transaction();

	try {
		// Find payment by merchant order ref
		const payment = await Payment.findOne({
			where: { merchantOrderRef: verificationResult.merchantOrderRef },
			include: [
				{
					model: Order,
					as: "order",
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

		const order = payment.order;
		if (!order) {
			await transaction.rollback();
			logger.error(`Order not found for payment id: ${payment.id}`);
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
			await order.update(
				{ status: OrderStatus.CONFIRMED },
				{ transaction }
			);
			const ticketIds = order.tickets?.map((t) => t.id) || [];

			await Ticket.update(
				{ status: TicketStatus.BOOKED },
				{ where: { id: ticketIds }, transaction }
			);

			// Update seats status to booked
			const seatIds =
				order.tickets
					?.map((t) => t.seatId)
					.filter((id) => id !== null) || [];

			if (seatIds.length > 0) {
				await require("@models/index").default.Seat.update(
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
			await order.update(
				{ status: OrderStatus.CANCELLED },
				{ transaction }
			);
			// If payment failed, release tickets and seats
			const ticketIds = order.tickets?.map((t) => t.id) || [];

			await Ticket.update(
				{ status: TicketStatus.INVALID },
				{ where: { id: ticketIds }, transaction }
			);

			// Release seats
			const seatIds =
				order.tickets
					?.map((t) => t.seatId)
					.filter((id) => id !== null) || [];

			if (seatIds.length > 0) {
				await require("@models/index").default.Seat.update(
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
				model: Order,
				as: "order",
				include: [
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
			},
		],
	});
};

/**
 * Processes a refund for a completed payment using the appropriate gateway.
 *
 * @param dto - The data transfer object containing refund details such as payment ID, amount, and optional reason.
 * @param transaction - The Sequelize transaction to ensure atomicity of the refund operation.
 *
 * @returns Promise<PaymentRefundResult> - The result of the refund operation, including success status and gateway response.
 */
export const processRefund = async (
	dto: PaymentRefundDTO,
	transaction: Transaction
): Promise<PaymentRefundResult> => {
	// 1. Find the original payment record
	const payment = await db.Payment.findByPk(dto.paymentId, {
		include: [
			{
				model: db.PaymentMethod,
				as: "paymentMethod",
			},
		],
		transaction,
	});

	if (!payment)
		throw new Error(`Payment with ID ${dto.paymentId} is not found.`);

	if (payment.paymentStatus !== PaymentStatus.COMPLETED)
		throw new Error("Cannot refund a payment that is not completed.");

	if (!payment.paymentMethod)
		throw new Error(
			`Payment method details not found for payment ID ${dto.paymentId}.`
		);

	// 2. Get corresponding payment gateway
	const gateway = gatewayRegistry.get(payment.paymentMethod.code);
	if (!gateway)
		throw new Error(
			`No gateway handler registered for ${payment.paymentMethod.code}.`
		);

	if (typeof gateway.refundPayment !== "function")
		throw new Error(
			`The '${gateway.getName()}' gateway does not support refunds.`
		);

	if (!payment.gatewayTransactionNo)
		throw new Error(
			"Cannot process refund: Original gateway transaction number is missing."
		);

	// 3. Build refund options - only include defined values
	const refund_options: GatewayRefundOptions = {
		amount: dto.amount,
		originalGatewayTxnId: payment.gatewayTransactionNo,
	};

	// Conditionally add optional fields only if they exist
	if (dto.reason !== undefined) {
		refund_options.reason = dto.reason;
	}
	if (dto.ipAddress !== undefined) {
		refund_options.ipAddress = dto.ipAddress;
	}
	if (dto.performedBy !== undefined) {
		refund_options.performedBy = dto.performedBy;
	}

	// 4. Call the gateway's refund method
	logger.info(
		`Initiating refund via ${gateway.getName()} for payment ${
			payment.id
		} of amount ${dto.amount}.`
	);

	const refund_result = await gateway.refundPayment(
		payment,
		payment.paymentMethod.configJson,
		refund_options
	);

	// 5. Handle the gateway's response
	if (!refund_result.isSuccess) {
		logger.error(
			`Gateway refund failed for payment ${payment.id}. Response:`,
			refund_result.gatewayResponseData
		);
		throw new Error(`Gateway refund failed for payment ${payment.id}.`);
	}

	logger.info(
		`Successfully processed refund for payment ${payment.id}.\nGateway transaction ID: ${refund_result.transactionId}`
	);

	return refund_result;
};
