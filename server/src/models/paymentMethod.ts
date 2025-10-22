// models/PaymentMethod.ts
import { Model, Optional, DataTypes } from "sequelize";
export interface PaymentMethodAttributes {
	id: string;
	name: string;
	code: string;
	isActive: boolean;
	configJson: any;
	createdAt: Date;
	updatedAt: Date;
}

export interface PaymentMethodCreationAttributes
	extends Optional<
		PaymentMethodAttributes,
		"id" | "createdAt" | "updatedAt" | "isActive"
	> {}

export class PaymentMethod
	extends Model<PaymentMethodAttributes, PaymentMethodCreationAttributes>
	implements PaymentMethodAttributes
{
	public id!: string;
	public name!: string;
	public code!: string;
	public isActive!: boolean;
	public configJson!: any;
	public createdAt!: Date;
	public updatedAt!: Date;

	static initModel(sequelize: any) {
		PaymentMethod.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				name: {
					type: DataTypes.STRING(100),
					allowNull: false,
				},
				code: {
					type: DataTypes.STRING(50),
					allowNull: false,
					unique: true,
				},
				isActive: {
					type: DataTypes.BOOLEAN,
					defaultValue: true,
					field: "is_active",
				},
				configJson: {
					type: DataTypes.JSON,
					field: "config_json",
				},
				createdAt: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: "created_at",
				},
				updatedAt: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: "updated_at",
				},
			},
			{
				sequelize,
				modelName: "PaymentMethod",
				tableName: "payment_methods",
				timestamps: true,
				underscored: true,
			}
		);
	}
}
