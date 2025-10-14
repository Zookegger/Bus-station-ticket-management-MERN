/**
 * Data Transfer Object for updating an existing Seat.
 *
 * Used for PUT/PATCH requests to modify seat state or assignment.
 * Only allows updating availability, active status, and trip assignment.
 *
 * @interface UpdateSeatDTO
 * @property {number} id - ID of the seat to update.
 * @property {boolean} [isAvailable] - Updated availability status.
 * @property {boolean} [isActive] - Updated active status (for damaged/disabled seats).
 * @property {number | null} [tripId] - Updated trip assignment.
 */
export interface UpdateSeatDTO {
	id: number;
	isAvailable?: boolean;
	isActive?: boolean;
	tripId?: number | null;
}

/**
 * Query parameters for filtering seats.
 *
 * Used for GET requests to retrieve seats by various criteria.
 *
 * @interface SeatFilterDTO
 * @property {number} [tripId] - Filter by trip ID.
 * @property {number} [vehicleId] - Filter by vehicle ID (requires joining with Trip).
 * @property {boolean} [isAvailable] - Filter by availability status.
 * @property {boolean} [isActive] - Filter by active status.
 */
export interface SeatFilterDTO {
	tripId?: number;
	vehicleId?: number;
	isAvailable?: boolean;
	isActive?: boolean;
}