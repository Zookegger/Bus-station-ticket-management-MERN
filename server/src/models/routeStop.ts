import {
	Model,
	DataTypes,
	Optional,
	Sequelize,
	BelongsToGetAssociationMixin,
} from "sequelize";
import { Location } from "./location";
import { Route } from "./route";
import { DbModels } from "@models";

// Attributes for the RouteStop model
export interface RouteStopAttributes {
	id: number;
	routeId: number;      // Foreign key for the Route
	locationId: number;   // Foreign key for the Location
	stopOrder: number;    // The order of this stop in the route (e.g., 0=start, 1=stopA, 2=end)
	createdAt?: Date;
	updatedAt?: Date;
}

// Attributes for creation (id, timestamps are optional)
export interface RouteStopCreationAttributes
	extends Optional<RouteStopAttributes, "id" | "createdAt" | "updatedAt"> {}

// The Sequelize Model
export class RouteStop
	extends Model<RouteStopAttributes, RouteStopCreationAttributes>
	implements RouteStopAttributes
{
	public id!: number;
	public routeId!: number;
	public locationId!: number;
	public stopOrder!: number;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

    // --- Associations ---
	public getRoute!: BelongsToGetAssociationMixin<Route>;
	public readonly route?: Route;

	public getLocation!: BelongsToGetAssociationMixin<Location>;
	public readonly location?: Location;

	// --- Model Initialization ---
	static initModel(sequelize: Sequelize) {
		RouteStop.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
					autoIncrement: true,
				},
				routeId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					field: 'routeId',
				},
				locationId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					field: 'locationId',
				},
				stopOrder: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					comment: "Order of the stop in the route, starting from 0."
				},
			},
			{
				sequelize,
				tableName: "route_stops",
				timestamps: true,
                indexes: [
                    {
                        unique: true,
                        fields: ['routeId', 'stopOrder']
                    },
                    {
                        unique: true,
                        fields: ['routeId', 'locationId']
                    }
                ]
			}
		);
	}

	// --- Association Definition ---
	static associate(models: DbModels) {
        // A RouteStop belongs to one Route
		RouteStop.belongsTo(models.Route, {
			foreignKey: "routeId",
			as: "route",
		});
        // A RouteStop belongs to one Location
		RouteStop.belongsTo(models.Location, {
			foreignKey: "locationId",
			as: "location",
		});
	}
}