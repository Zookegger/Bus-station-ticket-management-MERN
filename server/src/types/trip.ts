/**
 * Enum for the status of a trip.
 * @enum {string}
 * @property {string} SCHEDULED - The trip is scheduled but not yet started.
 * @property {string} ONGOING - The trip is currently in progress.
 * @property {string} COMPLETED - The trip has been completed.
 * @property {string} CANCELLED - The trip has been cancelled.
 * @property {string} DELAYED - The trip is delayed.
 */
export enum TripStatus {
	/**
	 * The trip is being created or drafted.
	 * It is not yet visible to the public or open for booking.
	 * This is typically the default state.
	 */
	PENDING = "PENDING",

	/**
	 * The trip is published, visible to users, and open for booking.
	 * This is the main "active" state for a trip.
	 */
	SCHEDULED = "SCHEDULED",

	/**
	 * The trip has already started and is currently in progress.
	 * Bookings should be closed at this point.
	 */
	DEPARTED = "DEPARTED",

	/**
	 * The trip has finished successfully.
	 * This is a final state, useful for historical records and reviews.
	 */
	COMPLETED = "COMPLETED",

	/**
	 * The trip has been cancelled before or during its run.
	 * This state should trigger notifications and refunds for any
	 * passengers who had booked seats.
	 */
	CANCELLED = "CANCELLED",

	DELAYED = "DELAYED",
}

/**
 * Data Transfer Object for creating a new Trip.
 *
 * Used when receiving data from clients (e.g., API POST requests)
 * to create a new trip record.
 *
 * @interface CreateTripDTO
 * @property {number} vehicleId - ID of the vehicle assigned to the trip.
 * @property {number} routeId - ID of the route for the trip.
 * @property {Date} startTime - Scheduled start time of the trip.
 * @property {Date | null} [endTime] - Scheduled or actual end time of the trip.
 * @property {number | null} [price] - Price of the trip.
 * @property {'Scheduled' | 'Departed' | 'Completed' | 'Cancelled'} [status] - Status of the trip.
 */
export interface CreateTripDTO {
	vehicleId: number;
	routeId: number;
	startTime: Date;
	endTime?: Date | null;
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
 * @property {Date} [startTime] - Updated start time.
 * @property {Date | null} [endTime] - Updated end time.
 * @property {number | null} [price] - Updated price.
 * @property {'Scheduled' | 'Departed' | 'Completed' | 'Cancelled'} [status] - Updated status.
 */
export interface UpdateTripDTO {
	id: number;
	vehicleId?: number;
	routeId?: number;
	startTime?: Date;
	endTime?: Date | null;
	price?: number | null;
	status?: "Scheduled" | "Departed" | "Completed" | "Cancelled";
}
