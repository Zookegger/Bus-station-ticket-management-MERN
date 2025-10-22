// models/Payment.ts
import {
	Model,
	Optional,
	DataTypes,
	BelongsToGetAssociationMixin,
} from "sequelize";
import { PaymentMethod } from "./paymentMethod";

export interface PaymentAttributes {
	id: string;
	totalAmount: number;
	paymentMethodId: string;
	paymentStatus: string;
	merchantOrderRef: string;
	gatewayTransactionNo: string | null;
	gatewayResponseData: any | null;
	createdAt: Date;
	expiredAt: Date;
	updatedAt: Date;
}

export interface PaymentCreationAttributes
	extends Optional<
		PaymentAttributes,
		| "id"
		| "gatewayTransactionNo"
		| "gatewayResponseData"
		| "createdAt"
		| "updatedAt"
	> {}

export class Payment
	extends Model<PaymentAttributes, PaymentCreationAttributes>
	implements PaymentAttributes
{
	public id!: string;
	public totalAmount!: number;
	public paymentMethodId!: string;
	public paymentStatus!: string;
	public merchantOrderRef!: string;
	public gatewayTransactionNo!: string | null;
	public gatewayResponseData!: any | null;
	public createdAt!: Date;
	public expiredAt!: Date;
	public updatedAt!: Date;

	// Associations
	public getPaymentMethod!: BelongsToGetAssociationMixin<PaymentMethod>;
	public readonly paymentMethod?: PaymentMethod;

	static initModel(sequelize: any) {
		Payment.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				totalAmount: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: false,
					field: "total_amount",
				},
				paymentMethodId: {
					type: DataTypes.UUID,
					allowNull: false,
					field: "payment_method_id",
					references: {
						model: "payment_methods",
						key: "id",
					},
				},
				paymentStatus: {
					type: DataTypes.ENUM(
						"pending",
						"processing",
						"completed",
						"failed",
						"cancelled",
						"expired"
					),
					defaultValue: "pending",
					field: "payment_status",
				},
				merchantOrderRef: {
					type: DataTypes.STRING(255),
					allowNull: false,
					unique: true,
					field: "merchant_order_ref",
				},
				gatewayTransactionNo: {
					type: DataTypes.STRING(255),
					allowNull: true,
					field: "gateway_transaction_no",
				},
				gatewayResponseData: {
					type: DataTypes.JSON,
					allowNull: true,
					field: "gateway_response_data",
				},
				createdAt: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: "created_at",
				},
				expiredAt: {
					type: DataTypes.DATE,
					allowNull: false,
					field: "expired_at",
				},
				updatedAt: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: "updated_at",
				},
			},
			{
				sequelize,
				modelName: "Payment",
				tableName: "payments",
				timestamps: true,
				underscored: true,
				indexes: [
					{
						fields: ["merchant_order_ref"],
					},
					{
						fields: ["payment_status"],
					},
					{
						fields: ["created_at"],
					},
				],
			}
		);
	}

	static associate(models: any) {
		Payment.belongsTo(models.PaymentMethod, {
			foreignKey: "payment_method_id",
			as: "paymentMethod",
		});

		Payment.hasOne(models.Ticket, {
			foreignKey: "payment_id",
			as: "ticket",
		});
	}
}
