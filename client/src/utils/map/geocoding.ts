/**
 * Geocoding utilities for OpenStreetMap Nominatim API.
 * Provides forward and reverse geocoding with caching support.
 */

const BASE_URL = "https://nominatim.openstreetmap.org/";
const FETCH_HEADERS = {
	"User-Agent": "BusStationApp/1.0 (Compatible; MERN Stack)",
};

/**
 * Location result from geocoding API.
 * @interface GeocodingResult
 */
export interface GeocodingResult {
	lat: number;
	lon: number;
	display_name: string;
	name?: string;
	address?: {
		city?: string;
		state?: string;
		country?: string;
	};
}

/**
 * Fetches data from Nominatim API with error handling.
 * @param {string} url - The API endpoint URL
 * @returns {Promise<any>} JSON response from API
 */
async function fetchFromAPI(url: string): Promise<any> {
	try {
		const response = await fetch(url, { headers: FETCH_HEADERS });
		if (!response.ok) {
			throw new Error(`API request failed: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error("Geocoding API error:", error);
		throw error;
	}
}

/**
 * Performs reverse geocoding - converts coordinates to address.
 * Tries Vietnamese first, falls back to English.
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<GeocodingResult | null>} Location data or null on failure
 */
export async function reverseGeocode(
	lat: number,
	lon: number
): Promise<GeocodingResult | null> {
	if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
		console.error("Invalid latitude or longitude:", lat, lon);
		return null;
	}

	try {
		const vnUrl = `${BASE_URL}reverse?lat=${lat}&lon=${lon}&format=json&accept-language=vi`;
		const enUrl = `${BASE_URL}reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;

		let result = await fetchFromAPI(vnUrl);

		// Fallback to English if Vietnamese not available
		if (!result || !result.display_name) {
			console.warn("Vietnamese not available, falling back to English");
			result = await fetchFromAPI(enUrl);
		}

		if (result) {
			return {
				lat: parseFloat(result.lat),
				lon: parseFloat(result.lon),
				display_name: result.display_name,
				name: result.name,
				address: result.address,
			};
		}

		return null;
	} catch (error) {
		console.error("Reverse geocoding error:", error);
		return null;
	}
}

/**
 * Performs forward geocoding - converts address/location name to coordinates.
 * Tries Vietnamese first, falls back to English.
 *
 * @param {string} location - Location name or address to search
 * @param {number} limit - Maximum number of results (default: 1)
 * @returns {Promise<GeocodingResult[]>} Array of location results
 */
export async function searchLocation(
	location: string,
	limit: number = 1
): Promise<GeocodingResult[]> {
	if (!location || location.trim() === "") {
		console.error("No location provided for search");
		return [];
	}

	try {
		const vnUrl = `${BASE_URL}search?q=${encodeURIComponent(
			location
		)}&format=json&limit=${limit}&accept-language=vi`;
		const enUrl = `${BASE_URL}search?q=${encodeURIComponent(
			location
		)}&format=json&limit=${limit}&accept-language=en`;

		let results = await fetchFromAPI(vnUrl);

		// Fallback to English if Vietnamese not available
		if (!results || results.length === 0 || !results[0].display_name) {
			console.warn("Vietnamese not available, falling back to English");
			results = await fetchFromAPI(enUrl);
		}

		return results.map((result: any) => ({
			lat: parseFloat(result.lat),
			lon: parseFloat(result.lon),
			display_name: result.display_name,
			name: result.name,
			address: result.address,
		}));
	} catch (error) {
		console.error("Location search error:", error);
		return [];
	}
}

/**
 * Cleans display name by removing redundant location name prefix.
 * @param {string} name - The location name
 * @param {string} displayName - Full display name from API
 * @returns {string} Cleaned display name
 */
export function cleanDisplayName(name: string, displayName: string): string {
	if (displayName.startsWith(name)) {
		return displayName.substring(name.length).replace(/^,\s*/, "");
	}
	return displayName;
}
