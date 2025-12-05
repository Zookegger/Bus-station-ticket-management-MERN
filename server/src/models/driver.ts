import {
	Model,
	DataTypes,
	Optional,
	Sequelize,
	HasManyGetAssociationsMixin,
} from "sequelize";
import { TripSchedule } from "@models/tripSchedule";
import { DbModels } from "@models";
import { Gender } from "./user";

/**
 * Enum representing the status of a Driver on the server side.
 */
export enum DriverStatus {
	/** Driver is active and eligible for assignments. */
	ACTIVE = "ACTIVE",
	/** Driver is not active (e.g., left or not currently working). */
	INACTIVE = "INACTIVE",
	/** Driver is suspended and should not be assigned to trips. */
	SUSPENDED = "SUSPENDED",
}

/**
 * Represents a driver, including personal details and license information for bus ticket management.
 *
 * @interface DriverAttributes
 * @property {number} id - Unique identifier for the driver record
 * @property {string | null} fullname - Driver's full name
 * @property {Date | null} dateOfBirth - Driver's date of birth
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
	dateOfBirth?: Date | null;
	gender: Gender;
	citizenId?: string | null;
	email?: string | null;
	phoneNumber?: string | null;
	avatar?: string | null;
	address?: string | null;
	hiredAt?: Date | null;
	isActive?: boolean;
	licenseNumber: string | null;
	licenseCategory: string | null;
	licenseIssueDate: Date | null;
	licenseExpiryDate: Date | null;
	issuingAuthority: string | null;
	isSuspended: boolean;
	status: DriverStatus;
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
		| "id"
		| "dateOfBirth"
		| "email"
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
		| "citizenId"
		| "address"
		| "status"
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
 * @property {TripSchedule[]} [tripAssignments] - Associated TripSchedule instances.
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
	 * @property {Date | null} dateOfBirth - Driver's date of birth
	 */
	public dateOfBirth?: Date | null;
	public gender!: Gender;
	/**
	 * @property {string | null} citizenId - National ID / citizen identification number
	 */
	public citizenId?: string | null;
	/**
	 * @property {string | null} email - Driver's email address
	 */
	public email?: string | null;
	/**
	 * @property {string | null} address - Driver's residential or mailing address
	 */
	public address?: string | null;
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
	/** Driver status */
	public status!: DriverStatus;
	/**
	 * @property {Date} createdAt - Creation timestamp
	 */
	public readonly createdAt!: Date;
	/**
	 * @property {Date} updatedAt - Last update timestamp
	 */
	public readonly updatedAt!: Date;

	// Association properties
	public getTripAssignments!: HasManyGetAssociationsMixin<TripSchedule>;
	/**
	 * @property {TripSchedule[]} [tripAssignments] - Associated TripSchedule instances.
	 */
	public readonly tripAssignments?: TripSchedule[];

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
				email: {
					type: DataTypes.STRING(150),
					allowNull: true,
				},
				gender: {
					type: DataTypes.ENUM(...Object.values(typeof Gender)),
					defaultValue: Gender.OTHER,
					allowNull: false,
				},
				phoneNumber: {
					type: DataTypes.STRING(16),
					allowNull: true,
				},
				avatar: {
					type: DataTypes.STRING(255),
					allowNull: true,
				},
				address: {
					type: DataTypes.STRING(255),
					allowNull: true,
					field: "address",
				},
				dateOfBirth: {
					type: DataTypes.DATE,
					allowNull: true,
					field: "dateOfBirth",
				},
				citizenId: {
					type: DataTypes.STRING(64),
					allowNull: true,
					unique: true,
					field: "citizenId",
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
					field: "licenseNumber",
				},
				licenseCategory: {
					type: DataTypes.STRING(32),
					allowNull: true,
					field: "licenseCategory",
				},
				licenseIssueDate: {
					type: DataTypes.DATE,
					allowNull: true,
					field: "licenseIssueDate",
				},
				licenseExpiryDate: {
					type: DataTypes.DATE,
					allowNull: true,
					field: "licenseExpiryDate",
				},
				issuingAuthority: {
					type: DataTypes.STRING(100),
					allowNull: true,
					field: "issuingAuthority",
				},
				isSuspended: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
					field: "isSuspended",
				},
				status: {
					type: DataTypes.ENUM(...Object.values(DriverStatus)),
					allowNull: false,
					defaultValue: DriverStatus.ACTIVE,
					field: "status",
				},
			},
			{
				sequelize,
				tableName: "drivers",
				timestamps: true,
				underscored: false,
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
		Driver.hasMany(models.TripSchedule, {
			foreignKey: "driverId",
			as: "tripAssignments",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});
		Driver.belongsToMany(models.Trip, {
			through: models.TripSchedule,
			foreignKey: "driverId",
			otherKey: "tripId",
			as: "trips",
		});
	}
}
