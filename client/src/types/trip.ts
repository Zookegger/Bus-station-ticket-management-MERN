/**
 * Enum for the status of a trip.
 * @enum {string}
 * @property {string} SCHEDULED - The trip is scheduled but not yet started.
 * @property {string} ONGOING - The trip is currently in progress.
 * @property {string} COMPLETED - The trip has been completed.
 * @property {string} CANCELLED - The trip has been cancelled.
 * @property {string} DELAYED - The trip is delayed.
 */
export type TripStatus = {
	/**
	 * The trip is being created or drafted.
	 * It is not yet visible to the public or open for booking.
	 * This is typically the default state.
	 */
	PENDING: "PENDING",

	/**
	 * The trip is published, visible to users, and open for booking.
	 * This is the main "active" state for a trip.
	 */
	SCHEDULED: "SCHEDULED",

	/**
	 * The trip has already started and is currently in progress.
	 * Bookings should be closed at this point.
	 */
	DEPARTED: "DEPARTED",

	/**
	 * The trip has finished successfully.
	 * This is a final state, useful for historical records and reviews.
	 */
	COMPLETED: "COMPLETED",

	/**
	 * The trip has been cancelled before or during its run.
	 * This state should trigger notifications and refunds for any
	 * passengers who had booked seats.
	 */
	CANCELLED: "CANCELLED",

	/**
	 * The trip is delayed.
	 * This indicates that the trip is scheduled but has been postponed.
	 */
	DELAYED: "DELAYED",
}

export type TripRepeatFrequency = {
	NONE: "NONE",
	DAILY: "DAILY",
	WEEKLY: "WEEKLY",
	WEEKDAY: "WEEKDAY",
	MONTHLY: "MONTHLY",
	YEARLY: "YEARLY",
};

/**
 * Enum for trip assignment mode.
 * @enum {string}
 * @property {string} AUTO - Driver was automatically assigned by the system.
 * @property {string} MANUAL - Driver was manually assigned by an admin/user.
 */
export type AssignmentMode = {
	/** Driver was automatically assigned by the system. */
    AUTO: "AUTO",
	/** Driver was manually assigned by an admin/user. */
    MANUAL: "MANUAL"
};

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
 * @property {number} price - Price of the trip.
 * @property {TripStatus} status - Status of the trip.
 * @property {boolean} [isTemplate] - Flag indicating whether the trip should be treated as a template.
 * @property {TripRepeatFrequency} [repeatFrequency] - Frequency for generating future trips.
 * @property {Date} [repeatEndDate] - The last date on which this template should generate trips.
 */
export interface CreateTripDTO {
	vehicleId: number;
	routeId: number;
	startTime: Date;
	endTime?: Date | null;
	price: number;
	status: TripStatus;
	isTemplate?: boolean;
	repeatFrequency?: TripRepeatFrequency;
	repeatEndDate?: Date;
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
 * @property {boolean} [isTemplate] - Updated template flag.
 * @property {TripRepeatFrequency} [repeatFrequency] - Updated repeat frequency.
 * @property {Date} [repeatEndDate] - Updated repeat end date.
 */
export interface UpdateTripDTO {
	id: number;
	vehicleId?: number;
	routeId?: number;
	startTime?: Date;
	endTime?: Date | null;
	price?: number | null;
	status?: "Scheduled" | "Departed" | "Completed" | "Cancelled";
	isTemplate?: boolean;
	repeatFrequency?: TripRepeatFrequency;
	repeatEndDate?: Date;
}
