/**
 * Client-side type definitions for Routes.
 * Based on server/src/types/route.ts
 */

import type { Location } from '@my-types/location';

/**
 * Represents a route on the client-side.
 */
export interface Route {
    id: number;
    startId: number;
    destinationId: number;
    distance?: number | null;
    duration?: number | null;
    price?: number | null;
    createdAt: string; // ISO Date string
    updatedAt: string; // ISO Date string
    startLocation?: Location;
    destination?: Location;
}

/**
 * DTO for creating a new Route.
 */
export interface CreateRouteDTO {
	startId: number;
	destinationId: number;
	distance?: number | null;
	duration?: number | null;
	price?: number | null;
}

/**
 * DTO for updating an existing Route.
 */
export interface UpdateRouteDTO {
	startId?: number;
	destinationId?: number;
	distance?: number | null;
	duration?: number | null;
	price?: number | null;
}
