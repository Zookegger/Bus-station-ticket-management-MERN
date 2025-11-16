import React, { useState, useCallback, useEffect, useRef } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Box,
	Typography,
	Paper,
	CircularProgress,
	Alert,
	Autocomplete,
} from "@mui/material";
import {
	MapContainer,
	TileLayer,
	Marker,
	Polyline,
	useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useDebouncedSearch, useAutoRoute } from "@hooks/map";
import type { GeocodingResult } from "@utils/map";

// Fix for default marker icons
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
 * Location data structure.
 */
export interface LocationData {
	lat: number;
	lon: number;
	display_name: string;
}

/**
 * Map click handler component.
 */
interface MapClickHandlerProps {
	onMapClick: (lat: number, lon: number) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
	useMapEvents({
		click: (e) => {
			onMapClick(e.latlng.lat, e.latlng.lng);
		},
	});
	return null;
}

/**
 * Draggable marker component with event handlers.
 */
interface DraggableMarkerProps {
	position: [number, number];
	icon: L.Icon;
	onDragEnd: (lat: number, lon: number) => void;
}

function DraggableMarker({ position, icon, onDragEnd }: DraggableMarkerProps) {
	const markerRef = useRef<L.Marker>(null);

	const eventHandlers = {
		dragend() {
			const marker = markerRef.current;
			if (marker != null) {
				const pos = marker.getLatLng();
				onDragEnd(pos.lat, pos.lng);
			}
		},
	};

	return (
		<Marker
			position={position}
			icon={icon}
			draggable={true}
			eventHandlers={eventHandlers}
			ref={markerRef}
		/>
	);
}

/**
 * Props for RouteMapDialog component.
 */
export interface RouteMapDialogProps {
	/** Dialog open state */
	open: boolean;
	/** Close handler */
	onClose: () => void;
	/** Callback when user confirms location selection */
	onConfirm: (startLocation: LocationData, endLocation: LocationData) => void;
	/** Initial start location (for edit mode) */
	initialStart?: LocationData | null;
	/** Initial end location (for edit mode) */
	initialEnd?: LocationData | null;
	/** Dialog title */
	title?: string;
}

/**
 * Interactive map dialog for selecting start and end locations for a route.
 * Features:
 * - Location search with autocomplete
 * - Click map to set marker
 * - Draggable markers
 * - Auto-calculated route visualization
 * - Display distance and duration
 *
 * @param {RouteMapDialogProps} props - Component props
 * @returns {JSX.Element} Dialog component
 */
const RouteMapDialog: React.FC<RouteMapDialogProps> = ({
	open,
	onClose,
	onConfirm,
	initialStart = null,
	initialEnd = null,
	title = "Select Route Locations",
}) => {
	// Selection mode: 'start' or 'end'
	const [selectionMode, setSelectionMode] = useState<"start" | "end">(
		"start"
	);

	// Selected locations
	const [startLocation, setStartLocation] = useState<LocationData | null>(
		initialStart
	);
	const [endLocation, setEndLocation] = useState<LocationData | null>(
		initialEnd
	);

	// Search hooks
	const {
		query: startQuery,
		setQuery: setStartQuery,
		results: startResults,
		isLoading: startSearchLoading,
	} = useDebouncedSearch();

	const {
		query: endQuery,
		setQuery: setEndQuery,
		results: endResults,
		isLoading: endSearchLoading,
	} = useDebouncedSearch();

	// Auto-calculate route when both locations are set
	const {
		route,
		isLoading: routeLoading,
		error: routeError,
	} = useAutoRoute(
		startLocation?.lat ?? null,
		startLocation?.lon ?? null,
		endLocation?.lat ?? null,
		endLocation?.lon ?? null
	);

	// Reset state when dialog opens
	useEffect(() => {
		if (open) {
			setStartLocation(initialStart);
			setEndLocation(initialEnd);
			setSelectionMode("start");
		}
	}, [open, initialStart, initialEnd]);

	/**
	 * Handle map click to set marker.
	 */
	const handleMapClick = useCallback(
		(lat: number, lon: number) => {
			const location: LocationData = {
				lat,
				lon,
				display_name: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
			};

			if (selectionMode === "start") {
				setStartLocation(location);
			} else {
				setEndLocation(location);
			}
		},
		[selectionMode]
	);

	/**
	 * Handle marker drag end.
	 */
	const handleStartDragEnd = useCallback((lat: number, lon: number) => {
		setStartLocation({
			lat,
			lon,
			display_name: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
		});
	}, []);

	const handleEndDragEnd = useCallback((lat: number, lon: number) => {
		setEndLocation({
			lat,
			lon,
			display_name: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
		});
	}, []);

	/**
	 * Handle location selection from autocomplete.
	 */
	const handleStartSelect = useCallback((result: GeocodingResult | null) => {
		if (result) {
			setStartLocation({
				lat: result.lat,
				lon: result.lon,
				display_name: result.display_name,
			});
		}
	}, []);

	const handleEndSelect = useCallback((result: GeocodingResult | null) => {
		if (result) {
			setEndLocation({
				lat: result.lat,
				lon: result.lon,
				display_name: result.display_name,
			});
		}
	}, []);

	/**
	 * Handle confirm button.
	 */
	const handleConfirm = () => {
		if (startLocation && endLocation) {
			onConfirm(startLocation, endLocation);
			onClose();
		}
	};

	// Convert route geometry to lat/lon pairs
	const routeCoords: [number, number][] =
		route?.route.geometry.coordinates.map((coord) => [
			coord[1],
			coord[0],
		]) || [];

	// Calculate map center
	const mapCenter: [number, number] =
		startLocation && endLocation
			? [
					(startLocation.lat + endLocation.lat) / 2,
					(startLocation.lon + endLocation.lon) / 2,
			  ]
			: startLocation
			? [startLocation.lat, startLocation.lon]
			: endLocation
			? [endLocation.lat, endLocation.lon]
			: [10.762622, 106.660172]; // Default: Ho Chi Minh City

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 2,
						mt: 1,
					}}
				>
					{/* Search Inputs */}
					<Box sx={{ display: "flex", gap: 2 }}>
						<Autocomplete
							fullWidth
							options={startResults}
							getOptionLabel={(option) => option.display_name}
							loading={startSearchLoading}
							inputValue={startQuery}
							onInputChange={(_, value) => setStartQuery(value)}
							onChange={(_, value) => handleStartSelect(value)}
							onFocus={() => setSelectionMode("start")}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Start Location"
									placeholder="Search or click on map"
									slotProps={{
										input: {
											...params.InputProps,

											endAdornment: (
												<>
													{startSearchLoading ? (
														<CircularProgress
															size={20}
														/>
													) : null}
													{
														params.InputProps
															.endAdornment
													}
												</>
											),
										},
									}}
								/>
							)}
						/>
						<Autocomplete
							fullWidth
							options={endResults}
							getOptionLabel={(option) => option.display_name}
							loading={endSearchLoading}
							inputValue={endQuery}
							onInputChange={(_, value) => setEndQuery(value)}
							onChange={(_, value) => handleEndSelect(value)}
							onFocus={() => setSelectionMode("end")}
							renderInput={(params) => (
								<TextField
									{...params}
									label="End Location"
									placeholder="Search or click on map"
									slotProps={{
										input: {
											...params.InputProps,

											endAdornment: (
												<>
													{startSearchLoading ? (
														<CircularProgress
															size={20}
														/>
													) : null}
													{
														params.InputProps
															.endAdornment
													}
												</>
											),
										},
									}}
								/>
							)}
						/>
					</Box>

					{/* Map Container */}
					<Paper
						elevation={3}
						sx={{ height: 450, overflow: "hidden" }}
					>
						<MapContainer
							center={mapCenter}
							zoom={13}
							style={{ height: "100%", width: "100%" }}
						>
							<TileLayer
								attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>

							{/* Map click handler */}
							<MapClickHandler onMapClick={handleMapClick} />

							{/* Start Marker */}
							{startLocation && (
								<DraggableMarker
									position={[
										startLocation.lat,
										startLocation.lon,
									]}
									icon={startIcon}
									onDragEnd={handleStartDragEnd}
								/>
							)}

							{/* End Marker */}
							{endLocation && (
								<DraggableMarker
									position={[
										endLocation.lat,
										endLocation.lon,
									]}
									icon={endIcon}
									onDragEnd={handleEndDragEnd}
								/>
							)}

							{/* Route Polyline */}
							{routeCoords.length > 0 && (
								<Polyline
									positions={routeCoords}
									color="blue"
									weight={4}
								/>
							)}
						</MapContainer>
					</Paper>

					{/* Route Info */}
					{routeLoading && (
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
							}}
						>
							<CircularProgress size={20} />
							<Typography variant="body2">
								Calculating route...
							</Typography>
						</Box>
					)}
					{routeError && (
						<Alert severity="warning">
							Could not calculate route. Please check your
							location selection.
						</Alert>
					)}
					{route && (
						<Paper elevation={1} sx={{ p: 2 }}>
							<Typography variant="body2" color="text.secondary">
								<strong>Distance:</strong>{" "}
								{route.route.distance} |{" "}
								<strong>Duration:</strong>{" "}
								{route.route.duration}
							</Typography>
						</Paper>
					)}

					{/* Instructions */}
					<Typography variant="caption" color="text.secondary">
						Click on the map or search to set{" "}
						{selectionMode === "start" ? "start" : "end"} location.
						Drag markers to adjust position.
					</Typography>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					onClick={handleConfirm}
					variant="contained"
					disabled={!startLocation || !endLocation}
				>
					Confirm
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default RouteMapDialog;
