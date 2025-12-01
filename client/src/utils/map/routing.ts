import { reverseGeocode, type GeocodingResult } from "./geocoding";

const OSRM_URL = "https://router.project-osrm.org/route/v1/driving/";
const ORS_API_KEY = import.meta.env.VITE_OPENROUTESERVICE_API_KEY;
const ORS_BASE = "https://api.openrouteservice.org/v2/directions";
const DEFAULT_PROFILE = "driving-hgv";

// --- Interfaces ---

export interface ORSRouteResponse {
	type: "FeatureCollection";
	features: Array<{
		type: "Feature";
		geometry: { type: string; coordinates: [number, number][] };
		properties: {
			segments: { distance: number; duration: number }[];
			summary: { distance: number; duration: number };
			way_points: number[];
		};
	}>;
	bbox?: number[];
}

export interface RouteMetricsNormalized {
	distanceMeters: number;
	durationSeconds: number;
}

export interface StopMetric {
	durationFromStart: number; // minutes
	distanceFromStart: number; // km
}

export interface RoutingInputPoint {
	latitude?: number | string;
	longitude?: number | string;
	lat?: number;
	lon?: number;
}

// Legacy Interfaces (Restored for compatibility)
export interface RouteData {
	geometry: {
		coordinates: [number, number][];
	};
	distance: number;
	duration: number;
}

export interface RouteWithLocations {
	route: RouteData;
	startLocation: GeocodingResult | null;
	endLocation: GeocodingResult | null;
}

// --- Functions ---

/** Build ordered coordinate list in ORS expected format [lon, lat]. */
function buildORSCoordinates(stops: RoutingInputPoint[]): [number, number][] {
	return stops
		.map((s) => {
			const lat =
				typeof s.latitude !== "undefined" ? Number(s.latitude) : s.lat;
			const lon =
				typeof s.longitude !== "undefined"
					? Number(s.longitude)
					: s.lon;
			if (lat == null || lon == null || isNaN(lat) || isNaN(lon))
				return null;
			return [lon, lat] as [number, number];
		})
		.filter((c): c is [number, number] => Array.isArray(c));
}

export async function fetchRoutePolyline(
	stops: RoutingInputPoint[],
	options: { profile?: string; elevation?: boolean } = {}
): Promise<ORSRouteResponse | null> {
	if (!stops || stops.length < 2) return null;

	const coordinates = buildORSCoordinates(stops);
	if (coordinates.length < 2) return null;

	const profile = options.profile || DEFAULT_PROFILE;
	const url = `${ORS_BASE}/${profile}/geojson`;

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				Accept: "application/json, application/geo+json",
				"Content-Type": "application/json; charset=utf-8",
				Authorization: ORS_API_KEY,
			},
			body: JSON.stringify({
				coordinates,
				elevation: options.elevation ?? false,
			}),
		});

		if (!response.ok)
			throw new Error(`OpenRouteService error (${response.status})`);
		return (await response.json()) as ORSRouteResponse;
	} catch (error) {
		console.warn("Primary routing failed, switching to fallback...", error);

		// OSRM Fallback
		const coordString = coordinates.map((c) => `${c[0]},${c[1]}`).join(";");
		try {
			const osrmUrl = `${OSRM_URL}${coordString}?overview=full&geometries=geojson`;
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
								segments: [],
								summary: {
									distance: route.distance,
									duration: route.duration,
								},
								way_points: [],
							},
						},
					],
				};
			}
		} catch (fallbackErr) {
			console.error("OSRM fallback failed:", fallbackErr);
		}
		return null;
	}
}

export function extractRouteMetrics(
	route: ORSRouteResponse | null
): RouteMetricsNormalized | null {
	if (!route?.features?.length) return null;
	const props = route.features[0].properties;
	if (props?.summary) {
		return {
			distanceMeters: props.summary.distance,
			durationSeconds: props.summary.duration,
		};
	}
	return null;
}

export function extractStopMetrics(
	route: ORSRouteResponse | null
): StopMetric[] {
	if (!route?.features?.length) return [];
	const segments = route.features[0].properties.segments;

	const metrics: StopMetric[] = [];

	// Stop 0 is always 0,0
	metrics.push({ durationFromStart: 0, distanceFromStart: 0 });

	let cumulativeDuration = 0;
	let cumulativeDistance = 0;

	if (segments) {
		for (const segment of segments) {
			cumulativeDuration += segment.duration;
			cumulativeDistance += segment.distance;

			metrics.push({
				durationFromStart: Math.round(cumulativeDuration / 60), // Convert seconds to minutes
				distanceFromStart: parseFloat(
					(cumulativeDistance / 1000).toFixed(2)
				), // Convert meters to km
			});
		}
	}

	return metrics;
}

/**
 * Formats distance for display.
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (meters: number, fixed: number = 1): string => {
	if (meters == null || isNaN(meters)) return "N/A";

	return meters >= 1000
		? `${(meters / 1000).toFixed(fixed)} km`
		: `${Math.round(meters)} m`;
};
/**
 * Formats duration for display.
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
	if (seconds == null || isNaN(seconds)) return "0s";
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
};

// Legacy Helper: fetch simple route between two points
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
		return null;
	}
}

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
			return formatDuration(data.routes[0].duration);
		}
		return "Unavailable";
	} catch {
		return "Unavailable";
	}
}
