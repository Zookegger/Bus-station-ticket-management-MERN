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
} from "@mui/material";
import { RouteMapDialog, type LocationData } from "@components/map";
import { handleAxiosError } from "@utils/handleError";
import axios from "axios";
import { API_ENDPOINTS } from "@constants";
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
import { closestCenter, DndContext, type DragEndEvent, useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type UILocation = Partial<Location> & { tempId: string };

/**
 * Props for the CreateRouteForm dialog component.
 */
interface CreateRouteFormProps {
	open: boolean;
	onClose: () => void;
	onCreated?: () => void;
}

/**
 * Renders the modal dialog that lets admin users create new routes.
 */
const CreateRouteForm: React.FC<CreateRouteFormProps> = ({
	open,
	onClose,
	onCreated,
}) => {
	const [name, setName] = useState<string>("");
	const [stops, setStops] = useState<UILocation[]>([]);
	const [price, setPrice] = useState<number | null>();
	const [distance, setDistance] = useState<number | null>(null);
	const [duration, setDuration] = useState<number | null>(null);

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
	/**
	 * Generates a unique temporary identifier for a stop entry.
	 * @returns {string} A unique temp id string.
	 */
	// Inline comment: temp IDs are used for stable drag-and-drop identity
	// while stops are not yet persisted in backend.
	// NOTE: randomness minimizes collision risk across rapid creations.
	const getTempStopId = (): string => `stop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	/**
	 * Removes a stop from the list by its index.
	 */
	/**
	 * Removes a stop from the list by index. Prevent removal below minimum of 2.
	 * @param {number} index - The index of the stop to remove.
	 */
	const removeStop = (index: number) => {
		if (stops.length <= 2) return;
		setStops((prev) => prev.filter((_, i) => i !== index));
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			setStops((items) => {
				const oldIndex = items.findIndex((item) => item.tempId === active.id);
				const newIndex = items.findIndex((item) => item.tempId === over.id);
				if (oldIndex === -1 || newIndex === -1) return items;
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	// DnD sensors (enable pointer + keyboard)
	const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

	/**
	 * Validates the current form snapshot before attempting submission.
	 */
	/**
	 * Validates current form state before submission.
	 * Ensures route name, each stop name, and price are valid.
	 * @returns {boolean} True if form is valid; false otherwise.
	 */
	const validateForm = (): boolean => {
		const newErrors: { stops: string[]; price?: string; name?: string } = { stops: [] };
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
		if (!price) {
			newErrors.price = "Price is required";
			isValid = false;
		} else if (isNaN(Number(price)) || Number(price) <= 0) {
			newErrors.price = "Price must be a valid positive number";
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	/**
	 * Handles the submit event by validating inputs and calling the backend API.
	 */
	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		if (!validateForm()) return;

		setIsSubmitting(true);
		setServerError(null);

		try {
			// The backend expects an array of Location objects
			const payload = {
				stops: stops.map((s) => ({
					name: s.name,
					address: s.address ?? s.name, // Default address to name if not present
					latitude: s.latitude,
					longitude: s.longitude,
				})),
				price: Number(price),
				distance: distance,
				duration: duration,
			};

			await axios.post(API_ENDPOINTS.ROUTE.BASE, payload);
			onCreated?.();
			onClose();
		} catch (err: unknown) {
			const handledError = handleAxiosError(err);
			setServerError(handledError.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	/**
	 * Resets the form state whenever the dialog closes so the next open starts fresh.
	 */
	useEffect(() => {
		if (!open) {
			setStops([{ tempId: getTempStopId() }, { tempId: getTempStopId() }]);
			setPrice(null);
			setDistance(null);
			setDuration(null);
			setErrors({});
			setServerError(null);
		}
	}, [open]);

	const displayValue = Number(price).toLocaleString("vi-VN");

	// Check if valid coordinates exists
	const hasValidCoordinates = stops.some((s) => s.latitude && s.longitude);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<Box component="form" p={1} onSubmit={handleSubmit}>
				<DialogTitle>
					<Typography
						variant="h5"
						component={"div"}
						fontWeight={"600"}
					>
						Create Route
					</Typography>
				</DialogTitle>
				<DialogContent>
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
								onChange={(e) => setName(e.target.value)}
								error={!!errors.name}
								helperText={errors.name}
								placeholder="Enter route name"
								slotProps={{
									htmlInput: {
										min: 0,
										step: 1000,
									},
								}}
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
										const raw = e.target.value.replace(
											/[^\d]/g,
											""
										);
										let nextValue = raw ? Number(raw) : 0;

										nextValue = Math.max(0, nextValue);

										setPrice(Number(nextValue));
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
									flexDirection: { xs: "column", sm: "row" },
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
											sx={{ fontSize: 48, opacity: 1 }}
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
												/ {stops.length} stops set
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
										direction={{ xs: "row", sm: "column" }}
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
										<Box sx={{ alignItems: "center" }}>
											<Stack
												direction={"row"}
												alignItems={"center"}
												gap={0.5}
												justifyContent={"center"}
											>
												<Straighten
													fontSize="small"
													color="action"
												/>
												<Typography>
													{formatDistance(distance)}
												</Typography>
											</Stack>
										</Box>

										<Divider
											orientation="horizontal"
											flexItem
										/>
										<Box sx={{ alignItems: "center" }}>
											<Stack
												direction={"row"}
												alignItems={"center"}
												gap={0.5}
												justifyContent={"center"}
											>
												<AccessTime
													fontSize="small"
													color="action"
												/>
												<Typography>
													{formatDuration(duration)}
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
										// Use safe tempIds
										items={stops.map((s) => s.tempId)}
										strategy={verticalListSortingStrategy}
									>
										<List dense>
											{stops.map((stop, index) => (
												<SortableStopItem
													key={stop.tempId} // React Key = tempId
													id={stop.tempId} // Sortable ID = tempId (CRITICAL)
													stop={stop as LocationData}
													index={index} // Show "1", "2"
													isStart={index === 0} // Show Green styling
													isEnd={
														index ===
														stops.length - 1
													} // Show Red styling
													onRemove={() =>
														removeStop(index)
													}
												/>
											))}
										</List>
									</SortableContext>
								</Paper>
							</DndContext>
						</Box>
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
							!name.trim() ||
							stops.length < 2 ||
							!price ||
							distance == null ||
							duration == null
						}
					>
						{isSubmitting ? "Creating..." : "Create Route"}
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
					// Map confirmed LocationData[] back into UILocation[] by adding tempId
					setStops(
						confirmedStops.map((s) => ({
							...s,
							tempId: getTempStopId(),
						}))
					);
					setDistance(routeMetrics.distance);
					setDuration(routeMetrics.duration);
					setMapOpen(false);
				}}
			/>
		</Dialog>
	);
};

export default CreateRouteForm;
