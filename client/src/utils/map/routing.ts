/**
 * Routing utilities.
 * - Primary: OpenRouteService for multi-stop heavy vehicle / bus style routing.
 * - Fallback: OSRM for simple start/end when ORS fails.
 */
import type { Location } from "@my-types";
import { reverseGeocode, type GeocodingResult } from "./geocoding";

const OSRM_URL = "https://router.project-osrm.org/route/v1/driving/";
const ORS_API_KEY = import.meta.env.VITE_OPENROUTESERVICE_API_KEY;
const DEFAULT_PROFILE = "driving-hgv"; // bus approximation
const ORS_BASE = "https://api.openrouteservice.org/v2/directions";

// -------------------- ORS TYPE DEFINITIONS --------------------
export interface ORSSegmentSummary {
    distance: number;
    duration: number;
}
export interface ORSFeatureProperties {
    segments: { distance: number; duration: number }[];
    summary: ORSSegmentSummary;
    way_points: number[];
}
export interface ORSGeometry {
    type: string;
    coordinates: [number, number][];
}
export interface ORSFeature {
    type: "Feature";
    geometry: ORSGeometry;
    properties: ORSFeatureProperties;
}
export interface ORSRouteResponse {
    type: "FeatureCollection";
    features: ORSFeature[];
    bbox?: number[];
    metadata?: Record<string, unknown>;
}
export interface RouteMetricsNormalized {
    distanceMeters: number;
    durationSeconds: number;
}
export interface RoutingStop {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lon?: number;
    name?: string;
}

/** Build ordered coordinate list in ORS expected format [lon, lat]. */
function buildORSCoordinates(stops: RoutingStop[]): [number, number][] {
    return stops
        .map((s) => {
            const lat = s.latitude ?? s.lat;
            const lon = s.longitude ?? s.lon;
            if (lat == null || lon == null) return null;
            return [lon, lat] as [number, number];
        })
        .filter((c): c is [number, number] => Array.isArray(c));
}

export interface FetchRouteOptions {
    profile?: string;
    elevation?: boolean;
    preferOSRM?: boolean;
}

/**
 * Fetch route polyline using OpenRouteService, with optional OSRM fallback.
 * @param stops Ordered stops (≥2) containing lat/lon.
 */
export async function fetchRoutePolyline(
    stops: RoutingStop[],
    options: FetchRouteOptions = {}
): Promise<ORSRouteResponse | null> {
    if (!stops || stops.length < 2)
        throw new Error("At least two stops are required to fetch a route.");
    
    const coordinates = buildORSCoordinates(stops);
    if (coordinates.length < 2) return null;
    
    const profile = options.profile || DEFAULT_PROFILE;
    const url = `${ORS_BASE}/${profile}/geojson`;
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
                "Content-Type": "application/json; charset=utf-8",
                Authorization: ORS_API_KEY,
            },
            body: JSON.stringify({
                coordinates,
                elevation: options.elevation ?? false,
            }),
        });
        
        if (!response.ok) {
            let message = `OpenRouteService error (${response.status})`;
            try {
                const errJson = await response.json();
                message = errJson.error?.message || message;
            } catch {
                /* ignore */
            }
            throw new Error(message);
        }
        return (await response.json()) as ORSRouteResponse;
    } catch (error) {
        console.error("fetchRoutePolyline ORS failed:", error);
        
        // OSRM Fallback (Only supports Start -> End, ignores intermediate for simplicity in fallback)
        if (options.preferOSRM) {
            const first = coordinates[0];
            const last = coordinates[coordinates.length - 1];
            try {
                const osrmUrl = `${OSRM_URL}${first[0]},${first[1]};${last[0]},${last[1]}?overview=full&geometries=geojson`;
                const res = await fetch(osrmUrl);
                const data = await res.json();
                
                if (data.routes && data.routes[0]) {
                    const route = data.routes[0];
                    return {
                        type: "FeatureCollection",
                        features: [
                            {
                                type: "Feature",
                                geometry: route.geometry,
                                properties: {
                                    segments: [
                                        {
                                            distance: route.distance,
                                            duration: route.duration,
                                        },
                                    ],
                                    summary: {
                                        distance: route.distance,
                                        duration: route.duration,
                                    },
                                    way_points: [0, coordinates.length - 1],
                                },
                            },
                        ],
                    };
                }
            } catch (fallbackErr) {
                console.error("OSRM fallback failed:", fallbackErr);
            }
        }
        throw error;
    }
}

/** Extract normalized metrics from ORS response. */
export function extractRouteMetrics(
    route: ORSRouteResponse | null
): RouteMetricsNormalized | null {
    if (!route?.features?.length) return null;
    const summary = route.features[0].properties?.summary;
    if (!summary) return null;
    return {
        distanceMeters: summary.distance,
        durationSeconds: summary.duration,
    };
}

/**
 * Fetches a route polyline from OpenRouteService.
 * @param stops An array of Location objects representing the route stops.
 * @returns A GeoJSON object representing the route path and its metrics.
 */
// (Legacy signature preserved for backward compatibility inside older components)
export const fetchRoutePolylineLegacy = async (
    stops: Partial<Location>[]
): Promise<ORSRouteResponse | null> => {
    return fetchRoutePolyline(stops as RoutingStop[], { preferOSRM: true });
};

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

            // Fetch location names for start and end points using updated reverseGeocode
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
export function formatDistance(meters: number, fixed: number = 1): string {
    if (meters > 1000) {
        return `${(meters / 1000).toFixed(fixed)} km`;
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
    const fomatted_seconds = Math.floor((seconds % 3600) / 60 / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
	if (minutes > 0) {

		return `${minutes}m`;
	}
	return `~${fomatted_seconds}s`;
}