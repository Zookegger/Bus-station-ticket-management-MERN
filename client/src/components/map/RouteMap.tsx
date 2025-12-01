import React, { useEffect, useState, useRef } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Polyline,
	Popup,
	useMap,
} from "react-leaflet";
import L from "leaflet";
import { Box, CircularProgress } from "@mui/material";
import {
	fetchRoutePolyline,
	type RouteWithLocations,
	type ORSRouteResponse,
} from "@utils/map/routing";
import { stopIcon } from "./types";

// --- HELPER: Auto Fit Bounds ---
function FitBounds({ coords }: { coords: [number, number][] }) {
	const map = useMap();
	useEffect(() => {
		if (coords.length > 0) {
			const bounds = L.latLngBounds(coords);
			map.fitBounds(bounds, { padding: [50, 50] });
		}
	}, [coords, map]);
	return null;
}

// --- PROPS ---
export interface RouteMapProps {
	/** Legacy: Display a pre-calculated route from useRouting hook */
	route?: RouteWithLocations | null;
	/** New: Display a saved route from DB stops */
	stops?: {
		latitude: number;
		longitude: number;
		name?: string;
		address?: string;
	}[];
	/** Map height */
	height?: string | number;
	/** Default center */
	center?: [number, number];
	zoom?: number;
	showMarkers?: boolean;
	showRoute?: boolean;
}

/**
 * Leaflet map component.
 * Supports two modes:
 * 1. Legacy: Takes `route` object (OSRM)
 * 2. Load Mode: Takes `stops` array (DB) and fetches Polyline (ORS)
 */
const RouteMap: React.FC<RouteMapProps> = ({
	route,
	stops,
	height = 400,
	center = [10.762622, 106.660172],
	zoom = 13,
	showMarkers = true,
	showRoute = true,
}) => {
	const mapRef = useRef<L.Map | null>(null);
	const [fetchedRoute, setFetchedRoute] = useState<ORSRouteResponse | null>(
		null
	);
	const [loading, setLoading] = useState(false);

	// MODE: Load from DB (Fetch Polyline if stops provided)
	useEffect(() => {
		if (stops && stops.length >= 2 && !route) {
			setLoading(true);
			fetchRoutePolyline(stops)
				.then((data) => {
					setFetchedRoute(data);
				})
				.catch((err) =>
					console.error("Failed to load saved route path", err)
				)
				.finally(() => setLoading(false));
		}
	}, [stops, route]);

	// --- Data Normalization ---
	// 1. Geometry (Polyline)
	let routeCoords: [number, number][] = [];

	if (route?.route?.geometry?.coordinates) {
		// Legacy OSRM format [lon, lat]
		routeCoords = route.route.geometry.coordinates
			.map((c: any[]) => [c[1], c[0]])
			.filter((pair) => Number.isFinite(pair[0]) && Number.isFinite(pair[1]));
	} else if (fetchedRoute?.features?.[0]?.geometry?.coordinates) {
		// ORS format [lon, lat]
		routeCoords = fetchedRoute.features[0].geometry.coordinates
			.map((c) => [c[1], c[0]])
			.filter((pair) => Number.isFinite(pair[0]) && Number.isFinite(pair[1]));
	}

	// 2. Markers (Stops)
	// If 'stops' prop exists, use it. Otherwise try to infer from legacy 'route' object (only has start/end).
	const markersToRender = stops
		? stops
			  .map((s, i) => ({
				  lat: Number(s.latitude),
				  lon: Number(s.longitude),
				  name:
					  s.name ||
					  (i === 0 ? "Start" : i === stops.length - 1 ? "End" : `Stop ${i + 1}`),
				  index: i,
				  total: stops.length,
			  }))
			  .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lon))
		: [];

	// Fallback for legacy route object (only has start/end)
	if (markersToRender.length === 0 && route) {
		if (route.startLocation) {
			markersToRender.push({
				lat: route.startLocation.lat,
				lon: route.startLocation.lon,
				name: route.startLocation.displayName,
				index: 0,
				total: 2,
			});
		}
		if (route.endLocation) {
			markersToRender.push({
				lat: route.endLocation.lat,
				lon: route.endLocation.lon,
				name: route.endLocation.displayName,
				index: 1,
				total: 2,
			});
		}
	}

	// Default center calculation - ensure numeric values
	const firstMarker = markersToRender.length > 0 ? markersToRender[0] : null;
	const mapCenter: [number, number] =
		firstMarker && Number.isFinite(firstMarker.lat) && Number.isFinite(firstMarker.lon)
			? [firstMarker.lat, firstMarker.lon]
			: Array.isArray(center) && Number.isFinite(center[0]) && Number.isFinite(center[1])
			? [center[0], center[1]]
			: [10.762622, 106.660172];

	return (
		<Box sx={{ height, width: "100%", position: "relative" }}>
			{loading && (
				<Box
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: 999,
						bgcolor: "rgba(255,255,255,0.6)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<CircularProgress />
				</Box>
			)}

			<MapContainer
				center={mapCenter}
				zoom={zoom}
				style={{ height: "100%", width: "100%" }}
				ref={mapRef}
			>
				<TileLayer
					attribution="&copy; OpenStreetMap contributors"
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{/* Render Markers */}
				{showMarkers &&
					markersToRender.map((marker, idx) => (
						<Marker
							key={idx}
							position={[marker.lat, marker.lon]}
							icon={stopIcon(marker.index, marker.total)}
						>
							<Popup>
								<strong>
									{marker.index === 0
										? "Start"
										: marker.index === marker.total - 1
										? "End"
										: "Stop"}
								</strong>
								<br />
								{marker.name}
							</Popup>
						</Marker>
					))}

				{/* Render Path */}
				{showRoute && routeCoords.length > 0 && (
					<Polyline positions={routeCoords} color="blue" weight={4} />
				)}

				{/* Auto-fit */}
				{routeCoords.length > 0 && <FitBounds coords={routeCoords} />}
			</MapContainer>
		</Box>
	);
};

export default RouteMap;
