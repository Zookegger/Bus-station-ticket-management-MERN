import {
	DataTypes,
	Model,
	Sequelize,
} from "sequelize";
import { DbModels } from "@models";

/**
 * Interface for the attributes of a TripDriverAssignment.
 * This is a junction table between Trip and Driver.
 * @interface TripDriverAssignmentAttributes
 * @property {number} tripId - The ID of the trip.
 * @property {string} driverId - The ID of the driver.
 * @property {Date} [createdAt] - The date and time the assignment was created.
 * @property {Date} [updatedAt] - The date and time the assignment was last updated.
 */
export interface TripDriverAssignmentAttributes {
	id: number;
	tripId: number;
	driverId: number;
	assignedAt?: Date;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Interface for the creation attributes of a TripDriverAssignment.
 * @interface TripDriverAssignmentCreationAttributes
 * @extends {TripDriverAssignmentAttributes}
 */
export interface TripDriverAssignmentCreationAttributes
	extends TripDriverAssignmentAttributes {}

/**
 * Sequelize model for the TripDriverAssignment.
 * @class TripDriverAssignment
 * @extends {Model<TripDriverAssignmentAttributes, TripDriverAssignmentCreationAttributes>}
 * @implements {TripDriverAssignmentAttributes}
 * @property {number} id - The unique identifier for the assignment.
 * @property {number} tripId - The ID of the trip.
 * @property {number} driverId - The ID of the driver.
 * @property {Date} [assignedAt] - The date and time the assignment was made.
 * @property {Date} [createdAt] - The date and time the record was created.
 * @property {Date} [updatedAt] - The date and time the record was last updated.
 */
export class TripDriverAssignment
	extends Model<
		TripDriverAssignmentAttributes,
		TripDriverAssignmentCreationAttributes
	>
	implements TripDriverAssignmentAttributes
{
	/**
	 * @property {number} id - The unique identifier for the assignment.
	 */
	public id!: number;
	/**
	 * @property {number} tripId - The ID of the trip.
	 */
	public tripId!: number;
	/**
	 * @property {number} driverId - The ID of the driver.
	 */
	public driverId!: number;
	/**
	 * @property {Date} assignedAt - The date and time the assignment was made.
	 */
	public assignedAt?: Date;

	/**
	 * @property {Date} createdAt - The date and time the record was created.
	 */
	public readonly createdAt!: Date;
	/**
	 * @property {Date} updatedAt - The date and time the record was last updated.
	 */
	public readonly updatedAt?: Date;

	/**
	 * Initializes the TripDriverAssignment model.
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
	static initModel(sequelize: Sequelize): void {
		TripDriverAssignment.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
					autoIncrement: true,
				},
				tripId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'tripId' },
				driverId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					field: 'driverId'
				},
				assignedAt: { type: DataTypes.DATE, allowNull: true, field: 'assignedAt' },
			},
			{
				sequelize,
				tableName: "trip_driver_assignments",
				timestamps: true,
				underscored: false
			}
		);
	}

	/**
	 * Defines associations between the TripDriverAssignment model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels): void {
		TripDriverAssignment.belongsTo(models.Trip, {
			foreignKey: "tripId",
			as: "trip",
		});
		TripDriverAssignment.belongsTo(models.Driver, {
			foreignKey: "driverId",
			as: "driver",
		});
	}
}
