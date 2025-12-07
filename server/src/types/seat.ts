/**
 * Represents the current status of a single seat.
 */
export enum SeatStatus {
    /** Seat is available for booking */
    AVAILABLE = "AVAILABLE",

    /** Seat is temporarily reserved (e.g., payment in progress) */
    RESERVED = "RESERVED",

    /** Seat is confirmed and paid for */
    BOOKED = "BOOKED",

    /** Seat is temporarily unavailable (e.g., under maintenance, damaged) */
    MAINTENANCE = "MAINTENANCE",

    /** Seat is permanently disabled and not for sale */
    DISABLED = "DISABLED",
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
