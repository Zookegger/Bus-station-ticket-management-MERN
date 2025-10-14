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
 * @property {number | null} [totalColumns] - Total number of seat columns per floor.
 * @property {number | null} [totalSeats] - Total seat count across all floors.
 * @property {string | null} [rowsPerFloor] - JSON or serialized layout of seat rows per floor.
 * @property {string | null} [seatsPerFloor] - JSON or serialized layout of seats per floor.
 */
export interface CreateVehicleTypeDTO {
	name: string;
	price?: number | null;
	totalFloors?: number | null;
	totalColumns?: number | null;
	totalSeats?: number | null;
	rowsPerFloor?: string | null;
	seatsPerFloor?: string | null;
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
 * @property {number | null} [totalColumns] - Updated number of columns.
 * @property {number | null} [totalSeats] - Updated total seat count.
 * @property {string | null} [rowsPerFloor] - Updated seat row layout per floor.
 * @property {string | null} [seatsPerFloor] - Updated seat layout per floor.
 */
export interface UpdateVehicleTypeDTO {
	id: number;
	name?: string;
	price?: number | null;
	totalFloors?: number | null;
	totalColumns?: number | null;
	totalSeats?: number | null;
	rowsPerFloor?: string | null;
	seatsPerFloor?: string | null;
}

/**
 * Represents a Vehicle Type entity as returned from the server API.
 * This matches the server's VehicleTypeAttributes interface.
 *
 * @interface VehicleType
 * @property {number} id - Unique identifier of the vehicle type.
 * @property {string} name - Display name of the vehicle type (e.g., "Luxury Bus").
 * @property {number | null} [price] - Base price or rental fee for this vehicle type.
 * @property {number | null} [totalFloors] - Total number of floors (for multi-level vehicles).
 * @property {number | null} [totalColumns] - Total number of seat columns per floor.
 * @property {number | null} [totalSeats] - Total seat count across all floors.
 * @property {string | null} [rowsPerFloor] - JSON or serialized layout of seat rows per floor.
 * @property {string | null} [seatsPerFloor] - JSON or serialized layout of seats per floor.
 * @property {string} [createdAt] - Timestamp when the vehicle type record was created (ISO string).
 * @property {string} [updatedAt] - Timestamp when the vehicle type record was last updated (ISO string).
 */
export interface VehicleType {
	id: number;
	name: string;
	price?: number | null;
	totalFloors?: number | null;
	totalColumns?: number | null;
	totalSeats?: number | null;
	rowsPerFloor?: string | null;
	seatsPerFloor?: string | null;
	createdAt?: string;
	updatedAt?: string;
}