import { Model, DataTypes, Optional, Sequelize } from "sequelize";

/**
 * Represents a driver, including personal details and license information for bus ticket management.
 *
 * @interface DriverAttributes
 * @property {number} id - Unique identifier for the driver record
 * @property {string | null} fullname - Driver's full name
 * @property {string | null} phoneNumber - Driver's phone number
 * @property {string | null} avatar - URL or path to the driver's avatar image
 * @property {Date | null} hiredAt - Date when the driver was hired
 * @property {boolean} isActive - Indicates if the driver is actively employed
 * @property {string | null} licenseNumber - Unique driver's license number
 * @property {string | null} licenseCategory - License category
 * @property {Date | null} licenseIssueDate - Date the license was issued
 * @property {Date | null} licenseExpiryDate - Date the license expires
 * @property {string | null} issuingAuthority - Authority that issued the license
 * @property {boolean} isSuspended - Indicates if the license is suspended
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
export interface DriverAttributes {
	id: number;
	fullname: string | null;
	phoneNumber?: string | null;
	avatar?: string | null;
	hiredAt?: Date | null;
	isActive?: boolean;
	licenseNumber: string | null;
	licenseCategory: string | null;
	licenseIssueDate: Date | null;
	licenseExpiryDate: Date | null;
	issuingAuthority: string | null;
	isSuspended: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Attributes for creating a driver, with optional fields for flexibility.
 *
 * @interface DriverCreationAttributes
 */
export interface DriverCreationAttributes
	extends Optional<
		DriverAttributes,
		| "phoneNumber"
		| "avatar"
		| "hiredAt"
		| "isActive"
		| "licenseNumber"
		| "licenseCategory"
		| "licenseIssueDate"
		| "licenseExpiryDate"
		| "issuingAuthority"
		| "isSuspended"
		| "createdAt"
		| "updatedAt"
	> {}

/**
 * Driver model for managing driver information in the bus ticket system.
 *
 * @class Driver
 * @extends Model<DriverAttributes,DriverCreationAttributes>
 * @implements DriverAttributes
 * @property {number} id - Unique identifier for the driver record
 * @property {string | null} fullname - Driver's full name
 * @property {string | null} phoneNumber - Driver's phone number
 * @property {string | null} avatar - URL or path to the driver's avatar image
 * @property {Date | null} hiredAt - Date when the driver was hired
 * @property {boolean} isActive - Indicates if the driver is actively employed
 * @property {string | null} licenseNumber - Unique driver's license number
 * @property {string | null} licenseCategory - License category
 * @property {Date | null} licenseIssueDate - Date the license was issued
 * @property {Date | null} licenseExpiryDate - Date the license expires
 * @property {string | null} issuingAuthority - Authority that issued the license
 * @property {boolean} isSuspended - Indicates if the license is suspended
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
export class Driver
	extends Model<DriverAttributes, DriverCreationAttributes>
	implements DriverAttributes
{
	public id!: number;
	public fullname!: string | null;
	public phoneNumber?: string | null;
	public avatar?: string | null;
	public hiredAt?: Date | null;
	public isActive?: boolean;
	public licenseNumber!: string | null;
	public licenseCategory!: string | null;
	public licenseIssueDate!: Date | null;
	public licenseExpiryDate!: Date | null;
	public issuingAuthority!: string | null;
	public isSuspended!: boolean;
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	/**
	 * Initializes the Driver model with Sequelize schema.
	 * @param sequelize - The Sequelize instance for database connection
	 * @static
	 */
	static initModel(sequelize: Sequelize) {
		Driver.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
				},
				fullname: {
					type: DataTypes.STRING(100),
					allowNull: true,
				},
				phoneNumber: {
					type: DataTypes.STRING(16),
					allowNull: true,
				},
				avatar: {
					type: DataTypes.STRING(255),
					allowNull: true,
				},
				hiredAt: {
					type: DataTypes.DATE,
					allowNull: true,
				},
				isActive: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: true,
				},
				licenseNumber: {
					type: DataTypes.STRING(64),
					allowNull: true,
				},
				licenseCategory: {
					type: DataTypes.STRING(32),
					allowNull: true,
				},
				licenseIssueDate: {
					type: DataTypes.DATE,
					allowNull: true,
				},
				licenseExpiryDate: {
					type: DataTypes.DATE,
					allowNull: true,
				},
				issuingAuthority: {
					type: DataTypes.STRING(100),
					allowNull: true,
				},
				isSuspended: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
				},
			},
			{
				sequelize,
				tableName: "drivers",
				timestamps: true,
			}
		);
	}
}
