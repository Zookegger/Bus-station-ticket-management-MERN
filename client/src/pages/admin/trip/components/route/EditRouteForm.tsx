import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { EditRouteFormProps } from "./types/Props";
import type { UpdateRouteDTO } from "@my-types";
import { API_ENDPOINTS } from "@constants";
import { handleAxiosError } from "@utils/handleError";
import axios from "axios";
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormHelperText,
	Grid,
	TextField,
	CircularProgress,
	Typography,
	InputAdornment,
} from "@mui/material";
import { RouteMap } from "@components/map";
import { useAutoRoute } from "@hooks/map";

axios.defaults.withCredentials = true;

/**
 * Internal shape used to keep the form state strongly typed while allowing optional fields.
 */
type EditRouteFormState = Partial<UpdateRouteDTO> & {
	price: number;
	startId?: number;
	destinationId?: number;
};

/**
 * Default values applied whenever the dialog opens or resets.
 */
const INITIAL_FORM_STATE: EditRouteFormState = {
	startId: undefined,
	destinationId: undefined,
	distance: undefined,
	duration: undefined,
	price: 0,
};

/**
 * Collection of validation errors indexed by form field name.
 */
type FormErrorState = Partial<
	Record<keyof EditRouteFormState | "general", string>
>;

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

	// Prefer fetched route (by id) over passed-in prop for freshest data
	const activeRoute: any | null = fetchedRoute ?? route ?? null;

	// Auto-calculate route if we have valid coordinates
	const startLat = activeRoute?.startLocation?.latitude ?? null;
	const startLon = activeRoute?.startLocation?.longitude ?? null;
	const endLat = activeRoute?.destination?.latitude ?? null;
	const endLon = activeRoute?.destination?.longitude ?? null;

	const {
		route: calculatedRoute,
		isLoading: routeLoading,
		error: routeError,
	} = useAutoRoute(startLat, startLon, endLat, endLon);

	useEffect(() => {
		if (!open) {
			resetForm();
		}

		// Populate form when editing an existing route
		if (activeRoute) {
			setFormData({
				startId: activeRoute.startId,
				destinationId: activeRoute.destinationId,
				distance: activeRoute.distance ?? undefined,
				duration: activeRoute.duration ?? undefined,
				price: activeRoute.price ?? 0,
			});
		}
	}, [activeRoute, open]);

	// Auto-populate distance and duration from calculated route
	useEffect(() => {
		if (calculatedRoute && open) {
			setFormData((prev) => ({
				...prev,
				distance: calculatedRoute.route.distance / 1000, // Convert meters to km
				duration: calculatedRoute.route.duration / 60, // Convert seconds to minutes
			}));
		}
	}, [calculatedRoute, open]);

	// Fetch route by id when provided from list
	useEffect(() => {
		const fetchById = async (id: number) => {
			try {
				setIsRouteFetching(true);
				const { data } = await axios.get(API_ENDPOINTS.ROUTE.UPDATE(id));
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
		field: keyof EditRouteFormState,
		value: string | number | undefined
	): void => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Clear field-specific validation error on change
		if (errors[field]) {
			setErrors((prev) => {
				const next = { ...prev };
				delete next[field];
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
	 * Ensures price is a positive number.
	 * @returns {boolean} True when valid.
	 */
	const validateForm = (): boolean => {
		const nextErrors: FormErrorState = {};

		if (!formData.price || Number(formData.price) <= 0) {
			nextErrors.price = "Price must be greater than 0.";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
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

		try {
			if (!validateForm()) {
				return;
			}

			setIsSubmitting(true);
			setServerError(null);

			const payload: any = {
				startId: formData.startId,
				destinationId: formData.destinationId,
				distance: formData.distance ?? null,
				duration: formData.duration ?? null,
				price: Number(formData.price),
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

	const hasValidCoordinates =
		startLat != null && startLon != null && endLat != null && endLon != null;

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>
				<Typography variant="h5" component="div" fontWeight={600}>Edit Route</Typography>
			</DialogTitle>
			<DialogContent>
				<Box component="form" p={1} onSubmit={handleSubmit}>
					{serverError && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{serverError}
						</Alert>
					)}

					<Grid container spacing={2}>
						<Grid size={12}>
							<Typography variant="subtitle2" color="text.secondary">
								Departure Location
							</Typography>
							<Typography variant="body1">
								{activeRoute?.startLocation?.name ?? "Unknown"}
							</Typography>
							{activeRoute?.startLocation?.address && (
								<Typography variant="body2" color="text.secondary">
									{activeRoute.startLocation.address}
								</Typography>
							)}
						</Grid>

						<Grid size={12}>
							<Typography variant="subtitle2" color="text.secondary">
								Destination Location
							</Typography>
							<Typography variant="body1">
								{activeRoute?.destination?.name ?? "Unknown"}
							</Typography>
							{activeRoute?.destination?.address && (
								<Typography variant="body2" color="text.secondary">
									{activeRoute.destination.address}
								</Typography>
							)}
						</Grid>

						{hasValidCoordinates && (
							<>
								{routeLoading && (
									<Grid size={12}>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 1,
											}}
										>
											<CircularProgress size={16} />
											<Typography variant="body2">
												Calculating route...
											</Typography>
										</Box>
									</Grid>
								)}
								{routeError && (
									<Grid size={12}>
										<Alert severity="warning">
											Could not calculate route path
										</Alert>
									</Grid>
								)}
								{calculatedRoute && (
									<>
										<Grid size={{ xs: 12, sm: 6 }}>
											<FormControl fullWidth>
												<TextField
													label="Distance (km)"
													type="number"
													value={formData.distance?.toFixed(2) ?? ""}
													onChange={(e) =>
														handleInputChange(
															"distance",
															e.target.value
																? Number(e.target.value)
																: undefined
														)
													}
													slotProps={{
														htmlInput: {
															min: 0,
															step: 0.01,
															readOnly: true,
														},
													}}
												/>
											</FormControl>
										</Grid>
										<Grid size={{ xs: 12, sm: 6 }}>
											<FormControl fullWidth>
												<TextField
													label="Duration (minutes)"
													type="number"
													value={formData.duration?.toFixed(0) ?? ""}
													onChange={(e) =>
														handleInputChange(
															"duration",
															e.target.value
																? Number(e.target.value)
																: undefined
														)
													}
													slotProps={{
														htmlInput: {
															min: 0,
															step: 1,
															readOnly: true,
														},
													}}
												/>
											</FormControl>
										</Grid>
									</>
								)}
							</>
						)}

						<Grid size={12}>
							<FormControl fullWidth required error={!!errors.price}>
								{/** Localized display formatting for price */}
								{(() => {
									const displayPrice = Number(formData.price ?? 0).toLocaleString("vi-VN");
									return (
										<TextField
											label="Price"
											type="text"
											value={displayPrice}
											onChange={(e) => {
												// Strip non-digits & parse
												const raw = e.target.value.replace(/[^\d]/g, "");
												const next = raw ? Number(raw) : 0;
												handleInputChange("price", next);
											}}
											helperText={errors.price}
											error={!!errors.price}
											placeholder="Enter price (e.g., 100000)"
											slotProps={{
												input: {
													endAdornment: (
														<InputAdornment position="end">đ</InputAdornment>
													),
													inputMode: "numeric",
												},
												htmlInput: { min: 0, step: 1000 },
											}}
										/>
									);
								})()}
								{errors.price && (
									<FormHelperText>{errors.price}</FormHelperText>
								)}
							</FormControl>
						</Grid>

						{hasValidCoordinates ? (
							<Grid size={12}>
								<Typography
									variant="subtitle2"
									color="text.secondary"
									sx={{ mb: 1 }}
								>
									Route Map
								</Typography>
								<Box
									sx={{
										border: "1px solid #e0e0e0",
										borderRadius: 1,
										overflow: "hidden",
									}}
								>
									<RouteMap route={calculatedRoute} height={400} />
								</Box>
							</Grid>
						) : (
							<Grid size={12}>
								<Alert severity="info">
									No map data available. Location coordinates are
									missing.
								</Alert>
							</Grid>
						)}
					</Grid>

					<DialogActions sx={{ px: 0, pt: 3 }}>
						<Button onClick={onClose} color="inherit">
							Cancel
						</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={
								isSubmitting ||
								!formData.price ||
								Number(formData.price) <= 0
							}
						>
							{isSubmitting ? "Saving..." : "Save Changes"}
						</Button>
					</DialogActions>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

export default EditRouteForm;
