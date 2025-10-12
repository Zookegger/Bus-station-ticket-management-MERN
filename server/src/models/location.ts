import { DataTypes, Model, Optional, Sequelize } from "sequelize"
import { Route } from "./route"

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
 * @implements {LocationAttributes}
 * @property {number} id - Unique identifier of the location.
 * @property {string} name - Name of the location.
 * @property {string | null} address - Physical address.
 * @property {number | null} latitude - Latitude coordinate.
 * @property {number | null} longitude - Longitude coordinate.
 * @property {Date} createdAt - Creation timestamp.
 * @property {Date} updatedAt - Last update timestamp.
 */
export class Location extends Model<LocationAttributes, LocationCreationAttributes> implements LocationAttributes {
    public id!: number
    public name!: string
    public address!: string | null
    public latitude?: number | null
    public longitude?: number | null
    public readonly createdAt!: Date
    public readonly updatedAt!: Date

    // Association properties
    public routesStartingHere?: Route[];
    public routesEndingHere?: Route[];

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
            }
        );
    };
}