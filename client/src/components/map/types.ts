import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- ICONS ---
export const stopIcon = (index: number, total: number) => {
	let color = "blue"; // Intermediate stops
	if (total > 1 && index === 0) color = "green"; // Start
	if (total > 1 && index === total - 1) color = "red"; // End

	return new L.Icon({
		iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
		shadowUrl:
			"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
		shadowSize: [41, 41],
	});
};

// --- UNIFIED TYPES ---

/**
 * Represents a Stop on the map.
 * This unifies the shape between a DB "RouteStop", a "Location" model, and a UI temporary stop.
 */
export interface MapStop {
	/** Unique ID for UI list rendering (drag-drop). Use a temp ID if new, or DB ID if exists. */
	tempId: string;
	/** Database ID (if available) */
	id?: number;
	/** Name of the location */
	name: string;
	/** Full address */
	address: string;
	/** Latitude */
	latitude: number;
	/** Longitude */
	longitude: number;
	/** Is this stop currently being dragged/edited? */
	isDragging?: boolean;
}

/**
 * Metrics returned by the routing engine.
 */
export interface RouteMetrics {
	distance: number | null; // in meters
	duration: number | null; // in seconds
}

/**
 * Location Data strictly for returning to parent components
 */
export interface LocationData {
	name: string;
	address: string;
	latitude: number;
	longitude: number;
	id?: number;
	durationFromStart?: number;
	distanceFromStart?: number;
}
