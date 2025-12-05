import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import {
	Alert,
	Box,
	Button,
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
	CircularProgress,
} from "@mui/material";
import { RouteMapDialog, type LocationData } from "@components/map";
import { API_ENDPOINTS } from "@constants/index";
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
import callApi from "@utils/apiCaller";

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

interface RouteFormProps {
	open: boolean;
	onClose: () => void;
	onSaved: (route: any) => void;
	initialData?: any;
	routeId?: number;
}

const RouteForm: React.FC<RouteFormProps> = ({
	open,
	onClose,
	onSaved,
	initialData,
	routeId,
}) => {
	const isEditMode = !!(initialData || routeId);
	const [name, setName] = useState<string>("");
	const [stops, setStops] = useState<UILocation[]>([]);
	const [price, setPrice] = useState<number | null>(null);
	const [distance, setDistance] = useState<number | null>(null);
	const [duration, setDuration] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);

	// Validation errors
	const [errors, setErrors] = useState<{
		name?: string;
		stops?: string[];
		distance?: string;
		duration?: string;
		price?: string;
	}>({});

	// Map dialog and selected locations
	const [mapOpen, setMapOpen] = useState(false);

	// Submission state
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [serverError, setServerError] = useState<string | null>(null);

	// Helper to generate unique IDs
	const getTempStopId = (): string =>
		`stop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	const removeStop = (index: number) => {
		if (stops.length <= 2) return;
		setStops((prev) => prev.filter((_, i) => i !== index));
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			setStops((items) => {
				const oldIndex = items.findIndex(
					(item) => item.tempId === active.id
				);
				const newIndex = items.findIndex(
					(item) => item.tempId === over.id
				);
				if (oldIndex === -1 || newIndex === -1) return items;
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	// DnD sensors (enable pointer + keyboard)
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor)
	);

	const validateForm = (): boolean => {
		const newErrors: { stops: string[]; price?: string; name?: string } = {
			stops: [],
		};
		let isValid = true;

		// Validate route name
		if (!name.trim()) {
			newErrors.name = "Route name is required";
			isValid = false;
		}

		// Validate each stop name
		stops.forEach((stop, index) => {
			if (!stop.name?.trim()) {
				newErrors.stops[index] = "Location name is required";
				isValid = false;
			}
		});

		// Validate price
		if (price === null || price === undefined) {
			newErrors.price = "Price is required";
			isValid = false;
		} else if (isNaN(Number(price)) || Number(price) <= 0) {
			newErrors.price = "Price must be a valid positive number";
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	useEffect(() => {
		const fetchRoute = async () => {
			if (routeId && !initialData) {
				setLoading(true);
				try {
					const res = await callApi<any>({
						method: "GET",
						url: API_ENDPOINTS.ROUTE.BY_ID(routeId),
					});
					const route = res.data || res;
					populateForm(route);
				} catch (err: any) {
					setServerError(
						err.message || "Failed to fetch route details"
					);
				} finally {
					setLoading(false);
				}
			} else if (initialData) {
				populateForm(initialData);
			} else {
				resetForm();
			}
		};

		if (open) {
			fetchRoute();
		}
	}, [open, initialData, routeId]);

	const populateForm = (route: any) => {
		setName(route.name || "");
		setPrice(route.price);
		setDistance(route.distance);
		setDuration(route.duration);

		if (route.stops && Array.isArray(route.stops)) {
			setStops(
				route.stops.map((stop: any) => ({
					...(stop.locations || stop.location || {}),
					tempId: getTempStopId(),
					durationFromStart: stop.durationFromStart,
					distanceFromStart: stop.distanceFromStart,
				}))
			);
		} else {
			setStops([]);
		}
		setErrors({});
		setServerError(null);
	};

	const resetForm = () => {
		setName("");
		setStops([{ tempId: getTempStopId() }, { tempId: getTempStopId() }]);
		setPrice(null);
		setDistance(null);
		setDuration(null);
		setErrors({});
		setServerError(null);
	};

	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		if (!validateForm()) return;

		setIsSubmitting(true);
		setServerError(null);

		try {
			const payload = {
				name: name,
				stops: stops.map((s) => ({
					name: s.name,
					address: s.address ?? s.name,
					latitude: s.latitude,
					longitude: s.longitude,
					durationFromStart: s.durationFromStart,
					distanceFromStart: s.distanceFromStart,
				})),
				price: Number(price),
				distance: distance,
				duration: duration,
			};

			let res;
			if (isEditMode) {
				const id = routeId || initialData?.id;
				res = await callApi({
					method: "PUT",
					url: API_ENDPOINTS.ROUTE.UPDATE(id),
					data: payload,
				});
			} else {
				res = await callApi({
					method: "POST",
					url: API_ENDPOINTS.ROUTE.BASE,
					data: payload,
				});
			}

			const savedRoute = (res as any).data ?? res;
			onSaved(savedRoute);
			onClose();
		} catch (err: any) {
			setServerError(err.message || "Failed to save route");
		} finally {
			setIsSubmitting(false);
		}
	};

	const displayValue =
		price !== null ? Number(price).toLocaleString("vi-VN") : "";
	const hasValidCoordinates = stops.some((s) => s.latitude && s.longitude);

	return (
		<Dialog
			open={open}
			onClose={(_event, reason) => {
				if (reason !== "backdropClick") onClose();
			}}
			maxWidth="md"
			fullWidth
		>
			<Box component="form" p={1} onSubmit={handleSubmit}>
				<DialogTitle>
					<Typography
						variant="h5"
						component={"div"}
						fontWeight={"600"}
					>
						{isEditMode ? "Edit Route" : "Create Route"}
					</Typography>
				</DialogTitle>
				<DialogContent>
					{loading ? (
						<Box display="flex" justifyContent="center" p={3}>
							<CircularProgress />
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
										value={name}
										onChange={(e) =>
											setName(e.target.value)
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
												setPrice(Number(nextValue));
											}}
											error={!!errors.price}
											helperText={errors.price}
											placeholder="Enter price (e.g., 100000)"
											InputProps={{
												endAdornment: (
													<InputAdornment position="end">
														đ
													</InputAdornment>
												),
												inputMode: "numeric",
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
													opacity: 0.3,
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
															stops.filter(
																(s) =>
																	s.latitude &&
																	s.longitude
															).length
														}{" "}
														/ {stops.length} stops
														set
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

										{duration && distance && (
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
														alignItems: "center",
													}}
												>
													<Stack
														direction={"row"}
														alignItems={"center"}
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
																distance
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
														alignItems: "center",
													}}
												>
													<Stack
														direction={"row"}
														alignItems={"center"}
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
																duration
															)}
														</Typography>
													</Stack>
												</Box>
											</Stack>
										)}
									</Paper>
								</Grid>
							</Grid>

							{stops && stops.length >= 2 && (
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
												items={stops.map(
													(s) => s.tempId
												)}
												strategy={
													verticalListSortingStrategy
												}
											>
												<List dense>
													{stops.map(
														(stop, index) => (
															<SortableStopItem
																key={
																	stop.tempId
																}
																id={stop.tempId}
																stop={
																	stop as LocationData
																}
																index={index}
																isStart={
																	index === 0
																}
																isEnd={
																	index ===
																	stops.length -
																		1
																}
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
							loading ||
							!name.trim() ||
							stops.length < 2 ||
							price === null ||
							distance == null ||
							duration == null
						}
					>
						{isSubmitting
							? "Saving..."
							: isEditMode
							? "Update Route"
							: "Create Route"}
					</Button>
				</DialogActions>
			</Box>

			{/* Map Dialog */}
			<RouteMapDialog
				open={mapOpen}
				onClose={() => setMapOpen(false)}
				title="Select and Order Route Stops"
				initialStops={
					stops.filter(
						(s) => s.latitude && s.longitude
					) as LocationData[]
				}
				onConfirm={(confirmedStops, routeMetrics) => {
					setStops(
						confirmedStops.map((s) => ({
							...s,
							tempId: getTempStopId(),
							durationFromStart: s.durationFromStart,
							distanceFromStart: s.distanceFromStart,
						}))
					);
					setDistance(routeMetrics.distance);
					setDuration(routeMetrics.duration);

					if (
						routeMetrics.distance != null &&
						routeMetrics.duration != null
					) {
						const estimatedPrice = calculateEstimatedPrice(
							routeMetrics.distance,
							routeMetrics.duration
						);
						setPrice(estimatedPrice);
					}

					setMapOpen(false);
				}}
			/>
		</Dialog>
	);
};

export default RouteForm;
