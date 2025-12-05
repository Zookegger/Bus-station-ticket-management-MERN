import {
	Model,
	DataTypes,
	Optional,
	Sequelize,
	HasManyGetAssociationsMixin,
} from "sequelize";
import { Trip } from "./trip";
import { DbModels } from "@models";
import { RouteStop } from "./routeStop";

/**
 * @interface RouteAttributes
 * @property {number} id - Primary key of the route.
 * @property {number | null} [distance] - Total distance of the route in kilometers.
 * @property {number | null} [duration] - Total duration of the route in hours.
 * @property {number | null} [price] - Base price of the route.
 * @property {Date} [createdAt] - Timestamp when the record was created.
 * @property {Date} [updatedAt] - Timestamp when the record was last updated.
 */
export interface RouteAttributes {
	id: number;
	name: string;
	distance?: number | null;
	duration?: number | null;
	price?: number | null;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Attributes required for creating a new Route.
 * Some fields are optional because they are generated automatically
 * or can be added later (e.g., id, timestamps).
 *
 * @interface RouteCreationAttributes
 */
export interface RouteCreationAttributes
	extends Optional<
		RouteAttributes,
		"id" | "distance" | "duration" | "price" | "createdAt" | "updatedAt"
	> {}

/**
 * Sequelize model representing a Route.
 *
 * Maps the `routes` table and enforces schema via Sequelize.
 * Each route connects two locations and includes pricing and distance information.
 *
 * @class Route
 * @extends Model
 * @implements {RouteAttributes}
 * @property {number} id - Primary key of the route.
 * @property {number} [distance] - Distance of the route in meters.
 * @property {number} [duration] - Duration of the route in seconds.
 * @property {number} [price] - Price of the route.
 * @property {Date} createdAt - Timestamp when the route record was created.
 * @property {Date} updatedAt - Timestamp when the route record was last updated.
 * @property {Trip[]} [trips] - Associated Trip instances.
 */
export class Route
	extends Model<RouteAttributes, RouteCreationAttributes>
	implements RouteAttributes
{
	/**
	 * @property {number} id - Primary key of the route.
	 */
	public id!: number;

	/**
	 * @property {number} id - Name of the route.
	 */
	public name!: string;
	/**
	 * @property {number | null} distance - Distance of the route in kilometers.
	 */
	public distance?: number | null;
	/**
	 * @property {number | null} duration - Duration of the route in hours.
	 */
	public duration?: number | null;
	/**
	 * @property {number | null} price - Price of the route.
	 */
	public price?: number | null;

	/**
	 * @property {Date} createdAt - Timestamp when the route record was created.
	 */
	public readonly createdAt!: Date;
	/**
	 * @property {Date} updatedAt - Timestamp when the route record was last updated.
	 */
	public readonly updatedAt!: Date;

	// Association properties
	public getTrips!: HasManyGetAssociationsMixin<Trip>;
	/**
	 * @property {Trip[]} [trips] - Associated Trip instances.
	 */
	public readonly trips?: Trip[];

	public getStops!: HasManyGetAssociationsMixin<RouteStop>;
	/**
	 * @property {RouteStop[]} [stops] - Associated RouteStop instances.
	 */
	public readonly stops?: RouteStop[];

	/**
	 * Initializes the Sequelize model definition for Route.
	 *
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
	static initModel(sequelize: Sequelize) {
		Route.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
					autoIncrement: true,
				},
				name: { type: DataTypes.STRING, allowNull: false },
				distance: { type: DataTypes.FLOAT, allowNull: true },
				duration: { type: DataTypes.FLOAT, allowNull: true },
				price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
			},
			{
				sequelize,
				tableName: "routes",
				timestamps: true,
				underscored: false,
			}
		);
	}

	/**
	 * Defines associations between the Route model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels) {
		Route.hasMany(models.Trip, {
			foreignKey: "routeId",
			as: "trips",
			onDelete: "RESTRICT",
			onUpdate: "CASCADE",
		});
		Route.hasMany(models.RouteStop, {
			foreignKey: "routeId",
			as: "stops",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});
	}
}
