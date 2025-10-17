import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import { Location } from "./location";
import { Trip } from "./trip";

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
 */
export class Route
	extends Model<RouteAttributes, RouteCreationAttributes>
	implements RouteAttributes
{
	public id!: number;
	public startId!: number;
	public destinationId!: number;
	public distance?: number | null;
	public duration?: number | null;
	public price?: number | null;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	// Association properties
	public startLocation?: Location;
	public destinationLocation?: Location;
	public trips?: Trip[];

	static initModel(sequelize: Sequelize) {
		Route.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
					autoIncrement: true,
				},
				startId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
				destinationId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
				},
				distance: { type: DataTypes.FLOAT, allowNull: true },
				duration: { type: DataTypes.FLOAT, allowNull: true },
				price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
			},
			{
				sequelize,
				tableName: "routes",
				timestamps: true,
			}
		);
	}
}
