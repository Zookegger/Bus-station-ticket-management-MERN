import {
	Model,
	DataTypes,
	Optional,
	Sequelize,
	BelongsToManyGetAssociationsMixin,
	HasManyGetAssociationsMixin,
} from "sequelize";
import { Seat } from "./seat";
import { User } from "./user";
import { Payment } from "./payment";
import { PaymentTicket } from "./paymentTicket";

export type GuestUser = {
	guestEmail?: string;
	guestName?: string;
	guestPhone?: string;
};

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
 * @property {string} userId - Foreign key referencing the user who purchased the ticket (UUID).
 * @property {number | null} [seatId] - Foreign key referencing the reserved seat (nullable if not assigned).
 * @property {number} basePrice - Base ticket price before any adjustments.
 * @property {number} finalPrice - Final ticket price after all adjustments (discounts, taxes, etc.).
 * @property {TicketStatus} status - Current state of the ticket lifecycle.
 * @property {Date} [createdAt] - Timestamp when the ticket was created.
 * @property {Date} [updatedAt] - Timestamp when the ticket was last updated.
 */
export interface TicketAttributes {
	id: number;
	userId: string | null; // UUID string to match User model
	seatId?: number | null;
	basePrice: number;
	finalPrice: number;
	status: TicketStatus;

	// Guest fields (nullable)
	guestEmail?: string | null;
	guestName?: string | null;
	guestPhone?: string | null;

	cancelledAt?: Date;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Attributes required for creating a new Ticket.
 * Some fields are optional because they are auto-generated
 * (e.g., id, timestamps) or may be added later (e.g., seatId).
 *
 * @interface TicketCreationAttributes
 */
export interface TicketCreationAttributes
	extends Optional<
		TicketAttributes,
		| "id"
		| "seatId"
		| "status"
		| "cancelledAt"
		| "createdAt"
		| "updatedAt"
		| "guestEmail"
		| "guestName"
		| "guestPhone"
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
	public status!: TicketStatus;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	// Association properties
	public seat?: Seat;
	public user?: User;

	public getPayments!: BelongsToManyGetAssociationsMixin<Payment>;
	public readonly payments?: Payment[];

	public getPaymentTickets!: HasManyGetAssociationsMixin<PaymentTicket>;
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
				userId: { type: DataTypes.UUID, allowNull: true },
				seatId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
				basePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
				finalPrice: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: false,
				},
				status: {
					type: DataTypes.ENUM(...Object.values(TicketStatus)),
					allowNull: false,
					defaultValue: "BOOKED",
				},
				// Guest fields
				guestEmail: {
					type: DataTypes.STRING,
					allowNull: true,
					validate: {
						isEmail: true,
					},
				},
				guestName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				guestPhone: {
					type: DataTypes.STRING,
					allowNull: true,
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
