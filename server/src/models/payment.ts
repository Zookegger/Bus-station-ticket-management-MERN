import {
	Model,
	Optional,
	DataTypes,
	BelongsToGetAssociationMixin,
	BelongsToManyGetAssociationsMixin,
	HasManyGetAssociationsMixin,
	Sequelize,
} from "sequelize";
import { PaymentMethod } from "./paymentMethod";
import { decryptDB, encryptDB } from "@utils/encryption";
import { Ticket } from "./ticket";
import { PaymentTicket } from "./paymentTicket";
import { Order } from "./orders";
import { DbModels } from "@models";import logger from "@utils/logger";
;

/**
 * Enum for the status of a payment.
 * @enum {string}
 * @property {string} PENDING - The payment is pending.
 * @property {string} PROCESSING - The payment is being processed.
 * @property {string} COMPLETED - The payment has been completed successfully.
 * @property {string} FAILED - The payment has failed.
 * @property {string} CANCELLED - The payment has been cancelled.
 * @property {string} EXPIRED - The payment has expired.
 * @property {string} REFUNDED - The payment has been refunded.
 * @property {string} PARTIALLY_REFUNDED - The payment has been partially refunded.
 */
export enum PaymentStatus {
	PENDING = "pending",
	PROCESSING = "processing",
	COMPLETED = "completed",
	FAILED = "failed",
	CANCELLED = "cancelled",
	EXPIRED = "expired",
	REFUNDED = "refunded",
	PARTIALLY_REFUNDED = "partially_refunded",
}

/**
 * Interface for the attributes of a Payment.
 * @interface PaymentAttributes
 * @property {string} id - The unique identifier for the payment.
 * @property {string} orderId - The ID of the order associated with the payment.
 * @property {number} totalAmount - The total amount of the payment.
 * @property {string} paymentMethodId - The ID of the payment method used.
 * @property {PaymentStatus} paymentStatus - The status of the payment.
 * @property {string} merchantOrderRef - The merchant's order reference.
 * @property {string | null} gatewayTransactionNo - The transaction number from the payment gateway.
 * @property {any | null} gatewayResponseData - The response data from the payment gateway.
 * @property {Date} createdAt - The date and time the record was created.
 * @property {Date} expiredAt - The date and time the payment expires.
 * @property {Date} updatedAt - The date and time the record was last updated.
 */
export interface PaymentAttributes {
	id: string;
	orderId: string;
	totalAmount: number;
	paymentMethodId: string;
	paymentStatus: PaymentStatus;
	merchantOrderRef: string;
	gatewayTransactionNo: string | null;
	gatewayResponseData: any | null;
	createdAt: Date;
	expiredAt: Date;
	updatedAt: Date;
}

/**
 * Interface for the creation attributes of a Payment.
 * @interface PaymentCreationAttributes
 * @extends {Optional<PaymentAttributes, "id" | "gatewayTransactionNo" | "gatewayResponseData" | "createdAt" | "updatedAt">}
 */
export interface PaymentCreationAttributes
	extends Optional<
		PaymentAttributes,
		| "id"
		| "gatewayTransactionNo"
		| "gatewayResponseData"
		| "createdAt"
		| "updatedAt"
	> {}

/**
 * Sequelize model representing a Payment entity.
 *
 * @class Payment
 * @extends {Model<PaymentAttributes, PaymentCreationAttributes>}
 * @implements {PaymentAttributes}
 */
export class Payment
	extends Model<PaymentAttributes, PaymentCreationAttributes>
	implements PaymentAttributes
{
	/**
	 * @property {string} id - The unique identifier for the payment.
	 */
	public id!: string;
	/**
	 * @property {string} orderId - The ID of the order associated with the payment.
	 */
	public orderId!: string;
	/**
	 * @property {number} totalAmount - The total amount of the payment.
	 */
	public totalAmount!: number;
	/**
	 * @property {string} paymentMethodId - The ID of the payment method used.
	 */
	public paymentMethodId!: string;
	/**
	 * @property {PaymentStatus} paymentStatus - The status of the payment.
	 */
	public paymentStatus!: PaymentStatus;
	/**
	 * @property {string} merchantOrderRef - The merchant's order reference.
	 */
	public merchantOrderRef!: string;
	/**
	 * @property {string | null} gatewayTransactionNo - The transaction number from the payment gateway.
	 */
	public gatewayTransactionNo!: string | null;
	/**
	 * @property {any | null} gatewayResponseData - The response data from the payment gateway.
	 */
	public gatewayResponseData!: any | null;
	/**
	 * @property {Date} createdAt - The date and time the record was created.
	 */
	public createdAt!: Date;
	/**
	 * @property {Date} expiredAt - The date and time the payment expires.
	 */
	public expiredAt!: Date;
	/**
	 * @property {Date} updatedAt - The date and time the record was last updated.
	 */
	public updatedAt!: Date;

	// Associations
	public getPaymentMethod!: BelongsToGetAssociationMixin<PaymentMethod>;
	/**
	 * @property {PaymentMethod} [paymentMethod] - Associated PaymentMethod instance.
	 */
	public readonly paymentMethod?: PaymentMethod;

	public getOrder!: BelongsToGetAssociationMixin<Order>;
	/**
	 * @property {Order} [order] - Associated Order instance.
	 */
	public readonly order?: Order;

	public getTickets!: BelongsToManyGetAssociationsMixin<Ticket>;
	/**
	 * @property {Ticket[]} [tickets] - Associated Ticket instances.
	 */
	public readonly tickets?: Ticket[];

	public getPaymentTickets!: HasManyGetAssociationsMixin<PaymentTicket>;
	/**
	 * @property {PaymentTicket[]} [paymentTickets] - Associated PaymentTicket instances.
	 */
	public readonly paymentTickets?: PaymentTicket[];

	/**
	 * Initializes the Sequelize model definition for Payment.
	 *
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
	static initModel(sequelize: Sequelize) {
		Payment.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				orderId: {
					type: DataTypes.UUID,
					allowNull: false,
					unique: true, // Each order should have one primary payment record
					field: "orderId",
				},
				totalAmount: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: false,
					field: "totalAmount",
				},
				paymentMethodId: {
					type: DataTypes.UUID,
					allowNull: false,
					field: "paymentMethodId",
				},
				paymentStatus: {
					type: DataTypes.ENUM(...Object.values(PaymentStatus)),
					defaultValue: PaymentStatus.PENDING,
					field: "paymentStatus",
				},
				merchantOrderRef: {
					type: DataTypes.STRING(255),
					allowNull: false,
					unique: true,
					field: "merchantOrderRef",
				},
				gatewayTransactionNo: {
					type: DataTypes.STRING(255),
					allowNull: true,
					field: "gatewayTransactionNo",
				},
				gatewayResponseData: {
					type: DataTypes.TEXT("long"),
					allowNull: true,
					field: "gatewayResponseData",
					get() {
						const rawValue = this.getDataValue(
							"gatewayResponseData" as keyof PaymentAttributes
						);
						if (!rawValue) return null;
						try {
							const decrypted = decryptDB(rawValue);
							if (decrypted) {
								return JSON.parse(decrypted);
							}
							return null;
						} catch (e) {
							logger.error("Failed to decrypt or parse gatewayResponseData", e);
							return null; // Or return a specific error object
						}
					},
					set(value: any) {
						if (value === null || value === undefined) {
							this.setDataValue(
								"gatewayResponseData" as keyof PaymentAttributes,
								null
							);
						} else {
							const stringified = JSON.stringify(value);
							this.setDataValue(
								"gatewayResponseData" as keyof PaymentAttributes,
								encryptDB(stringified)
							);
						}
					},
				},
				createdAt: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: "createdAt",
				},
				expiredAt: {
					type: DataTypes.DATE,
					allowNull: false,
					field: "expiredAt",
				},
				updatedAt: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: "updatedAt",
				},
			},
			{
				sequelize,
				modelName: "Payment",
				tableName: "payments",
				timestamps: true,
				underscored: false,
				indexes: [
					{ fields: ["orderId"] },
					{ fields: ["merchantOrderRef"] },
					{ fields: ["paymentStatus"] },
					{ fields: ["createdAt"] },
				],
			}
		);
	}

	/**
	 * Defines associations between the Payment model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels) {
		Payment.belongsTo(models.PaymentMethod, {
			foreignKey: "paymentMethodId",
			as: "paymentMethod",
		});
		Payment.belongsTo(models.Order, {
			foreignKey: "orderId",
			as: "order",
		});
		Payment.belongsToMany(models.Ticket, {
			through: models.PaymentTicket,
			foreignKey: "paymentId",
			otherKey: "ticketId",
			as: "tickets",
		});
		Payment.hasMany(models.PaymentTicket, {
			foreignKey: "paymentId",
			as: "paymentTickets",
		});
	}
}
