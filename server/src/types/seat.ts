export enum SeatStatus {
	AVAILABLE = "available", // Seat is available for booking
	RESERVED = "reserved", // Seat is temporarily reserved (payment in progress)
	BOOKED = "booked", // Seat is confirmed and paid for
	MAINTENANCE = "maintenance", // Seat is under maintenance/damaged
	DISABLED = "disabled", // Seat is permanently disabled
}

/**
 * Data Transfer Object for updating an existing Seat.
 *
 * Used for PUT/PATCH requests to modify seat state or assignment.
 * Use `status` (SeatStatus) to represent lifecycle instead of boolean flags.
 *
 * @interface UpdateSeatDTO
 * @property {number} id - ID of the seat to update.
 * @property {SeatStatus} [status] - New seat lifecycle status (available, reserved, booked, etc.).
 * @property {number | null} [tripId] - Updated trip assignment.
 */
export interface UpdateSeatDTO {
	id: number;
	status?: SeatStatus;
	tripId?: number | null;
}

/**
 * Query parameters for filtering seats.
 *
 * Used for GET requests to retrieve seats by various criteria.
 * Prefer filtering by `status` (SeatStatus) rather than booleans.
 *
 * @interface SeatFilterDTO
 * @property {number} [tripId] - Filter by trip ID.
 * @property {number} [vehicleId] - Filter by vehicle ID (requires joining with Trip).
 * @property {SeatStatus} [status] - Filter by seat lifecycle status.
 */
export interface SeatFilterDTO {
	tripId?: number;
	vehicleId?: number;
	status?: SeatStatus;
}
