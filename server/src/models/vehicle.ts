import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { VehicleType } from "./vehicleType";
import { Trip } from "./trip";

/**
 * Attributes representing a Vehicle in the system.
 *
 * @interface VehicleAttributes
 * @property {number} id - Primary key (auto-incremented).
 * @property {string} numberPlate - Unique license plate number of the vehicle.
 * @property {number} vehicleTypeId - Foreign key referencing the vehicle type.
 * @property {string | null} [manufacturer] - Manufacturer or brand of the vehicle (optional).
 * @property {string | null} [model] - Model name or code of the vehicle (optional).
 * @property {Date} [createdAt] - Timestamp when the vehicle record was created.
 * @property {Date} [updatedAt] - Timestamp when the vehicle record was last updated.
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
 * Attributes required for creating a new Vehicle.
 * Some fields are optional because they are generated automatically
 * (e.g., id, timestamps) or may be added later.
 *
 * @interface VehicleCreationAttributes
 */
export interface VehicleCreationAttributes
	extends Optional<
		VehicleAttributes,
		"id" | "manufacturer" | "model" | "createdAt" | "updatedAt"
	> {}

/**
 * Sequelize model representing a Vehicle.
 *
 * Maps the `vehicle` table and defines schema validation rules via Sequelize.
 *
 * @class Vehicle
 * @implements {VehicleAttributes}
 * @property {number} id - Unique identifier of the vehicle.
 * @property {string} numberPlate - Unique license plate number.
 * @property {number} vehicleTypeId - Reference to the related VehicleType record.
 * @property {string | null} [manufacturer] - Optional manufacturer name.
 * @property {string | null} [model] - Optional model name or code.
 * @property {Date} [createdAt] - Timestamp when the record was created.
 * @property {Date} [updatedAt] - Timestamp when the record was last updated.
 */
export class Vehicle
	extends Model<VehicleAttributes, VehicleCreationAttributes>
	implements VehicleAttributes
{
	public id!: number;
	public numberPlate!: string;
	public vehicleTypeId!: number;
	public manufacturer?: string | null;
	public model?: string | null;
	public createdAt?: Date;
	public updatedAt?: Date;

	// Association properties
	public vehicleType?: VehicleType;
	public trips?: Trip[];

    /**
	 * Initializes the Sequelize model definition for Vehicle.
	 *
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
	static initModel(sequelize: Sequelize) {
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
				},
				vehicleTypeId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: true,
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
				tableName: "vehicle",
				timestamps: true,
			}
		);
	}
}
