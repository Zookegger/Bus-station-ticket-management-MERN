import { useState, useCallback, useEffect } from "react";
import {
	searchLocation,
	reverseGeocode,
	type GeocodingResult,
	loadWithExpiry,
	saveWithExpiry,
	getSearchCacheKey,
	getReverseCacheKey,
	type LocationSearchOptions,
} from "@utils/map";

/**
 * Custom hook for location geocoding with caching and debouncing.
 * Provides search and reverse geocoding capabilities.
 *
 * @returns {object} Geocoding utilities and state
 */
export const useGeocoding = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Searches for location with caching support.
	 * @param {string} query - Location search query
	 * @returns {Promise<GeocodingResult[]>} Search results
	 */
	const search = useCallback(
		async (query: string, options: LocationSearchOptions = {}): Promise<GeocodingResult[]> => {
			if (!query || query.trim() === "") {
				return [];
			}

			setIsLoading(true);
			setError(null);

			try {
				// Check cache first
				const cacheKey = getSearchCacheKey(query);
				const cached = loadWithExpiry<GeocodingResult[]>(cacheKey);

				if (cached) {
					setIsLoading(false);
					return cached;
				}

				// Fetch from API (now using Photon)
				const results = await searchLocation(query, 5, options);

				// Cache results
				if (results.length > 0) {
					saveWithExpiry(cacheKey, results, 120); // Cache for 2 hours
				}

				setIsLoading(false);
				return results;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Search failed";
				setError(errorMessage);
				setIsLoading(false);
				return [];
			}
		},
		[]
	);

	/**
	 * Performs reverse geocoding with caching.
	 * @param {number} lat - Latitude
	 * @param {number} lon - Longitude
	 * @returns {Promise<GeocodingResult | null>} Location result
	 */
	const reverse = useCallback(
		async (lat: number, lon: number): Promise<GeocodingResult | null> => {
			setIsLoading(true);
			setError(null);

			try {
				// Check cache first
				const cacheKey = getReverseCacheKey(lat, lon);
				const cached = loadWithExpiry<GeocodingResult>(cacheKey);

				if (cached) {
					setIsLoading(false);
					return cached;
				}

				// Fetch from API (now using Photon)
				const result = await reverseGeocode(lat, lon);

				// Cache result
				if (result) {
					saveWithExpiry(cacheKey, result, 120); // Cache for 2 hours
				}

				setIsLoading(false);
				return result;
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Reverse geocoding failed";
				setError(errorMessage);
				setIsLoading(false);
				return null;
			}
		},
		[]
	);

	return {
		search,
		reverse,
		isLoading,
		error,
	};
}

/**
 * Debounced search hook for location autocomplete.
 * Automatically debounces search queries to reduce API calls.
 *
 * @param {number} delay - Debounce delay in milliseconds (default: 500)
 * @returns {object} Debounced search utilities
 */
export const useDebouncedSearch = (delay: number = 500) => {
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [searchOptions, setSearchOptions] = useState<LocationSearchOptions>({});
	const [results, setResults] = useState<GeocodingResult[]>([]);
	const { search, isLoading, error } = useGeocoding();

	// Debounce query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query);
		}, delay);

		return () => clearTimeout(timer);
	}, [query, delay]);

	// Perform search when debounced query changes
	useEffect(() => {
		if (debouncedQuery.trim() === "") {
			setResults([]);
			return;
		}

		search(debouncedQuery, searchOptions).then(setResults);
	}, [debouncedQuery, search, searchOptions]);

	return {
		query,
		setQuery,
		searchOptions,
		setSearchOptions,
		results,
		isLoading,
		error,
	};
}

/**
 * Debounced reverse geocoding hook.
 * Updates the address result only after the coordinates have stopped changing for `delay` ms.
 * Useful for dragging markers on a map.
 *
 * @param {number} delay - Debounce delay in milliseconds (default: 500)
 */
export const useDebouncedCoordinate = (delay: number = 500) => {
	// We store coordinates as an object to ensure lat/lon update atomically
	const [payload, setPayload] = useState<{
		lat: number;
		lon: number;
		id: string;
	} | null>(null);

	// This state holds the value AFTER the delay
	const [debouncedPayload, setDebouncedPayload] = useState<{
		lat: number;
		lon: number;
		id: string;
	} | null>(null);

	const [result, setResult] = useState<{
		data: GeocodingResult | null;
		id: string;
	} | null>(null);
	const [isDebouncing, setIsDebouncing] = useState(false);
	const { reverse, isLoading, error } = useGeocoding();

	// 1. Debounce logic: Wait for 'delay' ms before updating debouncedCoordinates
	useEffect(() => {
		if (!payload) return;
		setIsDebouncing(true);
		const timer = setTimeout(() => {
			setDebouncedPayload(payload);
			setIsDebouncing(false);
		}, delay);

		return () => clearTimeout(timer);
	}, [payload, delay]);

	// 2. Execution logic: Run the API call when debouncedCoordinates changes
	useEffect(() => {
		if (!debouncedPayload) {
			setResult(null);
			return;
		}

		let active = true;
		// Only call API if we have valid numbers
		reverse(debouncedPayload.lat, debouncedPayload.lon).then((res) => {
			if (active) {
				setResult({ data: res, id: debouncedPayload.id });
			}
		});
		return () => {
			active = false;
		};
	}, [debouncedPayload, reverse]);

	return {
		setCoordinates: (lat: number, lon: number, id: string) =>
			setPayload({ lat, lon, id }), // Function to update coordinates
		result, // The resolved address (GeocodingResult)
		isLoading, // Loading state of the reverse geocode
		isDebouncing,
		isBusy: isLoading || isDebouncing,
		error,
	};
}
