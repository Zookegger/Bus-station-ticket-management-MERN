import {
	Model,
	DataTypes,
	Optional,
	Sequelize,
	BelongsToGetAssociationMixin,
	HasManyGetAssociationsMixin,
} from "sequelize";
import { Location } from "./location";
import { Trip } from "./trip";
import { DbModels } from "@models";;

export interface RouteAttributes {
	id: number;
	startId: number;
	destinationId: number;
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
 * @property {number} startId - Foreign key referencing the starting location.
 * @property {number} destinationId - Foreign key referencing the destination location.
 * @property {number | null} [distance] - Distance of the route in kilometers.
 * @property {number | null} [duration] - Duration of the route in hours.
 * @property {number | null} [price] - Price of the route.
 * @property {Date} createdAt - Timestamp when the route record was created.
 * @property {Date} updatedAt - Timestamp when the route record was last updated.
 * @property {Location} [startLocation] - Associated starting Location instance.
 * @property {Location} [destinationLocation] - Associated destination Location instance.
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
	 * @property {number} startId - Foreign key referencing the starting location.
	 */
	public startId!: number;
	/**
	 * @property {number} destinationId - Foreign key referencing the destination location.
	 */
	public destinationId!: number;
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
	public getStartLocation!: BelongsToGetAssociationMixin<Location>;
	/**
	 * @property {Location} [startLocation] - Associated starting Location instance.
	 */
	public readonly startLocation?: Location;

	public getDestinationLocation!: BelongsToGetAssociationMixin<Location>;
	/**
	 * @property {Location} [destinationLocation] - Associated destination Location instance.
	 */
	public readonly destinationLocation?: Location;

	public getTrips!: HasManyGetAssociationsMixin<Trip>;
	/**
	 * @property {Trip[]} [trips] - Associated Trip instances.
	 */
	public readonly trips?: Trip[];

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
				startId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'startId' },
				destinationId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					field: 'destinationId'
				},
				distance: { type: DataTypes.FLOAT, allowNull: true },
				duration: { type: DataTypes.FLOAT, allowNull: true },
				price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
			},
			{
				sequelize,
				tableName: "routes",
				timestamps: true,
				underscored: false
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
		Route.belongsTo(models.Location, {
			foreignKey: "startId",
			as: "startLocation",
		});
		Route.belongsTo(models.Location, {
			foreignKey: "destinationId",
			as: "destinationLocation",
		});
		Route.hasMany(models.Trip, {
			foreignKey: "routeId",
			as: "trips",
		});
	}
}
