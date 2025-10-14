import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import { Trip } from "./trip";
import { Driver } from "./driver";

interface TripDriverAssignmentAttributes {
	id: number;
	tripId: number;
	driverId: number;
	assignedAt?: Date;
	createdAt?: Date;
	updatedAt?: Date;
}

interface TripDriverAssignmentCreationAttributes
	extends Optional<
		TripDriverAssignmentAttributes,
		"id" | "assignedAt" | "createdAt" | "updatedAt"
	> {}

export class TripDriverAssignment
	extends Model<
		TripDriverAssignmentAttributes,
		TripDriverAssignmentCreationAttributes
	>
	implements TripDriverAssignmentAttributes
{
	public id!: number;
	public tripId!: number;
	public driverId!: number;
	public assignedAt?: Date;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	// Association properties
	public trip?: Trip;
	public driver?: Driver;

	static initModel(sequelize: Sequelize) {
		TripDriverAssignment.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
					autoIncrement: true,
				},
				tripId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
				driverId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
				},
				assignedAt: { type: DataTypes.DATE, allowNull: true },
			},
			{
				sequelize,
				tableName: "trip_driver_assignments",
				timestamps: true,
			}
		);
	}
}
