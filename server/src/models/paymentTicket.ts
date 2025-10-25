import {
	Model,
	DataTypes,
	Optional,
	Sequelize,
	BelongsToGetAssociationMixin,
} from "sequelize";
import { Payment } from "./payment";
import { Ticket } from "./ticket";

export interface PaymentTicketAttributes {
	paymentId: string;
	ticketId: number;
	amount: number; // Amount allocated to this specific ticket
	createdAt?: Date;
	updatedAt?: Date;
}

export interface PaymentTicketCreationAttributes
	extends Optional<PaymentTicketAttributes, "createdAt" | "updatedAt"> {}

export class PaymentTicket
	extends Model<PaymentTicketAttributes, PaymentTicketCreationAttributes>
	implements PaymentTicketAttributes
{
	public paymentId!: string;
	public ticketId!: number;
	public amount!: number;

	public createdAt!: Date;
	public updatedAt!: Date;

	// Associations
	public getPayment!: BelongsToGetAssociationMixin<Payment>;
	public payment?: Payment;

	public getTicket!: BelongsToGetAssociationMixin<Ticket>;
	public ticket?: Ticket;

	static initModel(sequelize: Sequelize) {
		PaymentTicket.init(
			{
				paymentId: {
					type: DataTypes.UUID,
					allowNull: false,
					onDelete: "CASCADE",
					primaryKey: true,
				},
				ticketId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					onDelete: "CASCADE",
					primaryKey: true,
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
}
