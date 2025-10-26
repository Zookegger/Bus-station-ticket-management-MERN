import {
	DataTypes,
	Model,
	Optional,
	Sequelize,
	HasManyGetAssociationsMixin,
} from "sequelize";
import { Vehicle } from "./vehicle";
import { DbModels } from "@models";;

/**
 * Attributes representing a Vehicle Type in the system.
 *
 * @interface VehicleTypeAttributes
 * @property {number} id - Primary key of the vehicle type.
 * @property {string} name - The display name of the vehicle type (e.g., "Luxury Bus", "Minivan").
 * @property {number | null} [price] - Base price or rental fee associated with this vehicle type.
 * @property {number | null} [totalFloors] - Total number of floors (for multi-level buses).
 * @property {number | null} [totalColumns] - Total number of seat columns per floor.
 * @property {number | null} [totalSeats] - Total seat count across all floors.
 * @property {string | null} [rowsPerFloor] - JSON or serialized layout data representing seat rows per floor.
 * @property {string | null} [seatsPerFloor] - JSON or serialized layout data representing seat details per floor.
 * @property {Date} [createdAt] - Timestamp when the vehicle type record was created.
 * @property {Date} [updatedAt] - Timestamp when the vehicle type record was last updated.
 */
export interface VehicleTypeAttributes {
	id: number;
	name: string;
	price?: number | null;
	totalFloors?: number | null;
	totalColumns?: number | null;
	totalSeats?: number | null;
	rowsPerFloor?: string | null;
	seatsPerFloor?: string | null;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Attributes required for creating a new Vehicle Type.
 * Certain fields are optional because they are auto-generated or
 * can be filled in later (e.g., seat layout details, timestamps).
 *
 * @interface VehicleTypeCreationAttributes
 * @extends {Optional<VehicleTypeAttributes, "id" | "price" | "totalFloors" | "totalColumns" | "totalSeats" | "rowsPerFloor" | "seatsPerFloor" | "createdAt" | "updatedAt">}
 */
export interface VehicleTypeCreationAttributes
	extends Optional<
		VehicleTypeAttributes,
		| "id"
		| "price"
		| "totalFloors"
		| "totalColumns"
		| "totalSeats"
		| "rowsPerFloor"
		| "seatsPerFloor"
		| "createdAt"
		| "updatedAt"
	> {}

/**
 * Sequelize model representing a Vehicle Type.
 *
 * Maps the `vehicle_types` table and enforces schema and validation
 * via Sequelize. Each record defines the configuration of a specific
 * type of vehicle (e.g., seating layout, number of floors, and pricing).
 *
 * @class VehicleType
 * @extends {Model<VehicleTypeAttributes, VehicleTypeCreationAttributes>}
 * @implements {VehicleTypeAttributes}
 * @property {number} id - Primary key of the vehicle type.
 * @property {string} name - The display name of the vehicle type.
 * @property {number | null} [price] - Base price associated with this vehicle type.
 * @property {number | null} [totalFloors] - Total number of floors.
 * @property {number | null} [totalColumns] - Total number of seat columns per floor.
 * @property {number | null} [totalSeats] - Total seat count across all floors.
 * @property {string | null} [rowsPerFloor] - JSON layout data for rows per floor.
 * @property {string | null} [seatsPerFloor] - JSON layout data for seats per floor.
 * @property {Date} [createdAt] - Timestamp when the record was created.
 * @property {Date} [updatedAt] - Timestamp when the record was last updated.
 * @property {Vehicle[]} [vehicles] - Associated Vehicle instances.
 */
export class VehicleType
	extends Model<VehicleTypeAttributes, VehicleTypeCreationAttributes>
	implements VehicleTypeAttributes
{
	public id!: number;
	public name!: string;
	public price?: number | null;
	public totalFloors?: number | null;
	public totalColumns?: number | null;
	public totalSeats?: number | null;
	public rowsPerFloor?: string | null;
	public seatsPerFloor?: string | null;
	public readonly createdAt?: Date;
	public readonly updatedAt?: Date;

	// Association properties
	public getVehicles!: HasManyGetAssociationsMixin<Vehicle>;
	/**
	 * @property {Vehicle[]} [vehicles] - Associated Vehicle instances.
	 */
	public readonly vehicles?: Vehicle[];

	/**
	 * Initializes the Sequelize model definition for VehicleType.
	 *
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
	static initModel(sequelize: Sequelize): void {
		VehicleType.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
					autoIncrement: true,
				},
				name: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				price: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: true,
				},
				totalFloors: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: true,
					field: 'totalFloors'
				},
				totalColumns: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: true,
					field: 'totalColumns'
				},
				totalSeats: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: true,
					field: 'totalSeats'
				},
				rowsPerFloor: {
					type: DataTypes.TEXT("long"),
					allowNull: true,
					comment: "JSON string representing rows per floor (e.g., [10,8])",
					field: 'rowsPerFloor'
				},
				seatsPerFloor: {
					type: DataTypes.TEXT("long"),
					allowNull: true,
					comment: "JSON string representing seat layout matrix per floor",
					field: 'seatsPerFloor'
				},
			},
			{
				sequelize,
				tableName: "vehicle_types",
				timestamps: true,
				underscored: false
			}
		);
	}

	/**
	 * Defines associations between the VehicleType model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels): void {
		VehicleType.hasMany(models.Vehicle, {
			foreignKey: "vehicleTypeId",
			as: "vehicles",
			onDelete: "SET NULL",
		});
	}
}