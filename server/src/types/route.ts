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
	createdAt?: Date;
	updatedAt?: Date;
}

export interface RouteStopPayload extends Location {
	durationFromStart?: number;
	distanceFromStart?: number;
}

/**
 * Data Transfer Object for creating a new Route.
 *
 * Used when receiving data from clients (e.g., API POST requests)
 * to create a new route record.
 *
 * @interface CreateRouteDTO
 * @property {string} name - Name of the route.
 * @property {RouteStopPayload[]} stops - Locations for the route stops.
 * @property {number | null} [distance] - Distance of the route in kilometers.
 * @property {number | null} [duration] - Duration of the route in hours.
 * @property {number | null} [price] - Price of the route.
 */
export interface CreateRouteDTO {
	name: string;
	stops: RouteStopPayload[];
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
 * @property {string} [name] - Name of the route.
 * @property {RouteStopPayload[]} [stops] - An ordered array of locations to replace the existing stops.
 * @property {number | null} [distance] - Updated distance.
 * @property {number | null} [duration] - Updated duration.
 * @property {number | null} [price] - Updated price.
 */
export interface UpdateRouteDTO {
	name?: string;
	stops?: RouteStopPayload[];
	distance?: number | null;
	duration?: number | null;
	price?: number | null;
}
