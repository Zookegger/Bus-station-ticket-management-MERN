// models/PaymentMethod.ts
import { decrypt, encrypt } from "@utils/encryption";
import logger from "@utils/logger";
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
		"id" | "configJson" | "createdAt" | "updatedAt" | "isActive"
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
					type: DataTypes.TEXT("long"),
					field: "config_json",
					get() {
						const rawValue = this.getDataValue("configJson" as any);
						if (!rawValue) return null;

						// If it's already an object, Sequelize already parsed it
						if (
							typeof rawValue === "object" &&
							!Buffer.isBuffer(rawValue)
						) {
							return rawValue;
						}

						// If it's a string, it's encrypted - decrypt it
						const decrypted = decrypt(rawValue);
						try {
							return decrypted ? JSON.parse(decrypted) : null;
						} catch (error) {
							logger.error(
								"Failed to parse decrypted configJson:",
								error
							);
							return { error: "Failed to parse decrypted data." };
						}
					},
					set(value: any) {
						if (value === null || value === undefined) {
							this.setDataValue("configJson" as any, null);
							return;
						}

						const jsonString =
							typeof value === "string"
								? value
								: JSON.stringify(value);
						const encrypted = encrypt(jsonString);
						// Store as raw string, Sequelize will handle JSON serialization
						this.setDataValue("configJson" as any, encrypted);
					},
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
