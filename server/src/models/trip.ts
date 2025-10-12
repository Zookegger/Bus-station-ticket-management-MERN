import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import { Vehicle } from "./vehicle";
import { Route } from "./route";
import { Seat } from "./seat";

/**
 * Sequelize model for Trip entity.
 *
 * Represents scheduled bus trips based on a specific route and vehicle.
 * Each trip defines a start time, optional end time, ticket price, and current status.
 * Used for managing bus operations and tracking trip progress in the ticket management system.
 */

/**
 * Attributes representing a Trip in the system.
 *
 * @interface TripAttributes
 * @property {number} id - Unique identifier of the trip (primary key).
 * @property {number} vehicleId - Foreign key referencing the assigned vehicle.
 * @property {number} routeId - Foreign key referencing the route for this trip.
 * @property {Date} startTime - Scheduled departure time for the trip.
 * @property {Date | null} endTime - Actual or estimated arrival time (nullable).
 * @property {number | null} price - Ticket price for this specific trip.
 * @property {"Scheduled" | "Departed" | "Completed" | "Cancelled" | string} status - Current status of the trip.
 * @property {Date} createdAt - Timestamp when the trip record was created.
 * @property {Date} updatedAt - Timestamp when the trip record was last updated.
 */
export interface TripAttributes {
	id: number;
	vehicleId: number;
	routeId: number;
	startTime: Date;
	endTime?: Date | null;
	price?: number | null;
	status?: "Scheduled" | "Departed" | "Completed" | "Cancelled" | string;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Attributes required for creating a new Trip.
 * Some fields are optional because they are automatically generated or can be updated later.
 * (e.g., id, endTime, status, timestamps)
 *
 * @interface TripCreationAttributes
 */
export interface TripCreationAttributes
	extends Optional<
		TripAttributes,
		"id" | "endTime" | "price" | "status" | "createdAt" | "updatedAt"
	> {}

/**
 * Sequelize model representing a Trip.
 *
 * Maps the `trips` table and enforces schema via Sequelize.
 * Each trip links a vehicle and a route, with scheduling and pricing details.
 *
 * @class Trip
 * @extends Model
 * @implements {TripAttributes}
 * @property {number} id - Unique identifier of the trip.
 * @property {number} vehicleId - Vehicle assigned to the trip.
 * @property {number} routeId - Route associated with the trip.
 * @property {Date} startTime - Planned departure time.
 * @property {Date | null} endTime - Actual or estimated arrival time.
 * @property {number | null} price - Ticket price for the trip.
 * @property {string} status - Current trip status (e.g., Scheduled, Departed).
 * @property {Date} createdAt - Creation timestamp.
 * @property {Date} updatedAt - Last update timestamp.
 */
export class Trip
	extends Model<TripAttributes, TripCreationAttributes>
	implements TripAttributes
{
	/** Unique identifier of the trip */
	public id!: number;

	/** Foreign key referencing the assigned vehicle */
	public vehicleId!: number;

	/** Foreign key referencing the route for this trip */
	public routeId!: number;

	/** Scheduled departure time for the trip */
	public startTime!: Date;

	/** Actual or estimated arrival time */
	public endTime?: Date | null;

	/** Ticket price for this specific trip */
	public price?: number | null;

	/** Current status of the trip (Scheduled, Departed, Completed, Cancelled) */
	public status?: string;

	/** Timestamp when the trip record was created */
	public readonly createdAt!: Date;

	/** Timestamp when the trip record was last updated */
	public readonly updatedAt!: Date;

	// Association properties
	/** Vehicle assigned to the trip */
	public vehicle?: Vehicle;

	/** Route associated with the trip */
	public route?: Route;

	/** Seats assigned to this trip */
	public seats?: Seat[];

	/**
	 * Initializes the Sequelize model definition for Trip.
	 *
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
	static initModel(sequelize: Sequelize): void {
		Trip.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
					autoIncrement: true,
				},
				vehicleId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
				},
				routeId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
				},
				startTime: {
					type: DataTypes.DATE,
					allowNull: false,
				},
				endTime: {
					type: DataTypes.DATE,
					allowNull: true,
				},
				price: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: true,
				},
				status: {
					type: DataTypes.STRING,
					allowNull: true,
					defaultValue: "Scheduled",
				},
			},
			{
				sequelize,
				tableName: "trips",
				timestamps: true,
			}
		);
	}
}
