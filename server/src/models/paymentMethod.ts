// models/PaymentMethod.ts
import { decryptDB, encryptDB } from "@utils/encryption";
import logger from "@utils/logger";
import { Model, Optional, DataTypes } from "sequelize";
import { DbModels } from "@models";;
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

/**
 * Sequelize model representing a PaymentMethod entity.
 *
 * @class PaymentMethod
 * @extends {Model<PaymentMethodAttributes, PaymentMethodCreationAttributes>}
 * @implements {PaymentMethodAttributes}
 * @property {string} id - The unique identifier for the payment method.
 * @property {string} name - The name of the payment method.
 * @property {string} code - The code of the payment method.
 * @property {boolean} isActive - Whether the payment method is active.
 * @property {any} configJson - The configuration for the payment method.
 * @property {Date} createdAt - The date and time the record was created.
 * @property {Date} updatedAt - The date and time the record was last updated.
 */
export class PaymentMethod
	extends Model<PaymentMethodAttributes, PaymentMethodCreationAttributes>
	implements PaymentMethodAttributes
{
	/**
	 * @property {string} id - The unique identifier for the payment method.
	 */
	public id!: string;
	/**
	 * @property {string} name - The name of the payment method.
	 */
	public name!: string;
	/**
	 * @property {string} code - The code of the payment method.
	 */
	public code!: string;
	/**
	 * @property {boolean} isActive - Whether the payment method is active.
	 */
	public isActive!: boolean;
	/**
	 * @property {any} configJson - The configuration for the payment method.
	 */
	public configJson!: any;
	/**
	 * @property {Date} createdAt - The date and time the record was created.
	 */
	public createdAt!: Date;
	/**
	 * @property {Date} updatedAt - The date and time the record was last updated.
	 */
	public updatedAt!: Date;

	/**
	 * Initializes the Sequelize model definition for PaymentMethod.
	 *
	 * @param {any} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
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
					field: "isActive",
				},
				configJson: {
					type: DataTypes.TEXT("long"),
					field: "configJson",
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
						const decrypted = decryptDB(rawValue);
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
						const encrypted = encryptDB(jsonString);
						// Store as raw string, Sequelize will handle JSON serialization
						this.setDataValue("configJson" as any, encrypted);
					},
				},
				createdAt: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: "createdAt",
				},
				updatedAt: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: "updatedAt",
				},
			},
			{
				sequelize,
				modelName: "PaymentMethod",
				tableName: "payment_methods",
				timestamps: true,
				underscored: false,
			}
		);
	}

	/**
	 * Defines associations between the PaymentMethod model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(_models: DbModels) {
		// No direct associations from PaymentMethod in this schema
	}
}
