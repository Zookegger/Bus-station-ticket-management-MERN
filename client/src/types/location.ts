/**
 * Client-side type definitions for Locations.
 * Based on server/src/types/location.ts
 */

/**
 * Represents a location on the client-side.
 */
export interface Location {
	id: number;
	name: string;
	address: string;
	latitude: number;
	longitude: number;
	createdAt: string; // ISO Date string
	updatedAt: string; // ISO Date string
}

/**
 * DTO for creating a new Location.
 */
export interface CreateLocationDTO {
	name: string;
	address: string;
	latitude: number;
	longitude: number;
}

/**
 * DTO for updating an existing Location.
 */
export interface UpdateLocationDTO {
	name?: string;
	address?: string | null;
	latitude?: number | null;
	longitude?: number | null;
}