/**
 * Client-side type definitions for Seats.
 * Based on server/src/types/seat.ts
 */

import type { Trip } from "./trip";

export const SeatStatus = {
	/** Seat is available for booking */
	AVAILABLE: "AVAILABLE",

	/** Seat is temporarily reserved (e.g., payment in progress) */
	RESERVED: "RESERVED",

	/** Seat is confirmed and paid for */
	BOOKED: "BOOKED",

	/** Seat is temporarily unavailable (e.g., under maintenance, damaged) */
	MAINTENANCE: "MAINTENANCE",

	/** Seat is permanently disabled and not for sale */
	DISABLED: "DISABLED",
} as const;

export type SeatStatus = (typeof SeatStatus)[keyof typeof SeatStatus];

/**
 * Represents a single seat on the client-side.
 */
export interface Seat {
	id: number;
	number: string;
	row?: number | null;
	column?: number | null;
	floor?: number | null;
	status: SeatStatus;
	reservedBy?: string | null;
	reservedUntil?: Date | null;
	tripId: number | null;
	trip: Trip;
	createdAt?: Date | string;
	updatedAt?: Date | string;
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
