import {
	Model,
	DataTypes,
	Optional,
	Sequelize,
	HasManyGetAssociationsMixin,
} from "sequelize";
import { TripDriverAssignment } from "./tripDriverAssignment";
import { DbModels } from "@models";;

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
 * Attributes required for creating a new Driver.
 * Some fields are optional because they are generated automatically
 * or can be added later (e.g., id, timestamps).
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
 * @property {TripDriverAssignment[]} [tripAssignments] - Associated TripDriverAssignment instances.
*/
export class Driver
	extends Model<DriverAttributes, DriverCreationAttributes>
	implements DriverAttributes
{
	/**
	 * @property {number} id - Unique identifier for the driver record
	 */
	public id!: number;
	/**
	 * @property {string | null} fullname - Driver's full name
	 */
	public fullname!: string | null;
	/**
	 * @property {string | null} phoneNumber - Driver's phone number
	 */
	public phoneNumber?: string | null;
	/**
	 * @property {string | null} avatar - URL or path to the driver's avatar image
	 */
	public avatar?: string | null;
	/**
	 * @property {Date | null} hiredAt - Date when the driver was hired
	 */
	public hiredAt?: Date | null;
	/**
	 * @property {boolean} isActive - Indicates if the driver is actively employed
	 */
	public isActive?: boolean;
	/**
	 * @property {string | null} licenseNumber - Unique driver's license number
	 */
	public licenseNumber!: string | null;
	/**
	 * @property {string | null} licenseCategory - License category
	 */
	public licenseCategory!: string | null;
	/**
	 * @property {Date | null} licenseIssueDate - Date the license was issued
	 */
	public licenseIssueDate!: Date | null;
	/**
	 * @property {Date | null} licenseExpiryDate - Date the license expires
	 */
	public licenseExpiryDate!: Date | null;
	/**
	 * @property {string | null} issuingAuthority - Authority that issued the license
	 */
	public issuingAuthority!: string | null;
	/**
	 * @property {boolean} isSuspended - Indicates if the license is suspended
	 */
	public isSuspended!: boolean;
	/**
	 * @property {Date} createdAt - Creation timestamp
	 */
	public readonly createdAt!: Date;
	/**
	 * @property {Date} updatedAt - Last update timestamp
	 */
	public readonly updatedAt!: Date;

	// Association properties
	public getTripAssignments!: HasManyGetAssociationsMixin<TripDriverAssignment>;
	/**
	 * @property {TripDriverAssignment[]} [tripAssignments] - Associated TripDriverAssignment instances.
	 */
	public readonly tripAssignments?: TripDriverAssignment[];

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
					autoIncrement: true,
					primaryKey: true,
				},
				fullname: {
					type: DataTypes.STRING(100),
					allowNull: true,
				},
				phoneNumber: {
					type: DataTypes.STRING(16),
					allowNull: true,
					field: 'phoneNumber'
				},
				avatar: {
					type: DataTypes.STRING(255),
					allowNull: true,
				},
				hiredAt: {
					type: DataTypes.DATE,
					allowNull: true,
					field: 'hiredAt'
				},
				isActive: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: true,
					field: 'isActive'
				},
				licenseNumber: {
					type: DataTypes.STRING(64),
					allowNull: true,
					field: 'licenseNumber'
				},
				licenseCategory: {
					type: DataTypes.STRING(32),
					allowNull: true,
					field: 'licenseCategory'
				},
				licenseIssueDate: {
					type: DataTypes.DATE,
					allowNull: true,
					field: 'licenseIssueDate'
				},
				licenseExpiryDate: {
					type: DataTypes.DATE,
					allowNull: true,
					field: 'licenseExpiryDate'
				},
				issuingAuthority: {
					type: DataTypes.STRING(100),
					allowNull: true,
					field: 'issuingAuthority'
				},
				isSuspended: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
					field: 'isSuspended'
				},
			},
			{
				sequelize,
				tableName: "drivers",
				timestamps: true,
				underscored: false
			}
		);
	}

	/**
	 * Defines associations between the Driver model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels) {
		Driver.hasMany(models.TripDriverAssignment, {
			foreignKey: "driverId",
			as: "tripAssignments",
		});
	}
}
