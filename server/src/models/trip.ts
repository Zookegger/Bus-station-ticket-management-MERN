import {
	DataTypes,
	Model,
	Optional,
	Sequelize,
	BelongsToGetAssociationMixin,
	HasManyGetAssociationsMixin,
} from "sequelize";
import { Route } from "@models/route";
import { Vehicle } from "@models/vehicle";
import { Seat } from "@models/seat";
import { DbModels } from "@models";
import { TripRepeatFrequency, TripStatus } from "@my_types/trip";
import { Driver } from "./driver";

/**
 * Interface for the attributes of a Trip.
 * @interface TripAttributes
 * @property {number} id - The unique identifier for the trip.
 * @property {number} routeId - The ID of the route for this trip.
 * @property {number} vehicleId - The ID of the vehicle for this trip.
 * @property {Date} startTime - The departure time of the trip.
 * @property {Date} [returnStartTime] - The start time of the return trip (if round trip).
 * @property {TripStatus} status - The current status of the trip.
 * @property {number} basePrice - The base price for the trip.
 * @property {Date} [createdAt] - The date and time the trip was created.
 * @property {Date} [updatedAt] - The date and time the trip was last updated.
 */
export interface TripAttributes {
	/**The unique identifier for the trip. */
	id: number;
	/**The ID of the route for this trip. */
	routeId: number;
	/**The ID of the vehicle for this trip. */
	vehicleId: number;
	/**The departure time of the trip. */
	startTime: Date;
	/**The start time of the return trip (if round trip). */
	returnStartTime?: Date | null;
	/**The ticket price assigned to this trip. */
	price: number;
	/**The current status of the trip. */
	status?: TripStatus;
	/**Is this trip a template for repetition? */
	isTemplate: boolean;
	/**How often should this trip repeat? */
	repeatFrequency?: TripRepeatFrequency | null;
	/**The date on which this repetition schedule should end. */
	repeatEndDate?: Date | null;
	/**If this trip is an instance, this links to its template. */
	templateTripId?: number | null;
	/**If this trip is a round trip, this links to the return trip. */
	returnTripId?: number | null;
	/**The date and time the trip was created. */
	createdAt?: Date;
	/**The date and time the trip was last updated. */
	updatedAt?: Date;
}

/**
 * Interface for the creation attributes of a Trip.
 * @interface TripCreationAttributes
 * @extends {Optional<TripAttributes, "id" | "createdAt" | "updatedAt">}
 */
export interface TripCreationAttributes
	extends Optional<
		TripAttributes,
		| "id"
		| "returnStartTime"
		| "status"
		| "isTemplate"
		| "repeatFrequency"
		| "repeatEndDate"
		| "templateTripId"
		| "createdAt"
		| "updatedAt"
	> {}

/**
 * Sequelize model for the Trip.
 * @class Trip
 * @extends {Model<TripAttributes, TripCreationAttributes>}
 * @implements {TripAttributes}
 * @property {number} id - The unique identifier for the trip.
 * @property {number} vehicleId - The ID of the vehicle for this trip.
 * @property {number} routeId - The ID of the route for this trip.
 * @property {Date} startTime - The departure time of the trip.
 * @property {Date} [returnStartTime] - The start time of the return trip (if round trip).
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
	/**The unique identifier for the trip. */
	public id!: number;
	/**The ID of the vehicle for this trip. */
	public vehicleId!: number;
	/**The ID of the route for this trip. */
	public routeId!: number;
	/**The departure time of the trip. */
	public startTime!: Date;
	/**The start time of the return trip (if round trip). */
	public returnStartTime?: Date | null;
	/**The ticket price assigned to this trip. */
	public price!: number;
	/**The current status of the trip. */
	public status!: TripStatus;
	/**Is this trip a template for repetition? */
	public isTemplate!: boolean;
	/**How often should this trip repeat? */
	public repeatFrequency?: TripRepeatFrequency | null;
	/**The date on which this repetition schedule should end. */
	public repeatEndDate?: Date | null;
	/**If this trip is an instance, this links to its template. */
	public templateTripId?: number | null;
	/**If this trip is a round trip, this links to the return trip. */
	public returnTripId?: number | null;

	/**The date and time the trip was created. */
	public readonly createdAt!: Date;
	/**The date and time the trip was last updated. */
	public readonly updatedAt!: Date;

	// Associations
	public readonly route?: Route;
	public readonly vehicle?: Vehicle;
	public readonly seats?: Seat[];
	public readonly drivers?: Driver[];
	public readonly template?: Trip;
	public readonly instances?: Trip[];

	public getRoute!: BelongsToGetAssociationMixin<Route>;
	public getVehicle!: BelongsToGetAssociationMixin<Vehicle>;
	public getSeats!: HasManyGetAssociationsMixin<Seat>;

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
					field: "vehicleId",
				},
				routeId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					field: "routeId",
				},
				startTime: {
					type: DataTypes.DATE,
					allowNull: false,
					field: "startTime",
				},
				returnStartTime: {
					type: DataTypes.DATE,
					allowNull: true,
					field: "returnStartTime",
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
				isTemplate: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
					field: "isTemplate",
				},
				repeatFrequency: {
					type: DataTypes.ENUM(...Object.values(TripRepeatFrequency)),
					allowNull: true, // Can be null if isTemplate is false
					defaultValue: TripRepeatFrequency.NONE,
					field: "repeatFrequency",
				},
				repeatEndDate: {
					type: DataTypes.DATE,
					allowNull: true,
					field: "repeatEndDate",
				},
				templateTripId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: true,
					references: {
						model: "trips", // Self-referencing
						key: "id",
					},
					field: "templateTripId",
					comment:
						"Self-referencing key. If this trip is an 'instance' (e.g., the 10AM trip for Nov 1st), this ID points to the 'template' trip (e.g., the 'Daily 10AM' schedule). This prevents duplicate generation by background workers and links instances for management.",
				},
				returnTripId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: true,
					references: {
						model: "trips",
						key: "id",
					},
					field: "returnTripId",
					comment: "Self-referencing key. Links to the return trip.",
				},
			},
			{
				sequelize,
				tableName: "trips",
				timestamps: true,
				underscored: false,
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
		// Direct access to assignment rows for auditing and scheduling UIs
		Trip.hasMany(models.TripSchedule, {
			foreignKey: "tripId",
			as: "driverAssignments",
		});
		Trip.belongsToMany(models.Driver, {
			through: models.TripSchedule,
			foreignKey: "tripId",
			otherKey: "driverId",
			as: "drivers",
		});

		// Self-referencing association
		Trip.belongsTo(models.Trip, {
			foreignKey: "templateTripId",
			as: "template",
		});
		Trip.hasMany(models.Trip, {
			foreignKey: "templateTripId",
			as: "instances",
		});

		Trip.belongsTo(models.Trip, {
			foreignKey: "returnTripId",
			as: "returnTrip",
		});
		
		Trip.hasOne(models.Trip, {
			foreignKey: "returnTripId",
			as: "outboundTrip",
		});
	}
}
