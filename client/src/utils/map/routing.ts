/**
 * Routing utilities using OSRM (Open Source Routing Machine).
 * Calculates routes and travel times between two points.
 */

import { reverseGeocode, type GeocodingResult } from "./geocoding";

const OSRM_URL = "https://router.project-osrm.org/route/v1/driving/";

/**
 * Route geometry and metadata from OSRM.
 * @interface RouteData
 */
export interface RouteData {
	geometry: {
		coordinates: [number, number][]; // [lon, lat] pairs
	};
	distance: number; // meters
	duration: number; // seconds
}

/**
 * Complete route information including start/end locations.
 * @interface RouteWithLocations
 */
export interface RouteWithLocations {
	route: RouteData;
	startLocation: GeocodingResult | null;
	endLocation: GeocodingResult | null;
}

/**
 * Fetches route between two coordinates from OSRM API.
 *
 * @param {number} startLat - Start latitude
 * @param {number} startLon - Start longitude
 * @param {number} endLat - End latitude
 * @param {number} endLon - End longitude
 * @returns {Promise<RouteWithLocations | null>} Route data with location details
 */
export async function getRoute(
	startLat: number,
	startLon: number,
	endLat: number,
	endLon: number
): Promise<RouteWithLocations | null> {
	try {
		const routeUrl = `${OSRM_URL}${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson&steps=true`;

		const response = await fetch(routeUrl);
		const data = await response.json();

		if (data.routes && data.routes[0]) {
			const route = data.routes[0];

			// Fetch location names for start and end points
			const [startLocation, endLocation] = await Promise.all([
				reverseGeocode(startLat, startLon),
				reverseGeocode(endLat, endLon),
			]);

			return {
				route: {
					geometry: route.geometry,
					distance: route.distance,
					duration: route.duration,
				},
				startLocation,
				endLocation,
			};
		}

		return null;
	} catch (error) {
		console.error("Route calculation error:", error);
		return null;
	}
}

/**
 * Calculates travel time between two coordinates.
 *
 * @param {number} startLat - Start latitude
 * @param {number} startLon - Start longitude
 * @param {number} endLat - End latitude
 * @param {number} endLon - End longitude
 * @returns {Promise<string>} Formatted travel time string
 */
export async function getTravelTime(
	startLat: number,
	startLon: number,
	endLat: number,
	endLon: number
): Promise<string> {
	try {
		const routeUrl = `${OSRM_URL}${startLon},${startLat};${endLon},${endLat}?overview=false&geometries=geojson`;

		const response = await fetch(routeUrl);
		const data = await response.json();

		if (data.routes && data.routes[0]) {
			const duration = data.routes[0].duration; // Duration in seconds
			const hours = Math.floor(duration / 3600);
			const minutes = Math.floor((duration % 3600) / 60);
			return `${hours}h ${minutes}m`;
		}

		return "Unavailable";
	} catch (error) {
		console.error("Travel time calculation error:", error);
		return "Unavailable";
	}
}

/**
 * Formats distance for display.
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(meters: number): string {
	if (meters > 1000) {
		return `${(meters / 1000).toFixed(1)} km`;
	}
	return `${Math.round(meters)} m`;
}

/**
 * Formats duration for display.
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	return `${minutes}m`;
}
