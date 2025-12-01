import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	Grid,
	InputAdornment,
	List,
	Paper,
	TextField,
	Typography,
} from "@mui/material";
import { RouteMapDialog, type LocationData } from "@components/map";
import { handleAxiosError } from "@utils/handleError";
import axios from "axios";
import { API_ENDPOINTS } from "@constants/index";;
import type { Location } from "@my-types";
import { formatDistance, formatDuration } from "@utils/map";
import {
	AccessTime,
	Map as MapIcon,
	Place as PlaceIcon,
	Straighten,
} from "@mui/icons-material";
import { Stack } from "@mui/system";
import SortableStopItem from "@components/map/SortableStopItem";
import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	useSensor,
	useSensors,
	PointerSensor,
	KeyboardSensor,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { EditRouteFormProps } from "./types/Props";
import type { UpdateRouteDTO } from "@my-types";

axios.defaults.withCredentials = true;

const DEFAULT_PRICE_PER_KM = 5000;
const DEFAULT_PRICE_PER_MINUTE = 0;

/**
 * Calculates estimated price based on distance and duration.
 * @param distanceMeters Distance in meters
 * @param durationSeconds Duration in seconds
 * @returns Estimated price rounded to nearest 1000
 */
const calculateEstimatedPrice = (
	distanceMeters: number,
	durationSeconds: number
): number => {
	const distanceKm = distanceMeters / 1000;
	const durationMinutes = durationSeconds / 60;

	const price =
		distanceKm * DEFAULT_PRICE_PER_KM +
		durationMinutes * DEFAULT_PRICE_PER_MINUTE;
	return Math.round(price / 1000) * 1000;
};

type UILocation = Partial<Location> & {
	tempId: string;
	durationFromStart?: number;
	distanceFromStart?: number;
};

/**
 * Internal shape used to keep the form state strongly typed while allowing optional fields.
 */
type EditRouteFormState = {
	name: string;
	stops: UILocation[];
	price: number | null;
	distance: number | null;
	duration: number | null;
};

/**
 * Default values applied whenever the dialog opens or resets.
 */
const INITIAL_FORM_STATE: EditRouteFormState = {
	name: "",
	stops: [],
	price: null,
	distance: null,
	duration: null,
};

/**
 * Collection of validation errors indexed by form field name.
 */
type FormErrorState = {
	name?: string;
	stops?: string[];
	price?: string;
};

/**
 * Renders the modal dialog that lets admin users edit existing routes.
 */
const EditRouteForm: React.FC<EditRouteFormProps> = ({
	open,
	onClose,
	onEdited,
	route,
	routeId,
}) => {
	const [errors, setErrors] = useState<FormErrorState>({});
	const [formData, setFormData] = useState<EditRouteFormState>({
		...INITIAL_FORM_STATE,
	});
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [fetchedRoute, setFetchedRoute] = useState<any | null>(null);
	const [isRouteFetching, setIsRouteFetching] = useState<boolean>(false);

	// Map dialog and selected locations
	const [mapOpen, setMapOpen] = useState(false);

	// Prefer fetched route (by id) over passed-in prop for freshest data
	const activeRoute: any | null = fetchedRoute ?? route ?? null;

	// Helper to generate unique IDs
	/**
	 * Generates a unique temporary identifier for a stop entry.
	 * @returns {string} A unique temp id string.
	 */
	// Inline comment: temp IDs are used for stable drag-and-drop identity
	// while stops are not yet persisted in backend.
	// NOTE: randomness minimizes collision risk across rapid creations.
	const getTempStopId = (): string =>
		`stop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	/**
	 * Removes a stop from the list by its index.
	 */
	/**
	 * Removes a stop from the list by index. Prevent removal below minimum of 2.
	 * @param {number} index - The index of the stop to remove.
	 */
	const removeStop = (index: number) => {
		if (formData.stops.length <= 2) return;
		setFormData((prev) => ({
			...prev,
			stops: prev.stops.filter((_, i) => i !== index),
		}));
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			setFormData((prev) => {
				const oldIndex = prev.stops.findIndex(
					(item) => item.tempId === active.id
				);
				const newIndex = prev.stops.findIndex(
					(item) => item.tempId === over.id
				);
				if (oldIndex === -1 || newIndex === -1) return prev;
				return {
					...prev,
					stops: arrayMove(prev.stops, oldIndex, newIndex),
				};
			});
		}
	};

	// DnD sensors (enable pointer + keyboard)
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor)
	);

	useEffect(() => {
		if (!open) {
			resetForm();
		}

		// Populate form when editing an existing route
		if (activeRoute) {
			setFormData({
				name: activeRoute.name ?? "",
				stops: (activeRoute.stops || []).map(
					(stop: any, index: number) => ({
						...(stop.locations || stop.location || {}),
						durationFromStart: stop.durationFromStart,
						distanceFromStart: stop.distanceFromStart,
						tempId: `stop-${Date.now()}-${index}`,
					})
				),
				price: activeRoute.price ?? null,
				distance: activeRoute.distance ?? null,
				duration: activeRoute.duration ?? null,
			});
		}
	}, [activeRoute, open]);

	// Fetch route by id when provided from list
	useEffect(() => {
		const fetchById = async (id: number) => {
			try {
				setIsRouteFetching(true);
				const { data } = await axios.get(
					API_ENDPOINTS.ROUTE.UPDATE(id)
				);
				setFetchedRoute(data);
			} catch (err: unknown) {
				console.error("Failed to fetch route", handleAxiosError(err));
			} finally {
				setIsRouteFetching(false);
			}
		};

		if (open && routeId && routeId > 0) {
			fetchById(routeId);
		}
		if (!open) {
			setFetchedRoute(null);
		}
	}, [open, routeId]);

	/**
	 * Resets the form state whenever the dialog closes so the next open starts fresh.
	 */
	const resetForm = (): void => {
		setFormData({ ...INITIAL_FORM_STATE });
		setErrors({});
		setServerError(null);
	};

	/**
	 * Generic handler that keeps local state in sync with text, number, or boolean inputs.
	 */
	/**
	 * Generic handler keeping local state in sync for simple inputs.
	 * Clears field-specific and server errors when user edits.
	 * @param field Field key in form state.
	 * @param value New value (string | number | undefined).
	 */
	const handleInputChange = (
		field: keyof Pick<
			EditRouteFormState,
			"name" | "price" | "distance" | "duration"
		>,
		value: string | number | undefined
	): void => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Clear field-specific validation error on change
		if (errors[field as keyof FormErrorState]) {
			setErrors((prev) => {
				const next = { ...prev };
				delete next[field as keyof FormErrorState];
				return next;
			});
		}

		// Reset general server error when user starts editing
		if (serverError) {
			setServerError(null);
		}
	};

	/**
	 * Validates the current form snapshot before attempting submission.
	 */
	/**
	 * Validates form data snapshot before submission.
	 * Ensures name, stops, and price are valid.
	 * @returns {boolean} True when valid.
	 */
	const validateForm = (): boolean => {
		const newErrors: FormErrorState = { stops: [] };

		// Validate route name
		if (!formData.name.trim()) {
			newErrors.name = "Route name is required";
		}

		// Validate each stop name
		formData.stops.forEach((stop, index) => {
			if (!stop.name?.trim()) {
				newErrors.stops![index] = "Location name is required";
			}
		});

		// Validate price
		if (!formData.price || formData.price <= 0) {
			newErrors.price = "Price must be a valid positive number";
		}

		setErrors(newErrors);
		return (
			!newErrors.name && newErrors.stops!.length === 0 && !newErrors.price
		);
	};

	/**
	 * Handles the submit event by validating inputs and calling the backend API.
	 */
	/**
	 * Form submit handler. Validates then performs PUT update.
	 * Propagates field & server errors, resets form on success.
	 * @param event Form submit event.
	 */
	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		if (!validateForm()) return;

		setIsSubmitting(true);
		setServerError(null);

		try {
			// Build a stops array that includes the RouteStop-required fields (routeId, stopOrder).
			// If a stop already has a location id, set it as locationId; otherwise set to null so backend can create it.
			const stopsForPayload = formData.stops.map((s, idx) => ({
				routeId: Number((activeRoute ?? route)!.id),
				locationId: s.id ?? null,
				stopOrder: idx,
				name: s.name,
				address: s.address ?? s.name,
				latitude: s.latitude,
				longitude: s.longitude,
				durationFromStart: s.durationFromStart,
				distanceFromStart: s.distanceFromStart,
			}));

			const payload: UpdateRouteDTO = {
				name: formData.name,
				// cast to the DTO shape to satisfy TS when local shape differs from the exact RouteStop definition
				stops: stopsForPayload as unknown as UpdateRouteDTO["stops"],
				price: Number(formData.price),
				distance: formData.distance,
				duration: formData.duration,
			};

			const response = await axios.put(
				API_ENDPOINTS.ROUTE.UPDATE((activeRoute ?? route)!.id),
				payload
			);

			onEdited?.(response.data);
			resetForm();
			onClose();
		} catch (error: unknown) {
			const handled_error = handleAxiosError(error);
			setServerError(handled_error.message);

			if (handled_error.field_errors) {
				setErrors((prev) => ({
					...prev,
					...handled_error.field_errors,
				}));
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const displayValue = Number(formData.price ?? 0).toLocaleString("vi-VN");

	// Check if valid coordinates exists
	const hasValidCoordinates = formData.stops.some(
		(s) => s.latitude && s.longitude
	);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<Box component="form" p={1} onSubmit={handleSubmit}>
				<DialogTitle>
					<Typography
						variant="h5"
						component={"div"}
						fontWeight={"600"}
					>
						Edit Route
					</Typography>
				</DialogTitle>
				<DialogContent>
					{isRouteFetching ? (
						<Box display={"flex"} padding={18}>
							<CircularProgress
								style={{ margin: "0 auto" }}
								sx={{ textAlign: "center" }}
							/>
						</Box>
					) : (
						<>
							{serverError && (
								<Alert severity="error" sx={{ mb: 2 }}>
									{serverError}
								</Alert>
							)}

							<Grid container spacing={2} sx={{ pt: 1 }}>
								{/* Name */}
								<Grid size={{ xs: 12, md: 6 }}>
									<TextField
										fullWidth
										required
										label="Name"
										type="text"
										value={formData.name}
										onChange={(e) =>
											handleInputChange(
												"name",
												e.target.value
											)
										}
										error={!!errors.name}
										helperText={errors.name}
										placeholder="Enter route name"
									/>
								</Grid>

								{/* Price */}
								<Grid size={{ xs: 12, md: 6 }}>
									<FormControl
										fullWidth
										required
										error={!!errors.price}
									>
										<TextField
											fullWidth
											required
											label="Price"
											type="text"
											value={displayValue}
											onChange={(e) => {
												const raw =
													e.target.value.replace(
														/[^\d]/g,
														""
													);
												let nextValue = raw
													? Number(raw)
													: 0;

												nextValue = Math.max(
													0,
													nextValue
												);

												handleInputChange(
													"price",
													Number(nextValue)
												);
											}}
											error={!!errors.price}
											helperText={errors.price}
											placeholder="Enter price (e.g., 100000)"
											slotProps={{
												htmlInput: {
													min: 0,
													step: 1000,
												},
												input: {
													endAdornment: (
														<InputAdornment position="end">
															đ
														</InputAdornment>
													),
													inputMode: "numeric",
												},
											}}
										/>
									</FormControl>
								</Grid>

								{/* Map Selection */}
								<Grid size={{ xs: 12 }}>
									<Paper
										sx={{
											border: "1px solid #e0e0e0",
											borderRadius: 1,
											p: 2,
											backgroundColor: "#fafafa",
											flexDirection: {
												xs: "column",
												sm: "row",
											},
											display: "flex",
											justifyContent: "space-between",
										}}
									>
										<Box
											sx={{
												display: "flex",
												gap: 2,
												alignItems: "center",
											}}
										>
											<Box
												sx={{
													width: 48,
													height: 48,
													borderRadius: 1,
													bgcolor: "primary.light",
													color: "primary.main",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													opacity: 0.3, // Subtle background
												}}
											>
												<MapIcon
													sx={{
														fontSize: 48,
														opacity: 1,
													}}
													color="inherit"
												/>
											</Box>
											<Box>
												<Typography
													variant="subtitle1"
													fontWeight="600"
													lineHeight={1.2}
												>
													Route Configuration
												</Typography>

												<Stack
													direction="row"
													alignItems="center"
													gap={0.5}
													mt={0.5}
												>
													<PlaceIcon
														sx={{
															fontSize: 14,
															color: "text.secondary",
														}}
													/>
													<Typography
														variant="body2"
														color="text.secondary"
													>
														{
															formData.stops.filter(
																(s) =>
																	s.latitude &&
																	s.longitude
															).length
														}{" "}
														/{" "}
														{formData.stops.length}{" "}
														stops set
													</Typography>
												</Stack>
											</Box>
											<Button
												variant="outlined"
												size="small"
												sx={{ mt: 1 }}
												onClick={() => setMapOpen(true)}
											>
												{hasValidCoordinates
													? "Edit Map"
													: "Open Map"}
											</Button>
										</Box>

										{formData.duration &&
											formData.distance && (
												<Stack
													direction={{
														xs: "row",
														sm: "column",
													}}
													spacing={2}
													sx={{
														mr: 1,
														mt: {
															xs: 1,
															sm: 0,
														},
														display: "flex",
													}}
												>
													<Box
														sx={{
															alignItems:
																"center",
														}}
													>
														<Stack
															direction={"row"}
															alignItems={
																"center"
															}
															gap={0.5}
															justifyContent={
																"center"
															}
														>
															<Straighten
																fontSize="small"
																color="action"
															/>
															<Typography>
																{formatDistance(
																	formData.distance
																)}
															</Typography>
														</Stack>
													</Box>

													<Divider
														orientation="horizontal"
														flexItem
													/>
													<Box
														sx={{
															alignItems:
																"center",
														}}
													>
														<Stack
															direction={"row"}
															alignItems={
																"center"
															}
															gap={0.5}
															justifyContent={
																"center"
															}
														>
															<AccessTime
																fontSize="small"
																color="action"
															/>
															<Typography>
																{formatDuration(
																	formData.duration
																)}
															</Typography>
														</Stack>
													</Box>
												</Stack>
											)}
									</Paper>
								</Grid>
							</Grid>

							{formData.stops && formData.stops.length >= 2 && (
								<Box sx={{ mt: 2 }}>
									<Typography
										variant="caption"
										color="text.secondary"
										sx={{ mb: 1, display: "block" }}
									>
										Drag to reorder intermediate stops
									</Typography>
									<DndContext
										sensors={sensors}
										collisionDetection={closestCenter}
										onDragEnd={handleDragEnd}
									>
										<Paper elevation={1}>
											<SortableContext
												// Use safe tempIds
												items={formData.stops.map(
													(s) => s.tempId
												)}
												strategy={
													verticalListSortingStrategy
												}
											>
												<List dense>
													{formData.stops.map(
														(stop, index) => (
															<SortableStopItem
																key={
																	stop.tempId
																} // React Key = tempId
																id={stop.tempId} // Sortable ID = tempId (CRITICAL)
																stop={
																	stop as LocationData
																}
																index={index} // Show "1", "2"
																isStart={
																	index === 0
																} // Show Green styling
																isEnd={
																	index ===
																	formData
																		.stops
																		.length -
																		1
																} // Show Red styling
																onRemove={() =>
																	removeStop(
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
							)}
						</>
					)}
				</DialogContent>

				<DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
					<Button onClick={onClose} color="inherit">
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={
							isSubmitting ||
							// disable when name is empty, fewer than 2 stops,
							// price not set/invalid, or route metrics missing
							!formData.name.trim() ||
							formData.stops.length < 2 ||
							!formData.price ||
							formData.distance == null ||
							formData.duration == null
						}
					>
						{isSubmitting ? "Saving..." : "Save Changes"}
					</Button>
				</DialogActions>
			</Box>

			{/* Map Dialog */}
			<RouteMapDialog
				open={mapOpen}
				onClose={() => setMapOpen(false)}
				title="Select and Order Route Stops"
				initialStops={
					formData.stops.filter(
						(s) => s.latitude && s.longitude
					) as LocationData[]
				}
				onConfirm={(confirmedStops, routeMetrics) => {
					let newPrice = formData.price;
					if (
						routeMetrics.distance != null &&
						routeMetrics.duration != null
					) {
						newPrice = calculateEstimatedPrice(
							routeMetrics.distance,
							routeMetrics.duration
						);
					}

					// Map confirmed LocationData[] back into UILocation[] by adding tempId
					setFormData((prev) => ({
						...prev,
						stops: confirmedStops.map((s) => ({
							...s,
							tempId: getTempStopId(),
							durationFromStart: s.durationFromStart,
							distanceFromStart: s.distanceFromStart,
						})),
						distance: routeMetrics.distance,
						duration: routeMetrics.duration,
						price: newPrice,
					}));
					setMapOpen(false);
				}}
			/>
		</Dialog>
	);
};

export default EditRouteForm;
