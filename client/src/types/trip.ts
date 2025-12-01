import type { Route } from "./route";
import type { Vehicle } from "./vehicle";

/**
 * Enum for the status of a trip.
 * @enum {string}
 * @property {string} SCHEDULED - The trip is scheduled but not yet started.
 * @property {string} ONGOING - The trip is currently in progress.
 * @property {string} COMPLETED - The trip has been completed.
 * @property {string} CANCELLED - The trip has been cancelled.
 * @property {string} DELAYED - The trip is delayed.
 */
export const TripStatus = {
	/** The trip is being created or drafted. */
	PENDING: "PENDING",
	/** The trip is published, visible to users, and open for booking. */
	SCHEDULED: "SCHEDULED",
	/** The trip has already started and is currently in progress. */
	DEPARTED: "DEPARTED",
	/** The trip has finished successfully. */
	COMPLETED: "COMPLETED",
	/** The trip has been cancelled before or during its run. */
	CANCELLED: "CANCELLED",
	/** The trip is delayed. */
	DELAYED: "DELAYED",
} as const;

export type TripStatus = (typeof TripStatus)[keyof typeof TripStatus];

export const TripRepeatFrequency = {
	NONE: "NONE",
	DAILY: "DAILY",
	WEEKLY: "WEEKLY",
	WEEKDAY: "WEEKDAY",
	MONTHLY: "MONTHLY",
	YEARLY: "YEARLY",
} as const;

export type TripRepeatFrequency =
	(typeof TripRepeatFrequency)[keyof typeof TripRepeatFrequency];

/**
 * Enum for trip assignment mode.
 * @enum {string}
 * @property {string} AUTO - Driver was automatically assigned by the system.
 * @property {string} MANUAL - Driver was manually assigned by an admin/user.
 */
export const AssignmentMode = {
	/** Driver was automatically assigned by the system. */
	AUTO: "AUTO",
	/** Driver was manually assigned by an admin/user. */
	MANUAL: "MANUAL",
} as const;

export type AssignmentMode =
	(typeof AssignmentMode)[keyof typeof AssignmentMode];

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
	price?: number;
	status: TripStatus;
	isTemplate?: boolean;
	repeatFrequency?: TripRepeatFrequency;
	repeatEndDate?: Date;
	/** When creating a round-trip, set to true to instruct the server to create a return trip */
	isRoundTrip?: boolean;
	/** Return trip start time (required when `isRoundTrip` is true) */
	returnStartTime?: Date;
	/** Optional return trip end time */
	returnEndTime?: Date | null;
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
	returnStartTime?: Date | null;
	price?: number | null;
	status?: TripStatus;
	isTemplate?: boolean;
	repeatFrequency?: TripRepeatFrequency;
	repeatEndDate?: Date | null;
	isRoundTrip?: boolean;
}

/**
 * Model attribute interfaces for Trip (matches server TripAttributes)
 */
/**
 * Interface for the attributes of a Trip.
 * @interface Trip
 * @property {number} id - The unique identifier for the trip.
 * @property {number} routeId - The ID of the route for this trip.
 * @property {number} vehicleId - The ID of the vehicle for this trip.
 * @property {Date} startTime - The departure time of the trip.
 * @property {Date} [returnStartTime] - The start time of the return trip (if round trip).
 * @property {TripStatus} status - The current status of the trip.
 * @property {number} basePrice - The base price for the trip.
 * @property {Date} [createdAt] - The date and time the trip was created.
 * @property {Date} [updatedAt] - The date and time the trip was last updated.
 */
export interface Trip {
	/**The unique identifier for the trip. */
	id: number;
	/**The ID of the route for this trip. */
	routeId: number;

	route: Route | null;
	/**The ID of the vehicle for this trip. */
	vehicleId: number;

	vehicle: Vehicle | null;
	/**The departure time of the trip. */
	startTime: Date;
	/**The arrival time of the trip (virtual field for sub-trips). */
	arrivalTime?: string | Date;
	/**The start time of the return trip (if round trip). */
	returnStartTime?: Date | null;
	/**The ticket price assigned to this trip. */
	price: number;
	/**The current status of the trip. */
	status?: TripStatus;
	/**Is this trip a template for repetition? */
	isTemplate: boolean;
	/** If the trip is a round trip */
	isRoundTrip?: boolean;
	/**How often should this trip repeat? */
	repeatFrequency?: TripRepeatFrequency | null;
	/**The date on which this repetition schedule should end. */
	repeatEndDate?: Date | null;
	/**If this trip is an instance, this links to its template. */
	templateTripId?: number | null;
	/**If this trip is a round trip, this links to the return trip. */
	returnTripId?: number | null;
	/**If this trip is an instance of a round trip, this links to the outbound trip. */
	outboundTripId?: number | null;
	/**The date and time the trip was created. */
	createdAt?: Date;
	/**The date and time the trip was last updated. */
	updatedAt?: Date;
}

export interface TripResponse {
	rows: Trip[];
	count: number;
}
