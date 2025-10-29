import {
	DataTypes,
	Model,
	Optional,
	Sequelize,
} from "sequelize";
import { VehicleType } from "./vehicleType";
import { Trip } from "./trip";
import { DbModels } from "@models";

/**
 * Enum for the status of a vehicle.
 * @enum {string}
 * @property {string} ACTIVE - The vehicle is active and available for trips.
 * @property {string} INACTIVE - The vehicle is inactive and not available for trips.
 * @property {string} MAINTENANCE - The vehicle is under maintenance.
 */
export enum VehicleStatus {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
	MAINTENANCE = "MAINTENANCE",
}

/**
 * Interface for the attributes of a Vehicle.
 * @interface VehicleAttributes
 * @property {number} id - The unique identifier for the vehicle.
 * @property {string} licensePlate - The license plate of the vehicle.
 * @property {string} model - The model of the vehicle.
 * @property {number} year - The manufacturing year of the vehicle.
 * @property {VehicleStatus} status - The current status of the vehicle.
 * @property {number} vehicleTypeId - The ID of the vehicle type.
 * @property {Date} [createdAt] - The date and time the vehicle was created.
 * @property {Date} [updatedAt] - The date and time the vehicle was last updated.
 */
export interface VehicleAttributes {
	id: number;
	numberPlate: string;
	vehicleTypeId: number;
	manufacturer?: string | null;
	model?: string | null;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Interface for the creation attributes of a Vehicle.
 * @interface VehicleCreationAttributes
 * @extends {Optional<VehicleAttributes, "id" | "createdAt" | "updatedAt">}
 */
export interface VehicleCreationAttributes
	extends Optional<VehicleAttributes, "id" | "createdAt" | "updatedAt"> {}

/**
 * Sequelize model for the Vehicle.
 * @class Vehicle
 * @extends {Model<VehicleAttributes, VehicleCreationAttributes>}
 * @implements {VehicleAttributes}
 * @property {number} id - The unique identifier for the vehicle.
 * @property {string} numberPlate - The license plate of the vehicle.
 * @property {number} vehicleTypeId - The ID of the vehicle type.
 * @property {string | null} [manufacturer] - The manufacturer of the vehicle.
 * @property {string | null} [model] - The model of the vehicle.
 * @property {Date} [createdAt] - The date and time the vehicle was created.
 * @property {Date} [updatedAt] - The date and time the vehicle was last updated.
 * @property {VehicleType} [vehicleType] - Associated VehicleType instance.
 * @property {Trip[]} [trips] - Associated Trip instances.
 */
export class Vehicle
	extends Model<VehicleAttributes, VehicleCreationAttributes>
	implements VehicleAttributes
{
	/** Unique identifier of the vehicle */
	public id!: number;

	/** Unique license plate number of the vehicle */
	public numberPlate!: string;

	/** Foreign key referencing the vehicle type */
	public vehicleTypeId!: number;

	/** Manufacturer or brand of the vehicle */
	public manufacturer?: string | null;

	/** Model name or code of the vehicle */
	public model?: string | null;

	/** Timestamp when the vehicle record was created */
	public createdAt?: Date;

	/** Timestamp when the vehicle record was last updated */
	public updatedAt?: Date;

	// Associations
	/**
	 * @property {VehicleType} [vehicleType] - Associated VehicleType instance.
	 */
	public readonly vehicleType?: VehicleType;
	/**
	 * @property {Trip[]} [trips] - Associated Trip instances.
	 */
	public readonly trips?: Trip[];

	/**
	 * Initializes the Vehicle model.
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
	static initModel(sequelize: Sequelize): void {
		Vehicle.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
					autoIncrement: true,
				},
				numberPlate: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
					field: 'numberPlate'
				},
				vehicleTypeId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: true,
					field: 'vehicleTypeId'
				},
				manufacturer: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				model: {
					type: DataTypes.STRING,
					allowNull: true,
				},
			},
			{
				sequelize,
				tableName: "vehicles",
				timestamps: true,
				underscored: false
			}
		);
	}

	/**
	 * Defines associations between the Vehicle model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels): void {
		Vehicle.belongsTo(models.VehicleType, {
			foreignKey: "vehicleTypeId",
			as: "vehicleType",
		});
		Vehicle.hasMany(models.Trip, {
			foreignKey: "vehicleId",
			as: "trips",
		});
	}
}
