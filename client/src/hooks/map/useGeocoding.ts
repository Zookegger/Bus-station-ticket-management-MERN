import { useState, useCallback, useEffect } from "react";
import {
	searchLocation,
	reverseGeocode,
	type GeocodingResult,
	loadWithExpiry,
	saveWithExpiry,
	getSearchCacheKey,
	getReverseCacheKey,
} from "@utils/map";

/**
 * Custom hook for location geocoding with caching and debouncing.
 * Provides search and reverse geocoding capabilities.
 *
 * @returns {object} Geocoding utilities and state
 */
export function useGeocoding() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Searches for location with caching support.
	 * @param {string} query - Location search query
	 * @returns {Promise<GeocodingResult[]>} Search results
	 */
	const search = useCallback(async (query: string): Promise<
		GeocodingResult[]
	> => {
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

			// Fetch from API
			const results = await searchLocation(query, 5);

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
	}, []);

	/**
	 * Performs reverse geocoding with caching.
	 * @param {number} lat - Latitude
	 * @param {number} lon - Longitude
	 * @returns {Promise<GeocodingResult | null>} Location result
	 */
	const reverse = useCallback(async (
		lat: number,
		lon: number
	): Promise<GeocodingResult | null> => {
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

			// Fetch from API
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
	}, []);

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
export function useDebouncedSearch(delay: number = 500) {
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
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

		search(debouncedQuery).then(setResults);
	}, [debouncedQuery, search]);

	return {
		query,
		setQuery,
		results,
		isLoading,
		error,
	};
}
