/**
 * Client-side type definitions for Routes.
 * Based on server/src/types/route.ts
 */

import type { Location } from "@my-types/location";

/**
 * Represents a route on the client-side.
 */

export interface RouteStop {
	id: number;
	routeId: number;
	locationId: number;
	stopOrder: number;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface Route {
	id: number;
    name: string;
	stops: RouteStop;
	distance?: number | null;
	duration?: number | null;
	price?: number | null;
	createdAt: string; // ISO Date string
	updatedAt: string; // ISO Date string
}

/**
 * Data Transfer Object for creating a new Route.
 *
 * Used when receiving data from clients (e.g., API POST requests)
 * to create a new route record.
 *
 * @interface CreateRouteDTO
 * @property {Location[]} stops - ID of the destination location.
 * @property {number | null} [distance] - Distance of the route in kilometers.
 * @property {number | null} [duration] - Duration of the route in hours.
 * @property {number | null} [price] - Price of the route.
 */
export interface CreateRouteDTO {
    name: string;
	stops: Location[];
	distance?: number | null;
	duration?: number | null;
	price?: number | null;
}

/**
 * Data Transfer Object for updating an existing Route.
 *
 * Used for PUT/PATCH requests where only specific fields may be modified.
 * All fields are optional.
 *
 * @interface UpdateRouteDTO
 * @property {number[]} [stops] - An ordered array of location IDs to replace the existing stops.
 * @property {number | null} [distance] - Updated distance.
 * @property {number | null} [duration] - Updated duration.
 * @property {number | null} [price] - Updated price.
 */
export interface UpdateRouteDTO {
    name?: string;
	stops?: Location[];
	distance?: number | null;
	duration?: number | null;
	price?: number | null;
}
