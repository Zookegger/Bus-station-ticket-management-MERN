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
	createdAt: Date | string; // Date on server, ISO string on client
	updatedAt: Date | string; // Date on server, ISO string on client
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

/**
 * Model attribute interfaces (align with server model attributes)
 */
export interface LocationAttributes {
	id: number;
	name: string;
	address?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	createdAt?: Date;
	updatedAt?: Date;
}

export type LocationCreationAttributes = Omit<Partial<LocationAttributes>, 'id'> & Partial<Pick<LocationAttributes, 'id'>>;