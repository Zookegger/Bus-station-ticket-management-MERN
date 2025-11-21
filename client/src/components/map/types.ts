
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Location } from "@my-types/location";

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

// --- TYPE DEFINITIONS ---
export type LocationData = Omit<Location, "id" | "createdAt" | "updatedAt">;
export interface RouteMetrics {
    distance: number | null;
    duration: number | null;
}

// --- OPENROUTESERVICE GEOJSON RESPONSE TYPES ---
interface RouteSegment {
	distance: number;
	duration: number;
	steps?: any[];
}

interface RouteProperties {
	segments: RouteSegment[];
	way_points: number[];
	summary: {
		distance: number;
		duration: number;
	};
}

interface RouteGeometry {
	coordinates: [number, number][];
	type: string;
}

interface RouteFeature {
	bbox: number[];
	type: "Feature";
	geometry: RouteGeometry;
	properties: RouteProperties;
}

interface RouteMetadata {
	attribution: string;
	service: string;
	timestamp: number;
	query: {
		coordinates: [number, number][];
		[key: string]: any;
	};
	engine: {
		version: string;
		build_date: string;
		graph_date: string;
	};
}

export interface OpenRouteServiceResponse {
	bbox: number[];
	features: RouteFeature[];
	metadata: RouteMetadata;
	type: "FeatureCollection";
}