import {
	Model,
	DataTypes,
	Optional,
	Sequelize,
	BelongsToGetAssociationMixin,
} from "sequelize";
import { Payment } from "./payment";
import { Ticket } from "./ticket";
import { DbModels } from "@models";;

export interface PaymentTicketAttributes {
	paymentId: string;
	ticketId: number;
	amount: number; // Amount allocated to this specific ticket
	createdAt?: Date;
	updatedAt?: Date;
}

export interface PaymentTicketCreationAttributes
	extends Optional<PaymentTicketAttributes, "createdAt" | "updatedAt"> {}

/**
 * Sequelize model representing a PaymentTicket junction entity.
 *
 * @class PaymentTicket
 * @extends {Model<PaymentTicketAttributes, PaymentTicketCreationAttributes>}
 * @implements {PaymentTicketAttributes}
 * @property {string} paymentId - The ID of the payment.
 * @property {number} ticketId - The ID of the ticket.
 * @property {number} amount - The amount allocated to this specific ticket.
 * @property {Date} [createdAt] - The date and time the record was created.
 * @property {Date} [updatedAt] - The date and time the record was last updated.
 * @property {Payment} [payment] - Associated Payment instance.
 * @property {Ticket} [ticket] - Associated Ticket instance.
 */
export class PaymentTicket
	extends Model<PaymentTicketAttributes, PaymentTicketCreationAttributes>
	implements PaymentTicketAttributes
{
	/**
	 * @property {string} paymentId - The ID of the payment.
	 */
	public paymentId!: string;
	/**
	 * @property {number} ticketId - The ID of the ticket.
	 */
	public ticketId!: number;
	/**
	 * @property {number} amount - The amount allocated to this specific ticket.
	 */
	public amount!: number;

	/**
	 * @property {Date} createdAt - The date and time the record was created.
	 */
	public createdAt!: Date;
	/**
	 * @property {Date} updatedAt - The date and time the record was last updated.
	 */
	public updatedAt!: Date;

	// Associations
	public getPayment!: BelongsToGetAssociationMixin<Payment>;
	/**
	 * @property {Payment} [payment] - Associated Payment instance.
	 */
	public payment?: Payment;

	public getTicket!: BelongsToGetAssociationMixin<Ticket>;
	/**
	 * @property {Ticket} [ticket] - Associated Ticket instance.
	 */
	public ticket?: Ticket;

	/**
	 * Initializes the Sequelize model definition for PaymentTicket.
	 *
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
	static initModel(sequelize: Sequelize) {
		PaymentTicket.init(
			{
				paymentId: {
					type: DataTypes.UUID,
					allowNull: false,
					onDelete: "CASCADE",
					primaryKey: true,
					field: 'paymentId'
				},
				ticketId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					onDelete: "CASCADE",
					primaryKey: true,
					field: 'ticketId'
				},
				amount: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: false,
					comment: "Amount allocated to this specific ticket",
				},
			},
			{
				sequelize,
				timestamps: true,
				tableName: "payment_tickets",
				underscored: false,
				indexes: [
					{
						unique: true,
						fields: ["paymentId", "ticketId"],
					},
					{
						fields: ["paymentId"],
					},
					{
						fields: ["ticketId"],
					},
				],
			}
		);
	}

	/**
	 * Defines associations between the PaymentTicket model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels) {
		PaymentTicket.belongsTo(models.Payment, {
			foreignKey: "paymentId",
			as: "payment",
		});
		PaymentTicket.belongsTo(models.Ticket, {
			foreignKey: "ticketId",
			as: "ticket",
		});
	}
}
