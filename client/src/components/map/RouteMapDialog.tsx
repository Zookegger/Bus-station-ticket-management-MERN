import React, { useState, useEffect, useRef } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Paper,
	Typography,
	CircularProgress,
	Alert,
	List,
	Grid,
	Autocomplete,
	TextField,
	Divider,
	FormControl,
	Select,
	MenuItem,
	InputLabel,
} from "@mui/material";
import {
	MapContainer,
	TileLayer,
	Marker,
	Polyline,
	useMapEvents,
	Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
	fetchRoutePolyline,
	formatDistance,
	formatDuration,
	extractRouteMetrics,
	extractStopMetrics,
	type ORSRouteResponse,
} from "@utils/map/routing";
import { useDebouncedSearch, useDebouncedCoordinate } from "@hooks/map";
import { type GeocodingResult } from "@utils/map";
import { LocationFilterCategory } from "@utils/map/geocoding";
import {
	DndContext,
	closestCenter,
	type DragEndEvent,
	useSensor,
	useSensors,
	PointerSensor,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import {
	stopIcon,
	type MapStop,
	type RouteMetrics,
	type LocationData,
} from "./types";
import SortableStopItem from "./SortableStopItem";

// Fix for default marker icons in Leaflet with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// --- MAP CLICK HANDLER ---
const MapClickHandler = ({
	onMapClick,
	disabled,
}: {
	onMapClick: (lat: number, lon: number) => void;
	disabled?: boolean;
}) => {
	// If disabled, register no click handler so map clicks are ignored for adding stops
	useMapEvents(
		disabled ? {} : { click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) }
	);
	return null;
};

// --- DRAGGABLE MARKER ---
interface DraggableMarkerProps {
	position: [number, number];
	icon: L.Icon;
	onDragEnd: (lat: number, lon: number) => void;
	label?: string;
}

const DraggableMarker: React.FC<DraggableMarkerProps> = ({
	position,
	icon,
	onDragEnd,
	label,
}) => {
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
		>
			<Popup>
				{label && (
					<strong>
						{label}
						<br />
					</strong>
				)}
				Lat: {position[0].toFixed(5)}, Lon: {position[1].toFixed(5)}
			</Popup>
		</Marker>
	);
};

const generateId = () =>
	`map-stop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

export interface RouteMapDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (stops: LocationData[], metrics: RouteMetrics) => void;
	initialStops?: any[];
	title?: string;
}

const RouteMapDialog: React.FC<RouteMapDialogProps> = ({
	open,
	onClose,
	onConfirm,
	initialStops = [],
	title = "Select Route Locations",
}) => {
	// -- STATE --
	const [stops, setStops] = useState<MapStop[]>([]);
	const [routeData, setRouteData] = useState<ORSRouteResponse | null>(null);
	const [routeLoading, setRouteLoading] = useState(false);
	const [routeError, setRouteError] = useState<string | null>(null);
	const [selectionMode, setSelectionMode] = useState<
		"start" | "end" | "stops"
	>("start");

	const [highlightedStart, setHighlightedStart] =
		useState<GeocodingResult | null>(null);
	const [highlightedEnd, setHighlightedEnd] =
		useState<GeocodingResult | null>(null);

	// Map Ref
	const mapRef = useRef<L.Map | null>(null);

	// -- SEARCH HOOKS --
	const [startInputValue, setStartInputValue] = useState("");
	const [endInputValue, setEndInputValue] = useState("");
	const [interInputValue, setInterInputValue] = useState("");

	const startSearch = useDebouncedSearch();
	const endSearch = useDebouncedSearch();
	const interSearch = useDebouncedSearch();
	const [searchCategory, setSearchCategory] =
		useState<LocationFilterCategory>(LocationFilterCategory.BUS_TRANSPORT);

	// -- DEBOUNCE LOGIC --
	const {
		setCoordinates: setDragCoordinates,
		result: reverseResult,
		isBusy: isReverseBusy,
	} = useDebouncedCoordinate(600);
	const [pendingRequestId, setPendingRequestId] = useState<string | null>(
		null
	);

	// Dnd Sensors
	const sensors = useSensors(useSensor(PointerSensor));

	// -- INITIALIZATION (Load from DB) --
	useEffect(() => {
		if (open) {
			// Process incoming props into stable internal state
			// This handles both "Create" (empty) and "Edit" (DB data) modes
			const processedStops: MapStop[] = (
				Array.isArray(initialStops) ? initialStops : []
			)
				.filter(
					(s) =>
						s &&
						!isNaN(Number(s.latitude)) &&
						!isNaN(Number(s.longitude))
				)
				.map((s, idx) => ({
					tempId: (s as any).tempId || generateId(),
					id: (s as any).id,
					name: s.name || `Stop ${idx + 1}`,
					address: s.address || s.name || "Unknown Address",
					latitude: Number(s.latitude),
					longitude: Number(s.longitude),
				}));

			setStops(processedStops);

			// Sync Text Inputs
			if (processedStops.length > 0)
				setStartInputValue(processedStops[0].name);
			else setStartInputValue("");

			if (processedStops.length > 1)
				setEndInputValue(
					processedStops[processedStops.length - 1].name
				);
			else setEndInputValue("");

			setInterInputValue("");
			setRouteError(null);
			setRouteData(null);

			// Determine selection mode
			if (processedStops.length === 0) setSelectionMode("start");
			else if (processedStops.length === 1) setSelectionMode("end");
			else setSelectionMode("stops");
		}
	}, [open, initialStops]);

	// -- ROUTE CALCULATION --
	useEffect(() => {
		const calcRoute = async () => {
			const validStops = stops.filter(
				(s) =>
					s.latitude !== undefined &&
					s.longitude !== undefined &&
					!isNaN(s.latitude) &&
					!isNaN(s.longitude)
			);

			if (validStops.length < 2) {
				setRouteData(null);
				return;
			}

			setRouteLoading(true);
			setRouteError(null);
			try {
				const data = await fetchRoutePolyline(validStops);
				setRouteData(data);

				// Auto-fit bounds if not currently dragging
				if (
					mapRef.current &&
					data?.features?.[0]?.geometry &&
					!isReverseBusy
				) {
					const coords = data.features[0].geometry.coordinates.map(
						(c) => [c[1], c[0]] as [number, number]
					);
					mapRef.current.fitBounds(coords, { padding: [50, 50] });
				}
			} catch (err) {
				console.error("Route calc error", err);
				setRouteError("Could not calculate path.");
			} finally {
				setRouteLoading(false);
			}
		};

		const timer = setTimeout(calcRoute, 500);
		return () => clearTimeout(timer);
	}, [stops]);

	// -- HANDLERS --

	const handleSelectLocation = (
		result: GeocodingResult | null,
		mode: "start" | "end" | "stops"
	) => {
		if (!result) return;

		const newStop: MapStop = {
			tempId: generateId(),
			name: result.name,
			address: result.displayName,
			latitude: result.lat,
			longitude: result.lon,
		};

		setStops((prev) => {
			const next = [...prev];
			if (mode === "start") {
				if (next.length > 0) next[0] = newStop;
				else next.push(newStop);
				setStartInputValue(result.name);
				setSelectionMode("end");
			} else if (mode === "end") {
				if (next.length > 1) next[next.length - 1] = newStop;
				else next.push(newStop);
				setEndInputValue(result.name);
				setSelectionMode("stops");
			} else {
				const insertIdx =
					next.length > 1 ? next.length - 1 : next.length;
				next.splice(insertIdx, 0, newStop);
				setInterInputValue("");
			}
			return next;
		});

		mapRef.current?.flyTo([newStop.latitude, newStop.longitude], 15, {
			duration: 0.5,
		});
	};

	const handleMapClick = async (lat: number, lon: number) => {
		const newStop: MapStop = {
			tempId: generateId(),
			name: "Resolving...",
			address: "...",
			latitude: lat,
			longitude: lon,
		};

		let newTempId = newStop.tempId;

		setStops((prev) => {
			const next = [...prev];
			let targetIdx = -1;

			if (selectionMode === "start") {
				targetIdx = 0;
				if (next.length > 0) next[0] = newStop;
				else next.push(newStop);
				setSelectionMode("end");
			} else if (selectionMode === "end") {
				targetIdx = next.length > 1 ? next.length - 1 : next.length;
				if (next.length > 1) next[next.length - 1] = newStop;
				else next.push(newStop);
				setSelectionMode("stops");
			} else {
				targetIdx = next.length > 1 ? next.length - 1 : next.length;
				next.splice(targetIdx, 0, newStop);
			}
			return next;
		});

		// Trigger debounce lookup
		setPendingRequestId(newTempId);
		setDragCoordinates(lat, lon, newTempId);
	};

	// -- DEBOUNCED RESULT HANDLER --
	useEffect(() => {
		if (
			reverseResult &&
			reverseResult.data &&
			reverseResult.id === pendingRequestId
		) {
			setStops((prev) =>
				prev.map((s) => {
					if (s.tempId === pendingRequestId) {
						const name =
							reverseResult.data!.name ||
							reverseResult.data!.displayName.split(",")[0];
						return {
							...s,
							name: name,
							address: reverseResult.data!.displayName,
						};
					}
					return s;
				})
			);
			setPendingRequestId(null);
		}
	}, [reverseResult, pendingRequestId]);

	// Sync inputs when stops change (and names resolve)
	useEffect(() => {
		if (stops.length > 0) {
			if (stops[0].name !== "Resolving...")
				setStartInputValue(stops[0].name);
		} else setStartInputValue("");

		if (stops.length > 1) {
			const last = stops[stops.length - 1];
			if (last.name !== "Resolving...") setEndInputValue(last.name);
		} else setEndInputValue("");
	}, [stops]);

	const handleMarkerDragEnd = (lat: number, lon: number, index: number) => {
		if (isReverseBusy) return; // skip if busy

		const stopToUpdate = stops[index];
		if (!stopToUpdate) return;

		// 1. Visual update immediately
		setStops((prev) => {
			const next = [...prev];
			next[index] = {
				...next[index],
				latitude: lat,
				longitude: lon,
				name: "Resolving...",
			};
			return next;
		});

		// 2. Trigger debounced reverse geocode
		setPendingRequestId(stopToUpdate.tempId);
		setDragCoordinates(lat, lon, stopToUpdate.tempId);
	};

	const handleDragListEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			setStops((items) => {
				const start = items[0];
				const end = items[items.length - 1];
				const middle = items.slice(1, -1);

				const oldIdx = middle.findIndex((i) => i.tempId === active.id);
				const newIdx = middle.findIndex((i) => i.tempId === over.id);

				if (oldIdx !== -1 && newIdx !== -1) {
					const newMiddle = arrayMove(middle, oldIdx, newIdx);
					return [start, ...newMiddle, end];
				}
				return items;
			});
		}
	};

	const removeIntermediate = (tempId: string) => {
		setStops((prev) => prev.filter((s) => s.tempId !== tempId));
	};

	const handleConfirm = () => {
		const metrics = extractRouteMetrics(routeData);
		const stopMetrics = extractStopMetrics(routeData);

		const resultData: LocationData[] = stops.map((s, index) => ({
			name: s.name,
			address: s.address,
			latitude: s.latitude,
			longitude: s.longitude,
			id: s.id,
			durationFromStart: stopMetrics[index]?.durationFromStart || 0,
			distanceFromStart: stopMetrics[index]?.distanceFromStart || 0,
		}));

		onConfirm(resultData, {
			distance: metrics?.distanceMeters ?? null,
			duration: metrics?.durationSeconds ?? null,
		});
		onClose();
	};

	const handleReset = () => {
		setStops([]);
		setRouteData(null);
		setStartInputValue("");
		setEndInputValue("");
		setSelectionMode("start");
	};

	const routeCoords: [number, number][] =
		routeData?.features[0]?.geometry.coordinates.map((c: number[]) => [
			c[1],
			c[0],
		]) || [];
	const mapCenter: [number, number] =
		stops.length > 0
			? [stops[0].latitude, stops[0].longitude]
			: [10.762622, 106.660172];
	const intermediateStops = stops.length > 2 ? stops.slice(1, -1) : [];

	useEffect(() => {
		const opts = { category: searchCategory };
		startSearch.setSearchOptions?.(opts);
		endSearch.setSearchOptions?.(opts);
		interSearch.setSearchOptions?.(opts);
	}, [searchCategory]);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography
						variant="h5"
						fontWeight="bold"
						component={"h1"}
						textOverflow={"ellipsis"}
					>
						{title}
					</Typography>
					<Box sx={{ textAlign: "right" }}>
						{routeLoading ? (
							<CircularProgress size={20} />
						) : (
							routeData && (
								<>
									<Typography
										variant="body2"
										sx={{ textAlign: "right" }}
									>
										Distance:{" "}
										<strong>
											{formatDistance(
												routeData.features[0]
													?.properties.summary
													.distance || 0,
												2
											)}
										</strong>
									</Typography>
									<Typography
										variant="body2"
										sx={{ textAlign: "right" }}
									>
										Duration:
										<strong>
											{formatDuration(
												routeData.features[0]
													?.properties.summary
													.duration || 0
											)}
										</strong>
									</Typography>
								</>
							)
						)}
					</Box>
				</Box>
			</DialogTitle>

			<DialogContent>
				<Grid container spacing={2} sx={{ mt: 1 }}>
					{/* LEFT PANEL: INPUTS */}
					<Grid size={{ xs: 12, md: 4 }}>
						<FormControl fullWidth size="small" sx={{ mb: 2 }}>
							<InputLabel>Search Category</InputLabel>
							<Select
								value={searchCategory}
								label="Search Category"
								onChange={(e) =>
									setSearchCategory(
										e.target.value as LocationFilterCategory
									)
								}
							>
								{Object.values(LocationFilterCategory).map(
									(cat) => (
										<MenuItem key={cat} value={cat}>
											{cat ===
											LocationFilterCategory.BUS_TRANSPORT
												? "Bus stations / stops"
												: cat ===
												  LocationFilterCategory.PUBLIC_TRANSPORT
												? "Public transport"
												: cat ===
												  LocationFilterCategory.ADMIN
												? "Administrative"
												: cat ===
												  LocationFilterCategory.PLACE_OF_INTEREST
												? "Points of interest"
												: cat ===
												  LocationFilterCategory.ROAD
												? "Roads"
												: cat ===
												  LocationFilterCategory.CUSTOM
												? "Custom"
												: "All"}
										</MenuItem>
									)
								)}
							</Select>
						</FormControl>

						<Autocomplete
							freeSolo
							options={startSearch.results}
							getOptionLabel={(opt) =>
								typeof opt === "string" ? opt : opt.displayName
							}
							onHighlightChange={(_, opt) =>
								setHighlightedStart(opt)
							}
							loading={startSearch.isLoading}
							inputValue={startInputValue}
							onInputChange={(_, val, reason) => {
								setStartInputValue(val);
								startSearch.setQuery(val);
								if (
									reason === "clear" ||
									reason === "reset" ||
									val === ""
								) {
									setStops((prev) => {
										const next = [...prev];
										if (next.length > 0) {
											next[0] = {
												...next[0],
												name: "",
												address: "",
												// FORCE CAST: Tell TS to allow undefined to clear the pin
												latitude:
													undefined as unknown as number,
												longitude:
													undefined as unknown as number,
											};
										}
										return next;
									});
								}
							}}
							onChange={(_, value) => {
								if (value === null) {
									startSearch.setQuery("");
									setStops((prev) => {
										const next = [...prev];
										if (next.length > 0) {
											next[0] = {
												...next[0],
												name: "",
												address: "",
												// FORCE CAST: Tell TS to allow undefined to clear the pin
												latitude:
													undefined as unknown as number,
												longitude:
													undefined as unknown as number,
											};
										}
										return next;
									});
									return;
								}
								if (value && typeof value !== "string") {
									endSearch.setQuery(value.name);
									handleSelectLocation(value, "start");
								}
							}}
							onFocus={() => setSelectionMode("start")}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Start Location"
									helperText={`${
										highlightedStart
											? highlightedStart.displayName
											: ""
									}`}
									slotProps={{
										input: {
											...params.InputProps,
											endAdornment: (
												<>
													{startSearch.isLoading ? (
														<CircularProgress
															color="inherit"
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
										formHelperText: {
											sx: {
												textOverflow: "ellipsis",
												maxWidth: "100%",
												whiteSpace: "nowrap",
												overflow: "hidden",
											},
										},
									}}
								/>
							)}
						/>

						<Divider sx={{ my: 2 }} />

						{intermediateStops.length > 0 && (
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragListEnd}
							>
								<SortableContext
									items={intermediateStops.map(
										(s) => s.tempId
									)}
									strategy={verticalListSortingStrategy}
								>
									<List
										dense
										sx={{
											maxHeight: 200,
											overflow: "auto",
											bgcolor: "#f5f5f5",
											borderRadius: 1,
										}}
									>
										{intermediateStops.map((stop, i) => (
											<SortableStopItem
												key={stop.tempId}
												id={stop.tempId}
												stop={stop}
												index={i + 1}
												onRemove={() =>
													removeIntermediate(
														stop.tempId
													)
												}
											/>
										))}
									</List>
								</SortableContext>
							</DndContext>
						)}

						<Autocomplete
							freeSolo
							options={interSearch.results}
							getOptionLabel={(opt) =>
								typeof opt === "string" ? opt : opt.displayName
							}
							loading={interSearch.isLoading}
							inputValue={interInputValue}
							onInputChange={(_, val) => {
								setInterInputValue(val);
								interSearch.setQuery(val);
							}}
							onChange={(_, val) =>
								typeof val !== "string" &&
								handleSelectLocation(val, "stops")
							}
							onFocus={() => setSelectionMode("stops")}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Add Stop"
									placeholder="Search location..."
									sx={{ mt: 1 }}
									slotProps={{
										input: {
											...params.InputProps,
											endAdornment: (
												<>
													{interSearch.isLoading ? (
														<CircularProgress
															color="inherit"
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

						<Divider sx={{ my: 2 }} />

						<Autocomplete
							freeSolo
							options={endSearch.results}
							getOptionLabel={(opt) =>
								typeof opt === "string" ? opt : opt.displayName
							}
							onHighlightChange={(_, opt) =>
								setHighlightedEnd(opt)
							}
							loading={endSearch.isLoading}
							inputValue={endInputValue}
							onInputChange={(_, val, reason) => {
								setEndInputValue(val);
								endSearch.setQuery(val);
								if (reason === "clear" || reason === "reset") {
									setStops((prev) => {
										const next = [...prev];
										const lastIdx = next.length - 1;
										if (lastIdx >= 0) {
											next[lastIdx] = {
												...next[lastIdx],
												name: "",
												address: "",
												// FORCE CAST: Tell TS to allow undefined to clear the pin
												latitude:
													undefined as unknown as number,
												longitude:
													undefined as unknown as number,
											};
										}
										return next;
									});
								}
							}}
							onChange={(_, value) => {
								if (value === null) {
									endSearch.setQuery("");
									setStops((prev) => {
										const next = [...prev];
										const lastIdx = next.length - 1;
										if (lastIdx >= 0) {
											next[lastIdx] = {
												...next[lastIdx],
												name: "",
												address: "",
												// FORCE CAST: Tell TS to allow undefined to clear the pin
												latitude:
													undefined as unknown as number,
												longitude:
													undefined as unknown as number,
											};
										}
										return next;
									});
									return;
								}
								if (value && typeof value !== "string") {
									endSearch.setQuery(value.name);
									handleSelectLocation(value, "end");
								}
							}}
							onFocus={() => setSelectionMode("end")}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Destination"
									helperText={`${
										highlightedEnd
											? highlightedEnd.displayName
											: ""
									}`}
									slotProps={{
										input: {
											...params.InputProps,
											endAdornment: (
												<>
													{endSearch.isLoading ? (
														<CircularProgress
															color="inherit"
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
										formHelperText: {
											sx: {
												textOverflow: "ellipsis",
												maxWidth: "100%",
												whiteSpace: "nowrap",
												overflow: "hidden",
											},
										},
									}}
								/>
							)}
						/>

						{routeError && (
							<Alert severity="error" sx={{ mt: 2 }}>
								{routeError}
							</Alert>
						)}
					</Grid>

					{/* RIGHT PANEL: MAP */}
					<Grid size={{ xs: 12, md: 8 }}>
						<Paper
							elevation={3}
							sx={{
								height: 600,
								overflow: "hidden",
								position: "relative",
							}}
						>
							<MapContainer
								ref={mapRef}
								center={mapCenter}
								zoom={13}
								style={{ height: "100%", width: "100%" }}
							>
								<TileLayer
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
									attribution="&copy; OpenStreetMap contributors"
								/>
								<MapClickHandler
									onMapClick={handleMapClick}
									disabled={
										isReverseBusy || !!pendingRequestId
									}
								/>

								{routeCoords.length > 0 && (
									<Polyline
										positions={routeCoords}
										color="#2a7192ff"
										weight={5}
										// opacity={0.7}
									/>
								)}

								{stops.map((stop, index) => {
									if (
										stop.latitude === undefined ||
										stop.longitude === undefined ||
										isNaN(stop.latitude) ||
										isNaN(stop.longitude)
									) {
										return null;
									}
									return (
										<DraggableMarker
											key={stop.tempId}
											position={[
												stop.latitude,
												stop.longitude,
											]}
											icon={stopIcon(index, stops.length)}
											label={stop.name}
											onDragEnd={(lat, lon) =>
												handleMarkerDragEnd(
													lat,
													lon,
													index
												)
											}
										/>
									);
								})}
							</MapContainer>

							{/** Overlay to block clicks and show spinner while reverse geocoding */}
							{(isReverseBusy || !!pendingRequestId) && (
								<Box
									sx={{
										position: "absolute",
										inset: 0,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										backgroundColor:
											"rgba(255,255,255,0.5)",
										zIndex: 1200,
										pointerEvents: "auto",
										cursor: "wait",
									}}
								>
									<CircularProgress />
								</Box>
							)}
						</Paper>
					</Grid>
				</Grid>
			</DialogContent>

			<DialogActions
				sx={{
					display: "flex",
					justifyContent: "space-between",
					px: 3,
					pb: 2,
				}}
			>
				<Button
					startIcon={
						<FontAwesomeIcon
							icon={faArrowRotateRight}
							className="hvr-icon"
						/>
					}
					onClick={handleReset}
					color="warning"
					className="hvr-icon-spin"
				>
					Reset
				</Button>
				<Box sx={{ display: "flex", gap: 2 }}>
					<Button onClick={onClose}>Cancel</Button>
					<Button
						onClick={handleConfirm}
						variant="contained"
						disabled={stops.length < 2 || routeLoading}
					>
						{routeLoading ? "Calculating..." : "Confirm"}
					</Button>
				</Box>
			</DialogActions>
		</Dialog>
	);
};

export default RouteMapDialog;
