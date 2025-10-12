import { Model, DataTypes, Optional, Sequelize } from "sequelize";

export interface TripAttributes {
	id: number;
	vehicleId: number;
	routeId: number;
	startTime: Date;
	endTime?: Date | null;
	price?: number | null;
	status?: "Scheduled" | "Departed" | "Completed" | "Cancelled" | string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface TripCreationAttributes
	extends Optional<
		TripAttributes,
		"id" | "endTime" | "price" | "status" | "createdAt" | "updatedAt"
	> {}

export class Trip
	extends Model<TripAttributes, TripCreationAttributes>
	implements TripAttributes
{
	public id!: number;
	public vehicleId!: number;
	public routeId!: number;
	public startTime!: Date;
	public endTime?: Date | null;
	public price?: number | null;
	public status?: string;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	static initModel(sequelize: Sequelize) {
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
				},
				routeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
				startTime: { type: DataTypes.DATE, allowNull: false },
				endTime: { type: DataTypes.DATE, allowNull: true },
				price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
				status: {
					type: DataTypes.STRING,
					allowNull: true,
					defaultValue: "Scheduled",
				},
			},
			{
				sequelize,
				tableName: "trips",
				timestamps: true,
			}
		);
	}
}

