import {
	DataTypes,
	Model,
	Optional,
	Sequelize,
} from "sequelize";
import { Route } from "./route";
import { Vehicle } from "./vehicle";
import { Seat } from "./seat";
import { Driver } from "./driver";
import { DbModels } from "@models";

/**
 * Enum for the status of a trip.
 * @enum {string}
 * @property {string} SCHEDULED - The trip is scheduled but not yet started.
 * @property {string} ONGOING - The trip is currently in progress.
 * @property {string} COMPLETED - The trip has been completed.
 * @property {string} CANCELLED - The trip has been cancelled.
 * @property {string} DELAYED - The trip is delayed.
 */
export enum TripStatus {
	/**
	 * The trip is being created or drafted.
	 * It is not yet visible to the public or open for booking.
	 * This is typically the default state.
	 */
	PENDING = "PENDING",

	/**
	 * The trip is published, visible to users, and open for booking.
	 * This is the main "active" state for a trip.
	 */
	SCHEDULED = "SCHEDULED",

	/**
	 * The trip has already started and is currently in progress.
	 * Bookings should be closed at this point.
	 */
	DEPARTED = "DEPARTED",

	/**
	 * The trip has finished successfully.
	 * This is a final state, useful for historical records and reviews.
	 */
	COMPLETED = "COMPLETED",

	/**
	 * The trip has been cancelled before or during its run.
	 * This state should trigger notifications and refunds for any
	 * passengers who had booked seats.
	 */
	CANCELLED = "CANCELLED",

	DELAYED = "DELAYED",
}

/**
 * Interface for the attributes of a Trip.
 * @interface TripAttributes
 * @property {number} id - The unique identifier for the trip.
 * @property {number} routeId - The ID of the route for this trip.
 * @property {number} vehicleId - The ID of the vehicle for this trip.
 * @property {Date} departureTime - The departure time of the trip.
 * @property {Date} arrivalTime - The arrival time of the trip.
 * @property {TripStatus} status - The current status of the trip.
 * @property {number} basePrice - The base price for the trip.
 * @property {Date} [createdAt] - The date and time the trip was created.
 * @property {Date} [updatedAt] - The date and time the trip was last updated.
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
 * Interface for the creation attributes of a Trip.
 * @interface TripCreationAttributes
 * @extends {Optional<TripAttributes, "id" | "createdAt" | "updatedAt">}
 */
export interface TripCreationAttributes
	extends Optional<TripAttributes, "id" | "createdAt" | "updatedAt"> {}

/**
 * Sequelize model for the Trip.
 * @class Trip
 * @extends {Model<TripAttributes, TripCreationAttributes>}
 * @implements {TripAttributes}
 * @property {number} id - The unique identifier for the trip.
 * @property {number} vehicleId - The ID of the vehicle for this trip.
 * @property {number} routeId - The ID of the route for this trip.
 * @property {Date} startTime - The scheduled departure time for the trip.
 * @property {Date | null} [endTime] - The actual or estimated arrival time.
 * @property {number} [price] - The ticket price for this specific trip.
 * @property {string} [status] - The current status of the trip.
 * @property {Date} [createdAt] - The date and time the trip was created.
 * @property {Date} [updatedAt] - The date and time the trip was last updated.
 * @property {Route} [route] - Associated Route instance.
 * @property {Vehicle} [vehicle] - Associated Vehicle instance.
 * @property {Seat[]} [seats] - Associated Seat instances.
 * @property {Driver[]} [drivers] - Associated Driver instances.
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
	public price!: number;

	/** Current status of the trip (Scheduled, Departed, Completed, Cancelled) */
	public status?: string;

	/** Timestamp when the trip record was created */
	public readonly createdAt!: Date;

	/** Timestamp when the trip record was last updated */
	public readonly updatedAt!: Date;

	// Associations
	/**
	 * @property {Route} [route] - Associated Route instance.
	 */
	public readonly route?: Route;
	/**
	 * @property {Vehicle} [vehicle] - Associated Vehicle instance.
	 */
	public readonly vehicle?: Vehicle;
	/**
	 * @property {Seat[]} [seats] - Associated Seat instances.
	 */
	public readonly seats?: Seat[];
	/**
	 * @property {Driver[]} [drivers] - Associated Driver instances.
	 */
	public readonly drivers?: Driver[];

	/**
	 * Initializes the Trip model.
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
					field: 'vehicleId'
				},
				routeId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					field: 'routeId'
				},
				startTime: {
					type: DataTypes.DATE,
					allowNull: false,
					field: 'startTime'
				},
				endTime: {
					type: DataTypes.DATE,
					allowNull: true,
					field: 'endTime'
				},
				price: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: false,
				},
				status: {
					type: DataTypes.ENUM(...Object.values(TripStatus)),
					allowNull: false,
					defaultValue: TripStatus.PENDING,
				},
			},
			{
				sequelize,
				tableName: "trips",
				timestamps: true,
				underscored: false
			}
		);
	}

	/**
	 * Defines associations between the Trip model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels): void {
		Trip.belongsTo(models.Route, {
			foreignKey: "routeId",
			as: "route",
		});
		Trip.belongsTo(models.Vehicle, {
			foreignKey: "vehicleId",
			as: "vehicle",
		});
		Trip.hasMany(models.Seat, {
			foreignKey: "tripId",
			as: "seats",
		});
		Trip.hasMany(models.Driver, {
			foreignKey: "tripId",
			as: "drivers",
		});
	}
}
