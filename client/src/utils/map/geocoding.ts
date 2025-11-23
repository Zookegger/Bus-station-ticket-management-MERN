/**
 * Geocoding utilities using Photon (OpenStreetMap data).
 * API Documentation: https://github.com/komoot/photon
 */

const PHOTON_URL = "https://photon.komoot.io";
const FETCH_HEADERS = {
    "User-Agent": "BusStationApp/1.0 (Compatible; MERN Stack)",
};

// --- RATE LIMITER ---

class RequestQueue {
    private queue: (() => Promise<void>)[] = [];
    private isProcessing = false;
    private delay: number;

    constructor(delay: number = 200) { // Photon is faster, reduced delay
        this.delay = delay;
    }

    add<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await fn();
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
            this.process();
        });
    }

    private async process() {
        if (this.isProcessing) return;
        if (this.queue.length === 0) return;

        this.isProcessing = true;
        const task = this.queue.shift();

        if (task) {
            try {
                await task();
            } catch (e) {
                console.error("Queue task error", e);
            }
        }

        setTimeout(() => {
            this.isProcessing = false;
            this.process();
        }, this.delay);
    }
}

const geocodingQueue = new RequestQueue(200);

// --- TYPES: APP INTERNAL (The format your UI expects) ---

export interface GeocodingResult {
    lat: number;
    lon: number;
    name: string;
    displayName: string;
    address: {
        street?: string;
        houseNumber?: string;
        district?: string;
        city?: string;
        state?: string;
        country?: string;
        postcode?: string;
        suburb?: string; // Mapped from 'district' or 'locality' if missing
    };
}

// --- TYPES: PHOTON API (The actual API response format) ---

export interface PhotonFeatureCollection {
    type: "FeatureCollection";
    features: PhotonFeatureItem[];
}

export interface PhotonFeatureItem {
    type: "Feature";
    properties: PhotonPlaceProperties;
    geometry: PhotonPointGeometry;
}

export interface PhotonPlaceProperties {
    osm_id?: number;
    osm_type?: string;
    osm_key?: string;
    osm_value?: string;
    
    name?: string;
    country?: string;
    city?: string;
    postcode?: string;
    street?: string;
    housenumber?: string;
    state?: string;
    district?: string;
    locality?: string;
    
    // Photon sometimes includes extent for bounding boxes
    extent?: number[]; 
}

export interface PhotonPointGeometry {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
}

// --- UTILITIES ---

/**
 * Fetches data from API with error handling.
 */
async function fetchFromAPI<T>(url: string): Promise<T> {
    try {
        const response = await fetch(url, { headers: FETCH_HEADERS });
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        return (await response.json()) as T;
    } catch (error) {
        console.error("Geocoding API error:", error);
        throw error;
    }
}

/**
 * Maps a raw Photon feature to the application's GeocodingResult interface.
 */
function mapPhotonFeatureToLocation(feature: PhotonFeatureItem): GeocodingResult {
    const props = feature.properties;
    const [lon, lat] = feature.geometry.coordinates;

    // Construct a readable name
    const primaryName = props.name || props.street || props.city || "Unknown Location";

    // Build display name parts
    const displayParts = [
        props.name,
        props.street ? (props.housenumber ? `${props.housenumber} ${props.street}` : props.street) : null,
        props.district || props.locality,
        props.city,
        props.state,
        props.country
    ].filter(Boolean);

    return {
        lat,
        lon,
        name: primaryName,
        displayName: displayParts.join(", "),
        address: {
            street: props.street,
            houseNumber: props.housenumber,
            city: props.city,
            state: props.state,
            country: props.country,
            postcode: props.postcode,
            district: props.district,
            suburb: props.district || props.locality // Fallback for compatibility
        }
    };
}

// --- FILTERING CONSTANTS ---

export const LocationFilterCategory = {
    ALL: "all",
    BUS_TRANSPORT: "bus_transport",
    PUBLIC_TRANSPORT: "public_transport",
    ADMIN: "admin",
    PLACE_OF_INTEREST: "poi",
    ROAD: "road",
    CUSTOM: "custom",
} as const;

export type LocationFilterCategory = (typeof LocationFilterCategory)[keyof typeof LocationFilterCategory];

export interface LocationSearchOptions {
    category?: LocationFilterCategory;
    allowedKeys?: string[];
    allowedValues?: string[];
    customPredicate?: (f: PhotonFeatureItem) => boolean;
}

/**
 * Filtering logic for Photon results based on OSM tags.
 */
const featurePassesFilter = (feature: PhotonFeatureItem, options: LocationSearchOptions): boolean => {
    // Photon uses snake_case for these keys
    const k = feature.properties.osm_key; 
    const v = feature.properties.osm_value;

    if (options.customPredicate) return options.customPredicate(feature);

    if (options.allowedKeys && options.allowedKeys.length > 0) {
        if (!k || !options.allowedKeys.includes(k)) return false;
        if (options.allowedValues && options.allowedValues.length > 0 && (!v || !options.allowedValues.includes(v))) return false;
        return true;
    }

    switch (options.category) {
        case LocationFilterCategory.BUS_TRANSPORT:
            return (
                (k === "amenity" && v === "bus_station") ||
                (k === "highway" && v === "bus_stop") ||
                (k === "public_transport" && ["stop_position", "platform", "station", "stop_area"].includes(v || ""))
            );
        case LocationFilterCategory.PUBLIC_TRANSPORT:
            return (
                (k === "public_transport") ||
                (k === "amenity" && v === "bus_station") ||
                (k === "railway" && v === "station")
            );
        case LocationFilterCategory.ADMIN:
            return (
                k === "place" &&
                ["city", "town", "village", "state", "district", "locality", "suburb"].includes(v || "")
            );
        case LocationFilterCategory.PLACE_OF_INTEREST:
            return ["amenity", "tourism", "shop", "leisure"].includes(k || "");
        case LocationFilterCategory.ROAD:
            return k === "highway";
        case LocationFilterCategory.ALL:
        default:
            return true;
    }
};

// --- EXPORTED FUNCTIONS ---

/**
 * Performs reverse geocoding (Coordinates -> Address).
 */
export const reverseGeocode = async (lat: number, lon: number): Promise<GeocodingResult | null> => {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
        console.error("Invalid latitude or longitude:", lat, lon);
        return null;
    }

    return geocodingQueue.add(async () => {
        try {
            // Photon Reverse Endpoint
            const url = `${PHOTON_URL}/reverse?lat=${lat}&lon=${lon}`;
            
            // Important: Photon returns a FeatureCollection, even for reverse geocoding
            const collection = await fetchFromAPI<PhotonFeatureCollection>(url);

            if (collection && collection.features && collection.features.length > 0) {
                return mapPhotonFeatureToLocation(collection.features[0]);
            }

            return null;
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            return null;
        }
    });
}

/**
 * Performs forward geocoding (Address Name -> Coordinates).
 */
export const searchLocation = async (
    location: string,
    limit: number = 5,
    options: LocationSearchOptions = {}
): Promise<GeocodingResult[]> => {
    if (!location || location.trim() === "") return [];

    return geocodingQueue.add(async () => {
        try {
            // Photon Search API
            const url = `${PHOTON_URL}/api/?q=${encodeURIComponent(location)}&limit=${limit * 2}`; // Request more to account for filtering

            const collection = await fetchFromAPI<PhotonFeatureCollection>(url);
            
            if (!collection.features) return [];

            const filtered = collection.features
                .filter((f) => featurePassesFilter(f, options))
                .slice(0, limit);

            return filtered.map(mapPhotonFeatureToLocation);
        } catch (error) {
            console.error("Location search error:", error);
            return [];
        }
    });
}

/**
 * Helper to clean up display names if necessary.
 */
export const cleanDisplayName = (name: string, displayName: string): string => {
    if (displayName.startsWith(name)) {
        return displayName.substring(name.length).replace(/^,\s*/, "");
    }
    return displayName;
}