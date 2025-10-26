import {
	DataTypes,
	Model,
	Optional,
	Sequelize,
	HasManyGetAssociationsMixin,
} from "sequelize";
import { Route } from "./route";
import { DbModels } from "@models";;

/**
 * Sequelize model for Location entity.
 *
 * Represents bus station locations with geographical coordinates.
 * Used for managing pickup/dropoff points in the ticket management system.
 */

/**
 * Attributes representing a Location in the system.
 *
 * @interface LocationAttributes
 * @property {number} id - Unique identifier of the location (primary key).
 * @property {string} name - Name of the location (e.g., bus station name).
 * @property {string | null} address - Physical address of the location.
 * @property {number | null} latitude - Latitude coordinate of the location.
 * @property {number | null} longitude - Longitude coordinate of the location.
 * @property {Date} createdAt - Timestamp when the record was created.
 * @property {Date} updatedAt - Timestamp when the record was last updated.
 */
export interface LocationAttributes {
    id: number,
    name: string,
    address: string | null,
    latitude?: number | null,
    longitude?: number | null,
    createdAt?: Date
    updatedAt?: Date
}

/**
 * Attributes required for creating a new Location.
 * Some fields are optional because they are generated automatically
 * or can be added later (e.g., id, timestamps).
 *
 * @interface LocationCreationAttributes
 */
export interface LocationCreationAttributes extends Optional<LocationAttributes, 'id' | 'address' | 'latitude' | 'longitude' | 'createdAt' | 'updatedAt'>{}

/**
 * Sequelize model representing a Location.
 *
 * Maps the `locations` table and enforces schema via Sequelize.
 *
 * @class Location
 * @extends Model
 * @implements {LocationAttributes}
 * @property {number} id - Unique identifier of the location.
 * @property {string} name - Name of the location.
 * @property {string | null} address - Physical address.
 * @property {number | null} latitude - Latitude coordinate.
 * @property {number | null} longitude - Longitude coordinate.
 * @property {Date} createdAt - Creation timestamp.
 * @property {Date} updatedAt - Last update timestamp.
 * @property {Route[]} [routesStartingHere] - Associated Route instances starting from this location.
 * @property {Route[]} [routesEndingHere] - Associated Route instances ending at this location.
 */
export class Location extends Model<LocationAttributes, LocationCreationAttributes> implements LocationAttributes {
    /**
     * @property {number} id - Unique identifier of the location.
     */
    public id!: number
    /**
     * @property {string} name - Name of the location.
     */
    public name!: string
    /**
     * @property {string | null} address - Physical address.
     */
    public address!: string | null
    /**
     * @property {number | null} latitude - Latitude coordinate.
     */
    public latitude?: number | null
    /**
     * @property {number | null} longitude - Longitude coordinate.
     */
    public longitude?: number | null
    /**
     * @property {Date} createdAt - Creation timestamp.
     */
    public readonly createdAt!: Date
    /**
     * @property {Date} updatedAt - Last update timestamp.
     */
    public readonly updatedAt!: Date

    // Association properties
    public getRoutesStartingHere!: HasManyGetAssociationsMixin<Route>;
    /**
     * @property {Route[]} [routesStartingHere] - Associated Route instances starting from this location.
     */
    public readonly routesStartingHere?: Route[];

    public getRoutesEndingHere!: HasManyGetAssociationsMixin<Route>;
    /**
     * @property {Route[]} [routesEndingHere] - Associated Route instances ending at this location.
     */
    public readonly routesEndingHere?: Route[];

    /**
	 * Initializes the Sequelize model definition for Location.
	 *
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 */
	static initModel(sequelize: Sequelize) {
        Location.init(
            {
                id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
                name: { type: DataTypes.STRING, allowNull: false },
                address: { type: DataTypes.STRING, allowNull: false },
                longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
                latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
            },
            {
                sequelize,
                tableName: 'locations',
                timestamps: true,
				underscored: false
            }
        );
	}

	/**
	 * Defines associations between the Location model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels) {
		Location.hasMany(models.Route, {
			as: "routesStartingHere",
			foreignKey: "startId",
		});
		Location.hasMany(models.Route, {
			as: "routesEndingHere",
			foreignKey: "destinationId",
		});
	}
}