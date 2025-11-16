import React, { useEffect, useRef } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Polyline,
	Popup,
	useMap,
} from "react-leaflet";
import L from "leaflet";
import { Box } from "@mui/material";
import type { RouteWithLocations } from "@utils/map";

// Fix for default marker icons in Leaflet with Webpack/Vite
import "leaflet/dist/leaflet.css";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/**
 * Custom icons for start and end markers.
 */
const startIcon = new L.Icon({
	iconUrl:
		"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

const endIcon = new L.Icon({
	iconUrl:
		"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

/**
 * Component to auto-fit map bounds to show the entire route.
 */
interface FitBoundsProps {
	routeCoords: [number, number][];
}

function FitBounds({ routeCoords }: FitBoundsProps) {
	const map = useMap();

	useEffect(() => {
		if (routeCoords.length > 0) {
			const bounds = L.latLngBounds(routeCoords);
			map.fitBounds(bounds, { padding: [50, 50] });
		}
	}, [routeCoords, map]);

	return null;
}

/**
 * Props for RouteMap component.
 */
export interface RouteMapProps {
	/** Route data to display */
	route: RouteWithLocations | null;
	/** Map height in CSS units */
	height?: string | number;
	/** Initial center coordinates [lat, lon] */
	center?: [number, number];
	/** Initial zoom level */
	zoom?: number;
	/** Show route polyline */
	showRoute?: boolean;
	/** Show start/end markers */
	showMarkers?: boolean;
}

/**
 * Leaflet map component for displaying routes.
 * Shows start/end markers, route polyline, and travel information.
 *
 * @param {RouteMapProps} props - Component props
 * @returns {JSX.Element} Map component
 */
const RouteMap: React.FC<RouteMapProps> = ({
	route,
	height = 400,
	center = [10.762622, 106.660172], // Default: Ho Chi Minh City
	zoom = 13,
	showRoute = true,
	showMarkers = true,
}) => {
	const mapRef = useRef<L.Map | null>(null);

	// Convert route geometry to lat/lon pairs
	const routeCoords: [number, number][] =
		route?.route.geometry.coordinates.map(
			(coord) => [coord[1], coord[0]] // Convert [lon, lat] to [lat, lon]
		) || [];

	// Calculate map center based on route
	const mapCenter: [number, number] =
		route?.startLocation && route?.endLocation
			? [
					(route.startLocation.lat + route.endLocation.lat) / 2,
					(route.startLocation.lon + route.endLocation.lon) / 2,
			  ]
			: center;

	return (
		<Box sx={{ height, width: "100%", position: "relative" }}>
			<MapContainer
				center={mapCenter}
				zoom={zoom}
				style={{ height: "100%", width: "100%" }}
				ref={mapRef}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{/* Start Marker */}
				{showMarkers && route?.startLocation && (
					<Marker
						position={[
							route.startLocation.lat,
							route.startLocation.lon,
						]}
						icon={startIcon}
					>
						<Popup>
							<strong>Start:</strong>
							<br />
							{route.startLocation.display_name}
						</Popup>
					</Marker>
				)}

				{/* End Marker */}
				{showMarkers && route?.endLocation && (
					<Marker
						position={[
							route.endLocation.lat,
							route.endLocation.lon,
						]}
						icon={endIcon}
					>
						<Popup>
							<strong>End:</strong>
							<br />
							{route.endLocation.display_name}
						</Popup>
					</Marker>
				)}

				{/* Route Polyline */}
				{showRoute && routeCoords.length > 0 && (
					<Polyline positions={routeCoords} color="blue" weight={4} />
				)}

				{/* Auto-fit bounds */}
				{routeCoords.length > 0 && (
					<FitBounds routeCoords={routeCoords} />
				)}
			</MapContainer>
		</Box>
	);
};

export default RouteMap;
