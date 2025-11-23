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
	type ORSRouteResponse,
} from "@utils/map/routing";
import { useDebouncedSearch, useDebouncedCoordinate } from "@hooks/map";
import { reverseGeocode, type GeocodingResult } from "@utils/map";
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
import { stopIcon, type LocationData, type RouteMetrics } from "./types";
import SortableStopItem from "./SortableStopItem";

// Local stop type with temporary ID used for drag/sort identification
type LocalStop = LocationData & { tempId: string };

// Helper to generate a stable-ish temporary id for map stops
const generateId = () =>
	`map-stop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

// --- (Icon setup) ---
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
}: {
	onMapClick: (lat: number, lon: number) => void;
}) => {
	useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
	return null;
};

// --- DRAGGABLE MARKER ---
interface DraggableMarkerProps {
	position: [number, number];
	icon: L.Icon;
	onDragEnd: (lat: number, lon: number) => void;
}

const DraggableMarker: React.FC<DraggableMarkerProps> = ({
	position,
	icon,
	onDragEnd,
}: DraggableMarkerProps) => {
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
				Lat: {position[0].toFixed(5)}, Lon: {position[1].toFixed(5)}
			</Popup>
		</Marker>
	);
};

type MapSelectionMode = "start" | "end" | "stops";

// --- PROPS & COMPONENT ---
export interface RouteMapDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (stops: LocationData[], metrics: RouteMetrics) => void;
	initialStops?: LocationData[];
	title?: string;
}

const RouteMapDialog: React.FC<RouteMapDialogProps> = ({
	open,
	onClose,
	onConfirm,
	initialStops = [],
	title = "Select Route Locations",
}) => {
	const [stops, setStops] = useState<LocalStop[]>([]);
	const [selectionMode, setSelectionMode] =
		useState<MapSelectionMode>("start");
	const [routeData, setRouteData] = useState<ORSRouteResponse | null>(null);

	// Map instance ref so we can control view/zoom programmatically
	const mapRef = useRef<L.Map | null>(null);
	const ignoreBlurRef = useRef(false);

	// Track index of marker being reverse geocoded (drag or map click)
	const [pendingRequestId, setPendingRequestId] = useState<string | null>(
		null
	);

	// Debounced reverse geocoding for marker moves
	const {
		setCoordinates: setDragCoordinates,
		result: reverseResult,
		isBusy: isReverseBusy,
	} = useDebouncedCoordinate(600);

	const [routeLoading, setRouteLoading] = useState(false);
	const [routeError, setRouteError] = useState<string | null>(null);

	const {
		query: startQuery,
		setQuery: setStartQuery,
		results: startResults,
		isLoading: startSearchLoading,
		setSearchOptions: setStartSearchOptions,
	} = useDebouncedSearch();
	const {
		query: endQuery,
		setQuery: setEndQuery,
		results: endResults,
		isLoading: endSearchLoading,
		setSearchOptions: setEndSearchOptions,
	} = useDebouncedSearch();
	const {
		query: intermediateQuery,
		setQuery: setIntermediateQuery,
		results: intermediateResults,
		isLoading: intermediateSearchLoading,
		setSearchOptions: setIntermediateSearchOptions,
	} = useDebouncedSearch();

	// UI-selected search category (applies to all three autocompletes)
	const [search_category, set_search_category] =
		useState<LocationFilterCategory>(LocationFilterCategory.BUS_TRANSPORT);

	// Initialize search filters to prefer bus-related places (bus stations/stops)
	useEffect(() => {
		// setSearchOptions should always be available from the hook, but guard just in case
		try {
			setStartSearchOptions?.({
				category: LocationFilterCategory.BUS_TRANSPORT,
			});
			setEndSearchOptions?.({
				category: LocationFilterCategory.BUS_TRANSPORT,
			});
			setIntermediateSearchOptions?.({
				category: LocationFilterCategory.BUS_TRANSPORT,
			});
		} catch (err) {
			// Non-fatal: don't block the component if filters can't be applied
			// eslint-disable-next-line no-console
			console.warn("Failed to initialize search filters", err);
		}
	}, []);
	useEffect(() => {
		// setSearchOptions should always be available from the hook, but guard just in case
		try {
			setStartSearchOptions?.({
				category: search_category,
			});
			setEndSearchOptions?.({
				category: search_category,
			});
			setIntermediateSearchOptions?.({
				category: search_category,
			});
		} catch (err) {
			// Non-fatal: don't block the component if filters can't be applied
			// eslint-disable-next-line no-console
			console.warn("Failed to initialize search filters", err);
		}
	}, [search_category]);

	// DnD sensors must be created unconditionally (hooks cannot be called conditionally
	// inside JSX). Create them here so hook call order stays stable across renders.
	const pointerSensor = useSensor(PointerSensor);
	const sensors = useSensors(pointerSensor);

	// Effect to initialize stops when the dialog opens
	useEffect(() => {
		if (open) {
			// Ensure initialStops is an array and filter out any invalid stops,
			// but also add a temporary id for drag/sort operations
			const validInitialStops = Array.isArray(initialStops)
				? initialStops
						.filter(
							(s) =>
								s &&
								typeof s.latitude === "number" &&
								typeof s.longitude === "number"
						)
						.map((s) => ({ ...s, tempId: generateId() }))
				: [];
			setStops(validInitialStops);

			// Set search queries based on initial start/end stops
			if (validInitialStops.length > 0) {
				setStartQuery(validInitialStops[0].name || "");
			} else {
				setStartQuery("");
			}
			if (validInitialStops.length > 1) {
				setEndQuery(
					validInitialStops[validInitialStops.length - 1].name || ""
				);
			} else {
				setEndQuery("");
			}

			// Reset other states
			setIntermediateQuery("");
			setRouteData(null);
			setRouteError(null);
			setSelectionMode("start"); // Default to start selection
		}
	}, [open]);

	// Effect to fetch the route polyline whenever stops change
	useEffect(() => {
		const getRoute = async () => {
			if (stops.length < 2) {
				setRouteData(null);
				return;
			}
			setRouteLoading(true);
			setRouteError(null);
			try {
				// Convert stops to the format expected by routing util
				const routingStops = stops.map((s) => ({
					lat: s.latitude,
					lon: s.longitude,
				}));
				const polylineData = await fetchRoutePolyline(routingStops);
				setRouteData(polylineData);
			} catch (error) {
				console.error("Error fetching route:", error);
				setRouteError(
					"Failed to calculate route. Please check the stops."
				);
			} finally {
				setRouteLoading(false);
			}
		};
		getRoute();
	}, [stops]);

	// Fit map to show entire route (or at least start/end) when routeData becomes available
	useEffect(() => {
		try {
			if (!mapRef.current) return;

			// Prefer fitting to the actual route geometry when available
			const routeCoords: [number, number][] =
				routeData?.features[0]?.geometry.coordinates.map(
					(c: number[]) => [c[1], c[0]]
				) ?? [];

			if (routeCoords.length > 0) {
				mapRef.current.fitBounds(routeCoords as any, {
					padding: [60, 60],
				});
				return;
			}

			// Fallback: if we have at least start & end, fit to those points
			if (stops.length >= 2) {
				const latlngs = stops
					.filter(
						(s) =>
							typeof s.latitude === "number" &&
							typeof s.longitude === "number"
					)
					.map((s) => [s.latitude, s.longitude]);
				if (latlngs.length >= 2) {
					mapRef.current.fitBounds(latlngs as any, {
						padding: [60, 60],
					});
				}
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.warn("fitBounds failed", err);
		}
	}, [routeData, stops]);

	// Sync text inputs with stops state whenever stops changes (via map click, drag, or query selection)
	// This keeps the text boxes in sync with map interactions
	useEffect(() => {
		if (stops.length > 0) {
			// Only update if the query doesn't match (avoids fighting user input)
			// But since we use freeSolo + onBlur logic, force sync is safer here
			// to reflect dragging updates
			setStartQuery(stops[0].name || "");
		} else {
			setStartQuery("");
		}

		if (stops.length > 1) {
			setEndQuery(stops[stops.length - 1].name || "");
		} else {
			setEndQuery("");
		}
	}, [stops]);

	/**
	 * Creates a new stop object from a geocoding result (Photon).
	 */
	const createStopFromForwardResult = (
		result: GeocodingResult
	): LocalStop => {
		return {
			name: result.name,
			address: result.displayName,
			latitude: result.lat,
			longitude: result.lon,
			tempId: generateId(),
		};
	};

	/**
	 * Updates a stop with reverse geocoded data (after drag).
	 */
	const enhanceStopWithReverse = (
		stop: LocalStop,
		rev: GeocodingResult
	): LocalStop => {
		// Use the specific name if available, otherwise construct from display name
		const resolvedName = rev.name || rev.displayName.split(",")[0];
		return {
			...stop,
			name: resolvedName,
			address: rev.displayName,
		};
	};

	/**
	 * Handles selecting a location from the search autocomplete.
	 */
	const handleSelectLocation = (
		result: GeocodingResult | null,
		mode: "start" | "end" | "stops"
	) => {
		if (!result) return;
		const newStop = createStopFromForwardResult(result);

		setStops((prev) => {
			const next = [...prev];
			if (mode === "start") {
				if (next.length > 0) next[0] = newStop;
				else next.unshift(newStop);
				setSelectionMode("end");
			} else if (mode === "end") {
				if (next.length > 1) next[next.length - 1] = newStop;
				else next.push(newStop);
				setSelectionMode("stops");
			} else {
				// intermediate - insert before the last item
				const insertIndex =
					next.length > 1 ? next.length - 1 : next.length;
				next.splice(insertIndex, 0, newStop);
			}
			return next;
		});

		// Focus the map on the newly selected pin (fly effect for UX)
		try {
			if (mapRef.current && newStop.latitude && newStop.longitude) {
				mapRef.current.flyTo(
					[newStop.latitude, newStop.longitude],
					15, // zoom level for focusing on a single pin
					{ duration: 0.5 }
				);
			}
		} catch (err) {
			// non-fatal
			// eslint-disable-next-line no-console
			console.warn("Map focus failed", err);
		}
	};

	/**
	 * Handles adding a stop by clicking directly on the map.
	 */
	const handleMapClick = async (lat: number, lon: number) => {
		const placeholder: LocalStop = {
			name: "Resolving...",
			address: `Resolving location...`,
			latitude: lat,
			longitude: lon,
			tempId: generateId(),
		};

		let targetIndex = -1;

		setStops((prev) => {
			const next = [...prev];

			if (selectionMode === "start") {
				targetIndex = 0;
				if (next.length > 0) next[0] = placeholder;
				else next.unshift(placeholder);
				setSelectionMode("end");
			} else if (selectionMode === "end") {
				targetIndex = next.length > 1 ? next.length - 1 : next.length;
				if (next.length > 1) next[next.length - 1] = placeholder;
				else next.push(placeholder);
				setSelectionMode("stops");
			} else {
				targetIndex = next.length > 1 ? next.length - 1 : next.length;
				next.splice(targetIndex, 0, placeholder);
			}
			return next;
		});

		// Trigger reverse geocode lookup
		try {
			const result = await reverseGeocode(lat, lon);
			if (result) {
				setStops((prev) => {
					const current_stop = prev[targetIndex];
					if (
						!current_stop ||
						current_stop.latitude !== lat ||
						current_stop.longitude !== lon
					) {
						return prev;
					}

					const next = [...prev];
					next[targetIndex] = enhanceStopWithReverse(
						next[targetIndex],
						result
					);
					return next;
				});
			}
		} catch (error) {
			console.error("Failed to resolve click location", error);
			const placeholder: LocationData = {
				name: "Unknown Location",
				address: `Unknown Location`,
				latitude: lat,
				longitude: lon,
			};
			setRouteError(`[Reverse Geo Code Error]: ${placeholder}`);
		}
	};

	const handleRemoveIntermediateStop = (indexToRemove: number) => {
		// indexToRemove is relative to the intermediate array (0-based)
		// The intermediate stops start at index 1 in the main `stops` array
		setStops((prevStops) =>
			prevStops.filter((_, i) => i !== indexToRemove + 1)
		);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			setStops((items) => {
				const startStop = items[0];
				const endStop = items[items.length - 1];
				const intermediate = items.slice(1, -1) as LocalStop[];

				// Find items by tempId
				const oldIndex = intermediate.findIndex(
					(item) => item.tempId === active.id
				);
				const newIndex = intermediate.findIndex(
					(item) => item.tempId === over.id
				);

				if (oldIndex === -1 || newIndex === -1) return items;

				const reorderedIntermediate = arrayMove(
					intermediate,
					oldIndex,
					newIndex
				);

				return [startStop, ...reorderedIntermediate, endStop];
			});
		}
	};

	const handleConfirm = () => {
		const metricsNorm = extractRouteMetrics(routeData);
		const metrics: RouteMetrics = {
			distance: metricsNorm?.distanceMeters ?? null,
			duration: metricsNorm?.durationSeconds ?? null,
		};

		// Strip temporary IDs before sending data back to parent
		const cleanStops: LocationData[] = stops.map(
			({ tempId, ...rest }) => rest
		);
		onConfirm(cleanStops, metrics);

		onClose();
	};

	const handleResetAll = () => {
		setStops([]);
		setStartQuery("");
		setEndQuery("");
		setIntermediateQuery("");
		setRouteData(null);
		setRouteError(null);
		setSelectionMode("start");
		setPendingRequestId(null);
	};

	// Update stop name/address after reverse geocode resolves
	useEffect(() => {
		if (
			reverseResult &&
			reverseResult.data &&
			reverseResult.id === pendingRequestId
		) {
			// Extract index from ID (format: "index-timestamp")
			const [indexStr] = reverseResult.id.split("-");
			const index = parseInt(indexStr, 10);

			if (!isNaN(index)) {
				setStops((prev) => {
					if (!prev[index]) return prev;

					const updated = [...prev];
					updated[index] = enhanceStopWithReverse(
						updated[index],
						reverseResult.data!
					);
					return updated;
				});
			}
			setPendingRequestId(null);
		}
	}, [reverseResult, pendingRequestId, stops]);

	// Memoized values for rendering
	const routeCoords: [number, number][] =
		routeData?.features[0]?.geometry.coordinates.map((c: number[]) => [
			c[1],
			c[0],
		]) || [];

	const mapCenter: [number, number] =
		stops.length > 0
			? [stops[0].latitude, stops[0].longitude]
			: [10.762622, 106.660172]; // Default to HCMC

	const intermediateStops = stops.length > 2 ? stops.slice(1, -1) : [];

	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						mt: 1,
						alignItems: "center",
					}}
				>
					<Typography
						variant="h5"
						fontWeight={"bold"}
						component={"h1"}
					>
						{title}
					</Typography>

					{routeLoading ? (
						<CircularProgress size={24} />
					) : routeData ? (
						<Typography variant="body2" sx={{ textAlign: "right" }}>
							Distance:{" "}
							<strong>
								{formatDistance(
									routeData.features[0]?.properties.summary
										.distance || 0,
									2
								)}
							</strong>{" "}
							| Duration:{" "}
							<strong>
								{formatDuration(
									routeData.features[0]?.properties.summary
										.duration || 0
								)}
							</strong>
						</Typography>
					) : (
						routeError && (
							<Alert severity="warning" sx={{ py: 0 }}>
								{routeError}
							</Alert>
						)
					)}
				</Box>
			</DialogTitle>
			<DialogContent>
				<Grid container spacing={2} sx={{ mt: 1 }}>
					<FormControl fullWidth>
						<InputLabel id="route-search-category-label">
							Search category
						</InputLabel>
						<Select
							labelId="route-search-category-label"
							value={search_category}
							label="Search category"
							onChange={(e) =>
								set_search_category(
									e.target.value as LocationFilterCategory
								)
							}
							size="small"
						>
							{(
								Object.values(
									LocationFilterCategory
								) as string[]
							).map((cat) => (
								<MenuItem key={cat} value={cat}>
									{
										// Human-friendly label
										cat ===
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
											: "All"
									}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<Grid size={{ xs: 12, md: 4 }}>
						{/* START LOCATION */}
						<Autocomplete
							fullWidth
							freeSolo
							options={startResults}
							getOptionLabel={(option) =>
								typeof option === "string"
									? option
									: option.displayName
							}
							isOptionEqualToValue={(option, value) =>
								typeof option === "string" ||
								typeof value === "string"
									? option === value
									: option.lat === value.lat &&
									  option.lon === value.lon
							}
							// Render options with a unique key to avoid duplicate-key warnings
							renderOption={(props, option) => {
								const key =
									typeof option === "string"
										? `str-${option}`
										: `loc-${option.lat}-${option.lon}-${option.displayName}`;
								return (
									<li {...props} key={key}>
										{typeof option === "string"
											? option
											: option.displayName}
									</li>
								);
							}}
							loading={startSearchLoading}
							value={null}
							inputValue={startQuery}
							onInputChange={(_, newInputValue, reason) => {
								if (
									reason === "reset" &&
									newInputValue.length > 0
								)
									return;
								setStartQuery(newInputValue);
							}}
							onChange={(_, value) => {
								if (value === null) {
									ignoreBlurRef.current = true;
									setStartQuery("");
									setStops((prev) => {
										const next = [...prev];
										if (next.length > 0) {
											// Clear the name so onBlur doesn't restore it
											next[0] = {
												...next[0],
												name: "",
												address: "",
												// FORCE CAST: Tell TS to allow undefined to clear the pin
												latitude: undefined as unknown as number, 
                								longitude: undefined as unknown as number,
											};
										}
										return next;
									});
									return;
								}
								if (value && typeof value !== "string") {
									setStartQuery(value.name);
									handleSelectLocation(value, "start");
								}
							}}
							onBlur={() => {
								if (startQuery.length === 0) return; // Don't restore if user cleared it
								if (stops.length > 0)
									setStartQuery(stops[0].name || "");
							}}
							onFocus={() => setSelectionMode("start")}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Start Location"
									placeholder="Search or click map..."
									slotProps={{
										input: {
											...params.InputProps,
											endAdornment: (
												<>
													{startSearchLoading ? (
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
							sx={{ mb: 2 }}
						/>

						<Divider sx={{ my: 1 }} />
						{/* INTERMEDIATE STOPS LIST */}
						{stops.length > 2 && (
							<>
								<Box sx={{ mb: 2 }}>
									<DndContext
										sensors={sensors}
										collisionDetection={closestCenter}
										onDragEnd={handleDragEnd}
									>
										<Paper elevation={3}>
											<SortableContext
												// Use tempId for stable identification
												items={intermediateStops.map(
													(s) => s.tempId
												)}
												strategy={
													verticalListSortingStrategy
												}
											>
												<List dense>
													{intermediateStops.map(
														(stop, index) => (
															<SortableStopItem
																key={
																	stop.tempId
																}
																id={stop.tempId}
																stop={stop}
																onRemove={() =>
																	handleRemoveIntermediateStop(
																		index
																	)
																}
															/>
														)
													)}
												</List>
											</SortableContext>
										</Paper>
									</DndContext>
								</Box>
							</>
						)}

						{/* ADD INTERMEDIATE STOP */}
						<Autocomplete
							fullWidth
							freeSolo
							options={intermediateResults}
							getOptionLabel={(option) =>
								typeof option === "string"
									? option
									: option.displayName
							}
							isOptionEqualToValue={(option, value) =>
								typeof option === "string" ||
								typeof value === "string"
									? option === value
									: option.lat === value.lat &&
									  option.lon === value.lon
							}
							// Render options with a unique key to avoid duplicate-key warnings
							renderOption={(props, option) => {
								const key =
									typeof option === "string"
										? `str-${option}`
										: `loc-${option.lat}-${option.lon}-${option.displayName}`;
								return (
									<li {...props} key={key}>
										{typeof option === "string"
											? option
											: option.displayName}
									</li>
								);
							}}
							loading={intermediateSearchLoading}
							value={null}
							inputValue={intermediateQuery}
							onInputChange={(_, newInputValue, reason) => {
								if (
									reason === "reset" &&
									newInputValue.length > 0
								)
									return;
								setIntermediateQuery(newInputValue);
							}}
							onChange={(_, value) => {
								if (value && typeof value !== "string") {
									handleSelectLocation(value, "stops");
									setIntermediateQuery(""); // Always clear after adding
								}
							}}
							onFocus={() => setSelectionMode("stops")}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Add Intermediate Stop"
									placeholder="Search..."
									slotProps={{
										input: {
											...params.InputProps,
											endAdornment: (
												<>
													{intermediateSearchLoading ? (
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
							sx={{ my: 1 }}
						/>

						<Divider sx={{ my: 1 }} />

						{/* END LOCATION */}
						<Autocomplete
							fullWidth
							freeSolo
							options={endResults}
							getOptionLabel={(option) =>
								typeof option === "string"
									? option
									: option.displayName
							}
							isOptionEqualToValue={(option, value) =>
								typeof option === "string" ||
								typeof value === "string"
									? option === value
									: option.lat === value.lat &&
									  option.lon === value.lon
							}
							// Render options with a unique key to avoid duplicate-key warnings
							renderOption={(props, option) => {
								const key =
									typeof option === "string"
										? `str-${option}`
										: `loc-${option.lat}-${option.lon}-${option.displayName}`;
								return (
									<li {...props} key={key}>
										{typeof option === "string"
											? option
											: option.displayName}
									</li>
								);
							}}
							loading={endSearchLoading}
							value={null}
							inputValue={endQuery}
							onInputChange={(_, newInputValue, reason) => {
								if (
									reason === "reset" &&
									newInputValue.length > 0
								) {
									setEndQuery("");
									return;
								}
								setEndQuery(newInputValue);
								console.log(stops);
							}}
							onChange={(_, value) => {
								if (value === null) {
									setEndQuery("");
									setStops((prev) => {
										const next = [...prev];
										const lastIdx = next.length - 1;
										if (lastIdx >= 0) {
											next[lastIdx] = {
												...next[lastIdx],
												name: "",
												address: "",
												// FORCE CAST: Tell TS to allow undefined to clear the pin
												latitude: undefined as unknown as number, 
                								longitude: undefined as unknown as number,
											};
										}
										return next;
									});
									return;
								}
								if (value && typeof value !== "string") {
									setEndQuery(value.name);
									handleSelectLocation(value, "end");
								}
							}}
							onBlur={() => {
								if (endQuery.length === 0) return; // Don't restore if user cleared it
								if (stops.length > 1) {
									setEndQuery(
										stops[stops.length - 1].name || ""
									);
								}
							}}
							onFocus={() => setSelectionMode("end")}
							renderInput={(params) => (
								<TextField
									{...params}
									label="End Location"
									placeholder="Search or click map..."
									slotProps={{
										input: {
											...params.InputProps,
											endAdornment: (
												<>
													{endSearchLoading ? (
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
							sx={{ mt: 2 }}
						/>
					</Grid>

					{/* MAP AREA */}
					<Grid size={{ xs: 12, md: 8 }}>
						<Paper
							elevation={3}
							sx={{ height: 600, overflow: "hidden" }}
						>
							<MapContainer
								ref={mapRef}
								center={mapCenter}
								zoom={13}
								style={{ height: "100%", width: "100%" }}
							>
								<TileLayer
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
								/>
								<MapClickHandler onMapClick={handleMapClick} />
								{stops.map((stop, index) => (
									<DraggableMarker
										key={stop.tempId}
										position={[
											stop.latitude,
											stop.longitude,
										]}
										icon={stopIcon(index, stops.length)}
										onDragEnd={(lat, lon) => {
											if (isReverseBusy) return;
											// 1. Update position visually immediately
											setStops((prev) => {
												const next = [...prev];
												next[index] = {
													...next[index],
													latitude: lat,
													longitude: lon,
													name: "Resolving...",
													address: `(${lat.toFixed(
														4
													)}, ${lon.toFixed(4)})`,
												} as LocalStop;
												return next;
											});

											// 2. Set state for reverse lookup (this is debounced)
											const requestId = `${index}-${Date.now()}`;
											setPendingRequestId(requestId);
											setDragCoordinates(
												lat,
												lon,
												requestId
											);
										}}
									/>
								))}
								{routeCoords.length > 0 && (
									<Polyline
										positions={routeCoords}
										color="#2a7192ff"
										weight={5}
									/>
								)}
							</MapContainer>
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
					onClick={handleResetAll}
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
