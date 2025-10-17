import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import { Trip } from "./trip";
import { SeatStatus } from "@my_types/seat";

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
 * @property {SeatStatus} [status] - Lifecycle status for the seat (available, reserved, booked, etc.).
 * @property {string | null} [reservedBy] - Identifier of the user who reserved the seat (if reserved).
 * @property {Date | null} [reservedUntil] - Timestamp indicating when a reservation expires.
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
	status?: SeatStatus;
	reservedBy?: string | null;
	reservedUntil?: Date | null;
	tripId?: number | null;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Attributes required for creating a new Seat.
 * Some fields are optional because they are generated automatically
 * or can be added later (e.g., id, timestamps).
 *
 * @interface SeatCreationAttributes
 */
export interface SeatCreationAttributes
	extends Optional<
		SeatAttributes,
		| "id"
		| "row"
		| "column"
		| "floor"
		| "status"
		| "reservedBy"
		| "reservedUntil"
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
 * @property {number} id - Primary key of the seat.
 * @property {string} number - Unique seat number (e.g., "A1", "B2").
 * @property {number | null} [row] - Row index for layout positioning.
 * @property {number | null} [column] - Column index for layout positioning.
 * @property {number | null} [floor] - Floor level (for multi-floor buses).
 * @property {boolean} [isAvailable] - Indicates if the seat is currently available for booking.
 * @property {boolean} [isActive] - Indicates if the seat is active/enabled (not damaged/disabled).
 * @property {number | null} [tripId] - Foreign key referencing the associated Trip.
 * @property {Date} createdAt - Timestamp when the seat record was created.
 * @property {Date} updatedAt - Timestamp when the seat record was last updated.
 */
export class Seat
	extends Model<SeatAttributes, SeatCreationAttributes>
	implements SeatAttributes
{
	public id!: number;
	public number!: string; /** Unique seat number (e.g., "A1", "B2") */
	public row?: number | null;
	public column?: number | null;
	public floor?: number | null;
	public status?: SeatStatus;
	public reservedBy?: string | null;
	public reservedUntil?: Date | null;
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
				tripId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: true,
				},
				// New lifecycle/status field
				status: {
					type: DataTypes.ENUM(
						"available",
						"reserved",
						"booked",
						"maintenance",
						"disabled"
					),
					allowNull: false,
					defaultValue: "available",
				},
				reservedBy: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				reservedUntil: {
					type: DataTypes.DATE,
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
