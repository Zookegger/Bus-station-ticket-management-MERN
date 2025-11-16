/**
 * Data Transfer Object for creating a new Vehicle Type.
 *
 * Used when receiving data from clients (e.g., API POST requests)
 * to create a new vehicle type record.
 *
 * @interface CreateVehicleTypeDTO
 * @property {string} name - Display name of the vehicle type (e.g., "Luxury Bus").
 * @property {number | null} [price] - Base price or rental fee for this vehicle type.
 * @property {number | null} [totalFloors] - Total number of floors (for multi-level vehicles).
 * @property {number | null} [totalSeats] - Total seat count across all floors.
 * @property {string | null} [seatLayout] - JSON string of seats layout per floor (matrix), e.g., "[[1,1,0],[1,1,1]]".
 */
export interface CreateVehicleTypeDTO {
	name: string;
	price?: number | null;
	totalFloors?: number | null;
	totalSeats?: number | null;
	seatLayout?: string | null;
}

/**
 * Data Transfer Object for updating an existing Vehicle Type.
 *
 * Used for PUT/PATCH requests where only specific fields may be modified.
 * The `id` is required to identify which record to update.
 *
 * @interface UpdateVehicleTypeDTO
 * @property {number} id - ID of the vehicle type to update.
 * @property {string} [name] - New name of the vehicle type (optional).
 * @property {number | null} [price] - Updated base price or rental fee.
 * @property {number | null} [totalFloors] - Updated number of floors.
 * @property {number | null} [totalSeats] - Updated total seat count.
 * @property {string | null} [seatLayout] - Updated JSON string for seat layout per floor.
 */
export interface UpdateVehicleTypeDTO {
	id: number;
	name?: string;
	price?: number | null;
	totalFloors?: number | null;
	totalSeats?: number | null;
	seatLayout?: string | null;
}
