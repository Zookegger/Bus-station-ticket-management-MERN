import { useState, useCallback, useEffect } from "react";
import {
	getRoute,
	type RouteWithLocations,
	loadWithExpiry,
	saveWithExpiry,
	getRouteCacheKey,
} from "@utils/map";

/**
 * Custom hook for route calculation with caching.
 * Provides route fetching and state management.
 *
 * @returns {object} Routing utilities and state
 */
export function useRouting() {
	const [route, setRoute] = useState<RouteWithLocations | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Calculates route between two points with caching.
	 * @param {number} startLat - Start latitude
	 * @param {number} startLon - Start longitude
	 * @param {number} endLat - End latitude
	 * @param {number} endLon - End longitude
	 * @returns {Promise<RouteWithLocations | null>} Route data
	 */
	const calculateRoute = useCallback(
		async (
			startLat: number,
			startLon: number,
			endLat: number,
			endLon: number
		): Promise<RouteWithLocations | null> => {
			setIsLoading(true);
			setError(null);

			try {
				// Check cache first
				const cacheKey = getRouteCacheKey(
					startLat,
					startLon,
					endLat,
					endLon
				);
				const cached =
					loadWithExpiry<RouteWithLocations>(cacheKey);

				if (cached) {
					setRoute(cached);
					setIsLoading(false);
					return cached;
				}

				// Fetch from API
				const routeData = await getRoute(
					startLat,
					startLon,
					endLat,
					endLon
				);

				// Cache result
				if (routeData) {
					saveWithExpiry(cacheKey, routeData, 60); // Cache for 1 hour
					setRoute(routeData);
				}

				setIsLoading(false);
				return routeData;
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Route calculation failed";
				setError(errorMessage);
				setIsLoading(false);
				return null;
			}
		},
		[]
	);

	/**
	 * Clears current route from state.
	 */
	const clearRoute = useCallback(() => {
		setRoute(null);
		setError(null);
	}, []);

	return {
		route,
		calculateRoute,
		clearRoute,
		isLoading,
		error,
	};
}

/**
 * Auto-calculates route when start and end coordinates change.
 * Useful for real-time route updates.
 *
 * @param {number | null} startLat - Start latitude
 * @param {number | null} startLon - Start longitude
 * @param {number | null} endLat - End latitude
 * @param {number | null} endLon - End longitude
 * @returns {object} Route state and utilities
 */
export function useAutoRoute(
	startLat: number | null,
	startLon: number | null,
	endLat: number | null,
	endLon: number | null
) {
	const { route, calculateRoute, clearRoute, isLoading, error } =
		useRouting();

	useEffect(() => {
		if (
			startLat != null &&
			startLon != null &&
			endLat != null &&
			endLon != null
		) {
			calculateRoute(startLat, startLon, endLat, endLon);
		} else {
			clearRoute();
		}
	}, [startLat, startLon, endLat, endLon, calculateRoute, clearRoute]);

	return {
		route,
		isLoading,
		error,
	};
}
