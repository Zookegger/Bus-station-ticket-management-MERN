import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import { Trip } from "./trip";

/**
 * Attributes representing a Seat in the system.
 *
 * Each seat is assigned to a specific trip (via `tripId`) and may include its
 * position information (row, column, floor). The seat’s availability indicates
 * whether it can currently be booked.
 *
 * @interface SeatAttributes
 * @property {number} id - Primary key of the seat.
 * @property {string} number - Unique seat number (e.g., "A1", "B2").
 * @property {number | null} [row] - Row index for layout positioning.
 * @property {number | null} [column] - Column index for layout positioning.
 * @property {number | null} [floor] - Floor level (for multi-floor buses).
 * @property {boolean} [isAvailable] - Indicates if the seat is currently available.
 * @property {boolean} [isActive] - Indicates if the seat is active/enabled (not damaged/disabled).
 * @property {number | null} [tripId] - Foreign key referencing the associated Trip.
 * @property {Date} [createdAt] - Timestamp when the seat record was created.
 * @property {Date} [updatedAt] - Timestamp when the seat record was last updated.
 */
export interface SeatAttributes {
	id: number;
	number: string;
	row?: number | null;
	column?: number | null;
	floor?: number | null;
	isAvailable?: boolean;
	isActive?: boolean;
	tripId?: number | null;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Attributes used for creating a new Seat record.
 * Fields like `id`, `row`, `column`, `floor`, `isAvailable`, `isActive`, and timestamps are optional during creation.
 */
interface SeatCreationAttributes
	extends Optional<
		SeatAttributes,
		| "id"
		| "row"
		| "column"
		| "floor"
		| "isAvailable"
		| "isActive"
		| "tripId"
		| "createdAt"
		| "updatedAt"
	> {}

/**
 * Sequelize model representing a Seat entity.
 *
 * @class Seat
 * @extends Model
 * @implements {SeatAttributes}
 */
export class Seat
	extends Model<SeatAttributes, SeatCreationAttributes>
	implements SeatAttributes
{
	public id!: number;
	public number!: string;
	public row?: number | null;
	public column?: number | null;
	public floor?: number | null;
	public isAvailable?: boolean;
	public isActive?: boolean;
	public tripId?: number | null;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	// Association properties
	public trip?: Trip;

	/**
	 * Initializes the Seat model schema in Sequelize.
	 *
	 * @param {Sequelize} sequelize - Sequelize instance.
	 */
	static initModel(sequelize: Sequelize) {
		Seat.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
					autoIncrement: true,
				},
				number: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				row: {
					type: DataTypes.INTEGER,
					allowNull: true,
				},
				column: {
					type: DataTypes.INTEGER,
					allowNull: true,
				},
				floor: {
					type: DataTypes.INTEGER,
					allowNull: true,
				},
				isAvailable: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: true,
				},
				isActive: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: true,
				},
				tripId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: true,
				},
			},
			{
				sequelize,
				tableName: "seats",
				timestamps: true,
			}
		);
	}
}
