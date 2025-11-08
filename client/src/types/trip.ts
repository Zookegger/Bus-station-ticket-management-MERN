/**
 * Client-side type definitions for Trips.
 * Based on server/src/types/trip.ts
 */

export type TripStatus = "PENDING" | "SCHEDULED" | "DEPARTED" | "COMPLETED" | "CANCELLED" | "DELAYED";

export type TripRepeatFrequency = "NONE" | "DAILY" | "WEEKLY" | "WEEKDAY" | "MONTHLY" | "YEARLY";

export type AssignmentMode = "AUTO" | "MANUAL";

/**
 * DTO for creating a new Trip.
 */
export interface CreateTripDTO {
	vehicleId: number;
	routeId: number;
	startTime: string; // ISO Date string
	endTime?: string | null; // ISO Date string
	price: number;
	status: TripStatus;
	isTemplate?: boolean;
	repeatFrequency?: TripRepeatFrequency;
	repeatEndDate?: string; // ISO Date string
}

/**
 * DTO for updating an existing Trip.
 */
export interface UpdateTripDTO {
	vehicleId?: number;
	routeId?: number;
	startTime?: string; // ISO Date string
	endTime?: string | null; // ISO Date string
	price?: number | null;
	status?: "Scheduled" | "Departed" | "Completed" | "Cancelled";
	isTemplate?: boolean;
	repeatFrequency?: TripRepeatFrequency;
	repeatEndDate?: string; // ISO Date string
}
