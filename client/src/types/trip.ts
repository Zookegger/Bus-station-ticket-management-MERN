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

export type TripStatus = typeof TripStatus[keyof typeof TripStatus];

export const TripRepeatFrequency = {
	NONE: "NONE",
	DAILY: "DAILY",
	WEEKLY: "WEEKLY",
	WEEKDAY: "WEEKDAY",
	MONTHLY: "MONTHLY",
	YEARLY: "YEARLY",
} as const;

export type TripRepeatFrequency = typeof TripRepeatFrequency[keyof typeof TripRepeatFrequency];

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

export type AssignmentMode = typeof AssignmentMode[keyof typeof AssignmentMode];

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
	endTime?: Date | null;
	price?: number | null;
	status?: TripStatus;
	isTemplate?: boolean;
	repeatFrequency?: TripRepeatFrequency;
	repeatEndDate?: Date;
}

/**
 * Model attribute interfaces for Trip (matches server TripAttributes)
 */
export interface TripAttributes {
	id: number;
	routeId: number;
	vehicleId: number;
	route?: Route | null;
	vehicle?: Vehicle | null;
	startTime: Date;
	endTime?: Date | null;
	price: number;
	status?: TripStatus;
	isTemplate: boolean;
	repeatFrequency?: TripRepeatFrequency | null;
	repeatEndDate?: Date | null;
	templateTripId?: number | null;
	createdAt?: Date;
	updatedAt?: Date;
}

export type TripCreationAttributes = Omit<Partial<TripAttributes>, 'id'> & Partial<Pick<TripAttributes, 'id'>>;
