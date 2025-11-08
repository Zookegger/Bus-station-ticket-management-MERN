import type { ApiTripDTO } from "@my-types/TripDTOs";

/**
 * Client-side type definitions for Seats.
 * Based on server/src/types/seat.ts
 */

export type SeatStatus = "available" | "reserved" | "booked" | "maintenance" | "disabled";

/**
 * Represents a single seat on the client-side.
 */
export interface Seat {
	id: number;
	vehicleId: number;
	number: string;
	status: SeatStatus;
	reservedUntil: string | null; // ISO Date string
	reservedBy: string | null;
	tripId: number | null;
	createdAt: string; // ISO Date string
	updatedAt: string; // ISO Date string
	trip?: ApiTripDTO;
}

/**
 * DTO for updating an existing Seat.
 */
export interface UpdateSeatDTO {
	status?: SeatStatus;
	tripId?: number | null;
}

/**
 * Query parameters for filtering seats.
 */
export interface SeatFilterDTO {
	tripId?: number;
	vehicleId?: number;
	status?: SeatStatus;
}
