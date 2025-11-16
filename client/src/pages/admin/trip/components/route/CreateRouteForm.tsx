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
	Grid,
	TextField,
	Typography,
} from "@mui/material";
import { RouteMapDialog, type LocationData } from "@components/map";
import { handleAxiosError } from "@utils/handleError";
import axios from "axios";
import { API_ENDPOINTS } from "@constants";

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
	// Form state
	const [formData, setFormData] = useState({
		departure: "",
		destination: "",
		price: "",
	});

	// Validation errors
	const [errors, setErrors] = useState({
		departure: "",
		destination: "",
		price: "",
	});

	// Map dialog and selected locations
	const [mapOpen, setMapOpen] = useState(false);
	const [startLocation, setStartLocation] = useState<LocationData | null>(null);
	const [endLocation, setEndLocation] = useState<LocationData | null>(null);

	// Submission state
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [serverError, setServerError] = useState<string | null>(null);

	/**
	 * Generic handler that keeps local state in sync with text inputs.
	 */
	const handleInputChange = (field: string, value: string): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Clear error for this field if it exists
		if (errors[field as keyof typeof errors]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}

		// Clear server error when user starts typing
		if (serverError) {
			setServerError(null);
		}
	};

	/**
	 * Validates the current form snapshot before attempting submission.
	 */
	const validateForm = (): boolean => {
		const newErrors = {
			departure: "",
			destination: "",
			price: "",
		};

		if (!formData.departure.trim()) {
			newErrors.departure = "Departure is required";
		}

		if (!formData.destination.trim()) {
			newErrors.destination = "Destination is required";
		}

		if (!formData.price.trim()) {
			newErrors.price = "Price is required";
		} else if (
			isNaN(Number(formData.price)) ||
			Number(formData.price) <= 0
		) {
			newErrors.price = "Price must be a valid positive number";
		}

		setErrors(newErrors);
		return Object.values(newErrors).every((e) => e === "");
	};

	/**
	 * Handles the submit event by validating inputs and calling the backend API.
	 */
	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault(); // Prevent page reload

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);
		setServerError(null);

		try {
			const response = await axios.post(API_ENDPOINTS.ROUTE.BASE, {
				departure: formData.departure.trim(),
				destination: formData.destination.trim(),
				price: Number(formData.price),
			});

			if (response.status === 200 || response.status === 201) {
				onCreated?.();
				onClose();
			}
		} catch (err: unknown) {
			const handled_error = handleAxiosError(err);
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

	/**
	 * Resets the form state whenever the dialog closes so the next open starts fresh.
	 */
	useEffect(() => {
		if (!open) {
			setFormData({ departure: "", destination: "", price: "" });
			setErrors({ departure: "", destination: "", price: "" });
			setServerError(null);
			setStartLocation(null);
			setEndLocation(null);
		}
	}, [open]);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<Box component="form" p={1} onSubmit={handleSubmit}>
				<DialogTitle>
					<Typography variant="h5" fontWeight={"600"}>
						Create Route
					</Typography>
				</DialogTitle>
				<DialogContent>
					{serverError && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{serverError}
						</Alert>
					)}

					<Grid container spacing={3} sx={{ pt: 2 }}>
						{/* Departure */}
						<Grid size={{ xs: 12 }}>
							<TextField
								fullWidth
								required
								label="Departure"
								value={formData.departure}
								onChange={(e) =>
									handleInputChange("departure", e.target.value)
								}
								error={!!errors.departure}
								helperText={errors.departure}
								placeholder="Enter departure location"
							/>
						</Grid>

						{/* Destination */}
						<Grid size={{ xs: 12 }}>
							<TextField
								fullWidth
								required
								label="Destination"
								value={formData.destination}
								onChange={(e) =>
									handleInputChange(
										"destination",
										e.target.value
									)
								}
								error={!!errors.destination}
								helperText={errors.destination}
								placeholder="Enter destination location"
							/>
						</Grid>

						{/* Price */}
						<Grid size={{ xs: 12 }}>
							<TextField
								fullWidth
								required
								label="Price"
								type="number"
								value={formData.price}
								onChange={(e) =>
									handleInputChange("price", e.target.value)
								}
								error={!!errors.price}
								helperText={errors.price}
								placeholder="Enter price (e.g., 100000)"
								slotProps={{
									htmlInput: { min: 0, step: 1000 },
								}}
							/>
						</Grid>

						{/* Map Selection */}
						<Grid size={{ xs: 12 }}>
							<Box
								sx={{
									border: "1px solid #e0e0e0",
									borderRadius: 1,
									p: 2,
									backgroundColor: "#fafafa",
								}}
							>
								<Typography variant="subtitle2" sx={{ mb: 1 }}>
									Route Coordinates
								</Typography>
								{startLocation && endLocation ? (
									<Typography variant="body2" color="text.secondary">
										Start: {startLocation.display_name} | End: {endLocation.display_name}
									</Typography>
								) : (
									<Typography variant="body2" color="text.secondary">
										No coordinates selected.
									</Typography>
								)}
								<Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => setMapOpen(true)}>
									{startLocation && endLocation ? "Edit on Map" : "Select on Map"}
								</Button>
							</Box>
						</Grid>
					</Grid>

					<DialogActions sx={{ px: 0, pt: 3 }}>
						<Button onClick={onClose} color="inherit">
							Cancel
						</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Creating..." : "Create Route"}
						</Button>
					</DialogActions>
					{/* Map Dialog (opens when user selects coordinates) */}
					<RouteMapDialog
						 open={mapOpen}
						 onClose={() => setMapOpen(false)}
						 initialStart={startLocation ?? undefined}
						 initialEnd={endLocation ?? undefined}
						 onConfirm={(start, end) => {
							 setStartLocation(start);
							 setEndLocation(end);
							 setMapOpen(false);
						 }}
						 title="Select Route Locations"
					/>
				</DialogContent>
			</Box>
		</Dialog>
	);
};

export default CreateRouteForm;
