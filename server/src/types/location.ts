/**
 * Data Transfer Object for creating a new Location.
 *
 * Used when receiving data from clients (e.g., API POST requests)
 * to create a new location record in the system.
 *
 * @interface CreateLocationDTO
 * @property {string} name - The name of the location (required)
 * @property {string | null} [address] - The physical address of the location
 * @property {number | null} [latitude] - The latitude coordinate of the location
 * @property {number | null} [longitude] - The longitude coordinate of the location
 */
export interface CreateLocationDTO {
	name: string;
	address?: string | null;
	latitude?: number | null;
	longitude?: number | null;
}

/**
 * Data Transfer Object for updating an existing Location.
 *
 * Used for PUT/PATCH requests where only specific fields may be modified.
 * The `id` is required to identify which location to update.
 *
 * @interface UpdateLocationDTO
 * @property {number} id - Unique identifier of the location to update
 * @property {string} [name] - Updated name of the location
 * @property {string | null} [address] - Updated physical address of the location
 * @property {number | null} [latitude] - Updated latitude coordinate of the location
 * @property {number | null} [longitude] - Updated longitude coordinate of the location
 */
export interface UpdateLocationDTO {
	id: number;
	name?: string;
	address?: string | null;
	latitude?: number | null;
	longitude?: number | null;
}