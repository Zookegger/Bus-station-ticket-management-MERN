/**
 * Enum describing the lifecycle status of a Trip.
 *
 * These values are used across the system to represent the current state
 * of a trip and to drive business logic (visibility, booking rules, refunds, etc.).
 *
 * @enum {string}
 * @property {string} PENDING - Trip created but not yet published or open for booking.
 * @property {string} SCHEDULED - Trip is published and available for booking.
 * @property {string} DEPARTED - Trip has started and is in progress.
 * @property {string} COMPLETED - Trip finished successfully (archival/historical state).
 * @property {string} CANCELLED - Trip was cancelled; should trigger notifications/refunds.
 * @property {string} DELAYED - Trip has been postponed/delayed (scheduling change).
 */
export enum TripStatus {
	/** Trip created but not yet visible to users. */
	PENDING = "PENDING",

	/** Trip is published and open for bookings. */
	SCHEDULED = "SCHEDULED",

	/** Trip is underway / in progress. */
	DEPARTED = "DEPARTED",

	/** Trip finished successfully. */
	COMPLETED = "COMPLETED",

	/** Trip was cancelled (pre- or mid-run). */
	CANCELLED = "CANCELLED",

	/** Trip has been delayed/postponed. */
	DELAYED = "DELAYED",
}

/**
 * Enum for repeat frequencies used by trip templates.
 *
 * These values indicate how/if a template trip should generate recurring instances.
 *
 * @enum {string}
 */
export enum TripRepeatFrequency {
	NONE = "NONE",
	DAILY = "DAILY",
	WEEKLY = "WEEKLY",
	WEEKDAY = "WEEKDAY",
	MONTHLY = "MONTHLY",
	YEARLY = "YEARLY",
}

/**
 * Enum for assignment mode used to record how a driver was attached to a trip.
 *
 * @enum {string}
 */
export enum AssignmentMode {
	/** Driver was automatically assigned by the system (algorithm/queue). */
	AUTO = "AUTO",
	/** Driver was manually assigned by an admin or user action. */
	MANUAL = "MANUAL",
}

/**
 * Data Transfer Object for creating a new Trip.
 *
 * This DTO represents the payload expected from clients when creating trips.
 * Fields marked optional may be omitted by clients; the server will apply defaults.
 *
 * @interface CreateTripDTO
 * @property {number} vehicleId - ID of the vehicle assigned to the trip.
 * @property {number} routeId - ID of the route for the trip.
 * @property {Date} startTime - Scheduled start time of the trip (Date or ISO string).
 * @property {Date} [returnStartTime] - Scheduled return start time (for round trips).
 * @property {boolean} [isRoundTrip] - Whether the trip should create a return trip.
 * @property {number} price - Computed price for the trip (server may override).
 * @property {TripStatus} status - Initial status for the trip.
 * @property {boolean} [isTemplate] - Flag indicating whether the trip is a template.
 * @property {TripRepeatFrequency} [repeatFrequency] - Frequency used when the trip is a template.
 * @property {Date} [repeatEndDate] - Last date for generating instances from a template.
 */
export interface CreateTripDTO {
	vehicleId: number;
	routeId: number;
	startTime: Date;
	returnStartTime?: Date;
	isRoundTrip?: boolean;
	price: number;
	status: TripStatus;
	isTemplate?: boolean;
	repeatFrequency?: TripRepeatFrequency;
	repeatEndDate?: Date;
}

/**
 * Data Transfer Object for updating an existing Trip.
 *
 * Used for partial updates (PATCH/PUT). Only provided fields will be applied.
 *
 * @interface UpdateTripDTO
 * @property {number} id - ID of the trip to update.
 * @property {number} [vehicleId] - Updated vehicle ID.
 * @property {number} [routeId] - Updated route ID.
 * @property {Date} [startTime] - Updated start time.
 * @property {Date} [returnStartTime] - Updated return start time.
 * @property {number|null} [price] - Updated price (set to null to clear).
 * @property {TripStatus|string} [status] - Updated status (use `TripStatus` enum when possible).
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