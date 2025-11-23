/**
 * LocalStorage caching utilities with TTL (Time To Live) support.
 * Automatically cleans expired cache entries.
 */

/**
 * Cached data structure with expiry timestamp.
 * @interface CachedItem
 */
interface CachedItem<T> {
	value: T;
	expiry: number; // Unix timestamp in milliseconds
}

/**
 * Saves data to localStorage with expiry time.
 *
 * @param {string} key - Storage key
 * @param {T} data - Data to cache
 * @param {number} ttlMinutes - Time to live in minutes (default: 60)
 * @returns {boolean} Success status
 */
export function saveWithExpiry<T>(
	key: string,
	data: T,
	ttlMinutes: number = 60
): boolean {
	try {
		const now = new Date().getTime();
		const item: CachedItem<T> = {
			value: data,
			expiry: now + ttlMinutes * 60 * 1000,
		};

		localStorage.setItem(key, JSON.stringify(item));
		return true;
	} catch (error) {
		if (
			error instanceof Error &&
			error.name === "QuotaExceededError"
		) {
			console.warn(
				"LocalStorage quota exceeded, cannot cache:",
				key
			);
			// Optionally trigger cache cleanup
			cleanExpiredCache();
		} else {
			console.error("Cache save error:", error);
		}
		return false;
	}
}

/**
 * Loads data from localStorage if not expired.
 *
 * @param {string} key - Storage key
 * @returns {T | null} Cached data or null if expired/missing
 */
export function loadWithExpiry<T>(key: string): T | null {
	try {
		const itemStr = localStorage.getItem(key);
		if (!itemStr) return null;

		const item: CachedItem<T> = JSON.parse(itemStr);
		const now = new Date().getTime();

		if (now > item.expiry) {
			localStorage.removeItem(key);
			return null;
		}

		return item.value;
	} catch (error) {
		console.error("Cache load error:", error);
		localStorage.removeItem(key);
		return null;
	}
}

/**
 * Removes all expired cache entries from localStorage.
 * Should be called periodically to prevent storage bloat.
 *
 * @returns {number} Number of items removed
 */
export function cleanExpiredCache(): number {
	const now = new Date().getTime();
	let removedCount = 0;

	try {
		const keys = Object.keys(localStorage);

		for (const key of keys) {
			const itemStr = localStorage.getItem(key);
			if (!itemStr) continue;

			try {
				const item = JSON.parse(itemStr);
				if (item && item.expiry && now > item.expiry) {
					localStorage.removeItem(key);
					removedCount++;
				}
			} catch {
				// Skip non-cached items
				continue;
			}
		}
	} catch (error) {
		console.error("Cache cleanup error:", error);
	}

	return removedCount;
}

/**
 * Generates cache key for reverse geocoding.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {string} Cache key
 */
export function getReverseCacheKey(lat: number, lon: number): string {
	return `reverse:${lat.toFixed(6)},${lon.toFixed(6)}`;
}

/**
 * Generates cache key for route data.
 * @param {number} startLat - Start latitude
 * @param {number} startLon - Start longitude
 * @param {number} endLat - End latitude
 * @param {number} endLon - End longitude
 * @returns {string} Cache key
 */
export function getRouteCacheKey(
	startLat: number,
	startLon: number,
	endLat: number,
	endLon: number
): string {
	return `route:${startLat.toFixed(6)},${startLon.toFixed(
		6
	)}->${endLat.toFixed(6)},${endLon.toFixed(6)}`;
}

/**
 * Generates cache key for forward geocoding search.
 * @param {string} location - Location query string
 * @returns {string} Cache key
 */
export function getSearchCacheKey(location: string): string {
	return `search:${location.toLowerCase().trim()}`;
}

// Auto-cleanup on module load
cleanExpiredCache();
