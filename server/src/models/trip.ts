import { Model, DataTypes, Optional, Sequelize } from "sequelize";

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
	public id!: number;
	public vehicleId!: number;
	public routeId!: number;
	public startTime!: Date;
	public endTime?: Date | null;
	public price?: number | null;
	public status?: string;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

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
