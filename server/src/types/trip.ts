/**
 * Data Transfer Object for creating a new Trip.
 *
 * Used when receiving data from clients (e.g., API POST requests)
 * to create a new trip record.
 *
 * @interface CreateTripDTO
 * @property {number} vehicleId - ID of the vehicle assigned to the trip.
 * @property {number} routeId - ID of the route for the trip.
 * @property {Date | string} startTime - Scheduled start time of the trip.
 * @property {Date | string | null} [endTime] - Scheduled or actual end time of the trip.
 * @property {number | null} [price] - Price of the trip.
 * @property {'Scheduled' | 'Departed' | 'Completed' | 'Cancelled'} [status] - Status of the trip.
 */
export interface CreateTripDTO {
	vehicleId: number;
	routeId: number;
	startTime: Date | string;
	endTime?: Date | string | null;
	price?: number | null;
	status?: "Scheduled" | "Departed" | "Completed" | "Cancelled";
}

/**
 * Data Transfer Object for updating an existing Trip.
 *
 * Used for PUT/PATCH requests where only specific fields may be modified.
 * The `id` is required to identify which record to update.
 *
 * @interface UpdateTripDTO
 * @property {number} id - ID of the trip to update.
 * @property {number} [vehicleId] - Updated vehicle ID.
 * @property {number} [routeId] - Updated route ID.
 * @property {Date | string} [startTime] - Updated start time.
 * @property {Date | string | null} [endTime] - Updated end time.
 * @property {number | null} [price] - Updated price.
 * @property {'Scheduled' | 'Departed' | 'Completed' | 'Cancelled'} [status] - Updated status.
 */
export interface UpdateTripDTO {
	id: number;
	vehicleId?: number;
	routeId?: number;
	startTime?: Date | string;
	endTime?: Date | string | null;
	price?: number | null;
	status?: "Scheduled" | "Departed" | "Completed" | "Cancelled";
}
