import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import { Seat } from "./seat";
import { User } from "./user";

export enum TicketStatus {
	PENDING = "PENDING",
	BOOKED = "BOOKED",
	CANCELLED = "CANCELLED",
	COMPLETED = "COMPLETED",
	REFUNDED = "REFUNDED",
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
 * @property {string} userId - Foreign key referencing the user who purchased the ticket (UUID).
 * @property {number | null} [seatId] - Foreign key referencing the reserved seat (nullable if not assigned).
 * @property {number} basePrice - Base ticket price before any adjustments.
 * @property {number} finalPrice - Final ticket price after all adjustments (discounts, taxes, etc.).
 * @property {number | null} [paymentId] - Reference to the associated payment record (nullable).
 * @property {TicketStatus} status - Current state of the ticket lifecycle.
 * @property {Date} [createdAt] - Timestamp when the ticket was created.
 * @property {Date} [updatedAt] - Timestamp when the ticket was last updated.
 */
export interface TicketAttributes {
	id: number;
	userId: string; // UUID string to match User model
	seatId?: number | null;
	basePrice: number;
	finalPrice: number;
	paymentId?: number | null;
	status: TicketStatus;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Attributes required for creating a new Ticket.
 * Some fields are optional because they are auto-generated
 * (e.g., id, timestamps) or may be added later (e.g., seatId, paymentId).
 *
 * @interface TicketCreationAttributes
 */
export interface TicketCreationAttributes
	extends Optional<
		TicketAttributes,
		"id" | "seatId" | "paymentId" | "status" | "createdAt" | "updatedAt"
	> {}

/**
 * Sequelize model representing a Ticket.
 *
 * Maps the `tickets` table and defines schema validation rules via Sequelize.
 * Each ticket links a user and optionally a seat, with pricing information
 * including base price and final price after adjustments.
 * It is used for managing booking, seat allocation, and payment tracking.
 * @class Ticket
 * @extends {Model<TicketAttributes, TicketCreationAttributes>}
 * @implements {TicketAttributes}
 * @property {number} id - Primary key (auto-incremented).
 * @property {string} userId - Foreign key referencing the user who purchased the ticket (UUID).
 * @property {number | null} [seatId] - Foreign key referencing the reserved seat (nullable if not assigned).
 * @property {number} basePrice - Base ticket price before any adjustments.
 * @property {number} finalPrice - Final ticket price after all adjustments (discounts, taxes, etc.).
 * @property {number | null} [paymentId] - Reference to the associated payment record (nullable).
 * @property {TicketStatus} status - Current state of the ticket lifecycle.
 * @property {Date} createdAt - Timestamp when the ticket was created (readonly).
 * @property {Date} updatedAt - Timestamp when the ticket was last updated (readonly).
 * @property {Seat} [seat] - Associated Seat instance (if seatId is set).
 * @property {User} [user] - Associated User instance.
 */
export class Ticket
	extends Model<TicketAttributes, TicketCreationAttributes>
	implements TicketAttributes
{
	public id!: number;
	public userId!: string; // UUID string to match User model
	public seatId?: number | null;
	public basePrice!: number;
	public finalPrice!: number;
	public paymentId?: number | null;
	public status!: TicketStatus;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	// Association properties
	public seat?: Seat;
	public user?: User;

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
				userId: { type: DataTypes.UUID, allowNull: false },
				seatId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
				basePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
				finalPrice: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: false,
				},
				paymentId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: true,
				},
				status: {
					type: DataTypes.ENUM(...Object.values(TicketStatus)),
					allowNull: false,
					defaultValue: "BOOKED",
				},
			},
			{
				sequelize,
				tableName: "tickets",
				timestamps: true,
			}
		);
	}
}
