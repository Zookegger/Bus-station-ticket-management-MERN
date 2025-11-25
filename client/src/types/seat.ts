import type { ApiTripDTO } from "@my-types/TripDTOs";

/**
 * Client-side type definitions for Seats.
 * Based on server/src/types/seat.ts
 */

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
	vehicleId: number;
	number: string;
	status: SeatStatus;
	reservedUntil: Date | string | null; // Date on server, ISO string on client
	reservedBy: string | null;
	tripId: number | null;
	createdAt: Date | string; // Date on server, ISO string on client
	updatedAt: Date | string; // Date on server, ISO string on client
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

/** Model attribute interfaces for Seat */
export interface SeatAttributes {
	id: number;
	vehicleId: number;
	number: string;
	status: SeatStatus;
	reservedUntil?: Date | null;
	reservedBy?: string | null;
	tripId?: number | null;
	createdAt?: Date;
	updatedAt?: Date;
}

export type SeatCreationAttributes = Omit<Partial<SeatAttributes>, "id"> &
	Partial<Pick<SeatAttributes, "id">>;
