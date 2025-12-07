import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { DbModels } from "@models";
import { AssignmentMode } from "@my_types/trip";

/**
 * Interface for the attributes of a TripSchedule.
 * This is a junction table between Trip and Driver.
 * @interface TripScheduleAttributes
 * @property {number} tripId - The ID of the trip.
 * @property {string} driverId - The ID of the driver.
 * @property {Date} [createdAt] - The date and time the assignment was created.
 * @property {Date} [updatedAt] - The date and time the assignment was last updated.
 */
export interface TripScheduleAttributes {
	id: number;
	tripId: number;
	driverId: number;
	assignedAt?: Date;
	assignmentMode: AssignmentMode; // NEW: 'AUTO' | 'MANUAL'
	assignedBy?: string | null; // NEW: userId if manual, null if auto
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Interface for the creation attributes of a TripSchedule.
 * @interface TripScheduleCreationAttributes
 * @extends {TripScheduleAttributes}
 */
export interface TripScheduleCreationAttributes extends Optional<TripScheduleAttributes, "id" | "assignedBy" | "createdAt" | "updatedAt" | "assignedAt" >{}

/**
 * Sequelize model for the TripSchedule.
 * @class TripSchedule
 * @extends {Model<TripScheduleAttributes, TripScheduleCreationAttributes>}
 * @implements {TripScheduleAttributes}
 * @property {number} id - The unique identifier for the assignment.
 * @property {number} tripId - The ID of the trip.
 * @property {number} driverId - The ID of the driver.
 * @property {Date} [assignedAt] - The date and time the assignment was made.
 * @property {Date} [createdAt] - The date and time the record was created.
 * @property {Date} [updatedAt] - The date and time the record was last updated.
 */
export class TripSchedule
	extends Model<TripScheduleAttributes, TripScheduleCreationAttributes>
	implements TripScheduleAttributes
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
	public assignmentMode!: AssignmentMode;
	public assignedBy?: string | null;
	/**
	 * @property {Date} createdAt - The date and time the record was created.
	 */
	public readonly createdAt!: Date;
	/**
	 * @property {Date} updatedAt - The date and time the record was last updated.
	 */
	public readonly updatedAt?: Date;

	public readonly trip?: import("./trip").Trip;
	public readonly driver?: import("./driver").Driver;

	/**
	 * Initializes the TripSchedule model.
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
	static initModel(sequelize: Sequelize): void {
		TripSchedule.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
					autoIncrement: true,
				},
				tripId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					field: "tripId",
				},
				driverId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					field: "driverId",
				},
				assignedAt: {
					type: DataTypes.DATE,
					allowNull: true,
					field: "assignedAt",
				},
				assignmentMode: {
					type: DataTypes.ENUM(...Object.values(AssignmentMode)),
					allowNull: false,
					field: "assignmentMode",
				},
				assignedBy: {
					type: DataTypes.UUID,
					allowNull: true,
				},
			},
			{
				sequelize,
				tableName: "trip_schedules",
				timestamps: true,
			}
		);
	}

	/**
	 * Defines associations between the TripSchedule model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels): void {
		TripSchedule.belongsTo(models.Trip, {
			foreignKey: "tripId",
			as: "trip",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});
		TripSchedule.belongsTo(models.Driver, {
			foreignKey: "driverId",
			as: "driver",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});
		TripSchedule.belongsTo(models.User, {
			foreignKey: "assignedBy",
			as: "assigner",
			onDelete: "SET NULL",
			onUpdate: "CASCADE",
		});
	}
}
