import {
	Model,
	DataTypes,
	Optional,
	Sequelize,
	BelongsToManyGetAssociationsMixin,
	HasManyGetAssociationsMixin,
	BelongsToGetAssociationMixin,
} from "sequelize";
import { Order } from "@models/orders";
import { Seat } from "@models/seat";
import { User } from "@models/user";
import { Payment } from "@models/payment";
import { PaymentTicket } from "@models/paymentTicket";
import { DbModels } from "@models";

/**
 * Represents the lifecycle status of a ticket.
 */
export enum TicketStatus {
	/** Ticket reserved but not paid (e.g., in cart) */
	PENDING = "PENDING",

	/** Ticket confirmed and paid */
	BOOKED = "BOOKED",

	/** Ticket cancelled by user or admin */
	CANCELLED = "CANCELLED",

	/** The trip associated with the ticket has been completed */
	COMPLETED = "COMPLETED",

	/** The ticket has been successfully refunded */
	REFUNDED = "REFUNDED",

	/** The ticket is invalid (e.g., expired, voided) */
	INVALID = "INVALID",
}

export enum RefundPolicy {
	FULL_REFUND = "FULL_REFUND",
	PARTIAL_REFUND = "PARTIAL_REFUND",
	NO_REFUND = "NO_REFUND",
}

/**
 * Attributes representing a Ticket in the system.
 *
 * @interface TicketAttributes
 * @property {number} id - Primary key (auto-incremented).
 * @property {string | null} userId - Foreign key referencing the user (UUID), null for guests.
 * @property {number} seatId - Foreign key referencing the reserved seat.
 * @property {string} orderId - Foreign key referencing the parent order (UUID).
 * @property {number} basePrice - Base ticket price before any adjustments.
 * @property {number} finalPrice - Final ticket price after adjustments (discounts, etc.).
 * @property {TicketStatus} status - Current state of the ticket lifecycle.
 * @property {Date} [cancelledAt] - Timestamp when the ticket was cancelled.
 * @property {Date} [createdAt] - Timestamp when the ticket was created.
 * @property {Date} [updatedAt] - Timestamp when the ticket was last updated.
 */
export interface TicketAttributes {
	id: number;
	userId: string | null; // UUID string to match User model
	seatId: number;
	orderId: string;
	basePrice: number;
	finalPrice: number;
	status: TicketStatus;
	cancelledAt?: Date;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Attributes required for creating a new Ticket.
 * 'id' is optional (auto-generated).
 * 'status' is optional (has default value).
 * 'cancelledAt', 'createdAt', 'updatedAt' are optional (timestamps).
 *
 * @interface TicketCreationAttributes
 */
export interface TicketCreationAttributes
	extends Optional<
		TicketAttributes,
		"id" | "status" | "cancelledAt" | "createdAt" | "updatedAt"
	> {}

/**
 * Sequelize model representing a Ticket.
 *
 * Each ticket links an optional user, a required seat, and a required order.
 * It holds pricing information and the ticket's current status.
 *
 * @class Ticket
 * @extends {Model<TicketAttributes, TicketCreationAttributes>}
 * @implements {TicketAttributes}
 * @property {number} id - Primary key (auto-incremented).
 * @property {string | null} userId - Foreign key referencing the user (UUID), null for guests.
 * @property {string} orderId - Foreign key referencing the parent order (UUID).
 * @property {number} seatId - Foreign key referencing the reserved seat.
 * @property {number} basePrice - Base ticket price.
 * @property {number} finalPrice - Final ticket price after adjustments.
 * @property {TicketStatus} status - Current state of the ticket.
 * @property {Date} [cancelledAt] - Timestamp when the ticket was cancelled.
 * @property {Date} createdAt - Timestamp when the ticket was created (readonly).
 * @property {Date} updatedAt - Timestamp when the ticket was last updated (readonly).
 * @property {Seat} [seat] - Associated Seat instance.
 * @property {User} [user] - Associated User instance.
 * @property {Order} [order] - Associated Order instance.
 * @property {Payment[]} [payments] - Associated Payment instances.
 * @property {PaymentTicket[]} [paymentTickets] - Associated PaymentTicket instances.
*/
export class Ticket
extends Model<TicketAttributes, TicketCreationAttributes>
implements TicketAttributes
{
	/**
	 * @property {number} id - Primary key (auto-incremented).
	*/
	public id!: number;
	
	/**
	 * @property {string | null} userId - Foreign key referencing the user (UUID), null for guests.
	*/
	public userId!: string; // UUID string to match User model
	/** 
	 * @property {string} orderId - Foreign key referencing the parent order (UUID).
	*/
	public orderId!: string;
	/**
	 * @property {number} seatId - Foreign key referencing the reserved seat.
	 */
	public seatId!: number;
	/**
	 * @property {number} basePrice - Base ticket price.
	 */
	public basePrice!: number;
	/**
	 * @property {number} finalPrice - Final ticket price after adjustments.
	 */
	public finalPrice!: number;
	/**
	 * @property {TicketStatus} status - Current state of the ticket.
	 */
	public status!: TicketStatus;
	/**
	 * @property {Date} [cancelledAt] - Timestamp when the ticket was cancelled.
	 */
	public readonly cancelledAt?: Date;
	/**
	 * @property {Date} createdAt - Timestamp when the ticket was created (readonly).
	 */
	public readonly createdAt!: Date;
	/**
	 * @property {Date} updatedAt - Timestamp when the ticket was last updated (readonly).
	 */
	public readonly updatedAt!: Date;

	// Association properties
	public getSeat!: BelongsToGetAssociationMixin<Seat>;
	/**
	 * @property {Seat} [seat] - Associated Seat instance.
	 */
	public readonly seat?: Seat;

	public getUser!: BelongsToGetAssociationMixin<User>;
	/**
	 * @property {User} [user] - Associated User instance.
	 */
	public readonly user?: User;

	public getOrder!: BelongsToGetAssociationMixin<Order>;
	/**
	 * @property {Order} [order] - Associated Order instance.
	 */
	public readonly order?: Order;

	public getPayments!: BelongsToManyGetAssociationsMixin<Payment>;
	/**
	 * @property {Payment[]} [payments] - Associated Payment instances.
	 */
	public readonly payments?: Payment[];

	public getPaymentTickets!: HasManyGetAssociationsMixin<PaymentTicket>;
	/**
	 * @property {PaymentTicket[]} [paymentTickets] - Associated PaymentTicket instances.
	 */
	public readonly paymentTickets?: PaymentTicket[];

	/**
	 * Initializes the Sequelize model definition for Ticket.
	 *
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
	static initModel(sequelize: Sequelize) {
		Ticket.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
					autoIncrement: true,
				},
				userId: {
					type: DataTypes.UUID,
					allowNull: true,
					field: "userId",
				},
				orderId: {
					type: DataTypes.UUID,
					allowNull: false,
					field: "orderId",
				},
				seatId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: true,
					field: "seatId",
				},
				basePrice: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: false,
					field: "basePrice",
				},
				finalPrice: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: false,
					field: "finalPrice",
				},
				cancelledAt: {
					type: DataTypes.DATE,
					allowNull: true,
					field: "cancelledAt",
				},
				status: {
					type: DataTypes.ENUM(...Object.values(TicketStatus)),
					allowNull: false,
					defaultValue: TicketStatus.PENDING,
				},
			},
			{
				sequelize,
				tableName: "tickets",
				timestamps: true,
				underscored: false,
				indexes: [
					{ fields: ["userId"] },
					{ fields: ["orderId"] },
					{ fields: ["seatId"] },
				],
			}
		);
	}

	/**
	 * Defines associations between the Ticket model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels) {
		Ticket.belongsTo(models.User, {
			foreignKey: "userId",
			as: "user",
		});
		Ticket.belongsTo(models.Seat, {
			foreignKey: "seatId",
			as: "seat",
		});
		Ticket.belongsTo(models.Order, {
			foreignKey: "orderId",
			as: "order",
		});
		Ticket.belongsToMany(models.Payment, {
			through: models.PaymentTicket,
			foreignKey: "ticketId",
			otherKey: "paymentId",
			as: "payments",
		});
		Ticket.hasMany(models.PaymentTicket, {
			foreignKey: "ticketId",
			as: "paymentTickets",
		});
	}
}
