import React, { useState, useEffect } from "react";
import {
	Box,
	Typography,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	Grid,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	Edit as EditIcon,
} from "@mui/icons-material";
import axios, { isAxiosError } from "axios";
import type { UpdateVehicleDTO } from "@my-types/vehicle";
import type { VehicleDetail } from "@my-types/vehicleList";
import type { VehicleType } from "@my-types/vehicleType";
import { APP_CONFIG, API_ENDPOINTS } from "@constants/index";

interface EditVehicleFormProps {
	open: boolean;
	vehicle: VehicleDetail | null;
	onClose: () => void;
	onSave: (updatedVehicle: UpdateVehicleDTO) => void;
}

const EditVehicleForm: React.FC<EditVehicleFormProps> = ({
	open,
	vehicle,
	onClose,
	onSave,
}) => {
	const [formData, setFormData] = useState({
		numberPlate: vehicle?.numberPlate || "",
		vehicleTypeId: vehicle?.vehicleType.id || 0,
		manufacturer: vehicle?.manufacturer || "",
		model: vehicle?.model || "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({
		numberPlate: "",
		vehicleTypeId: "",
		manufacturer: "",
		model: "",
	});
	const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
	const [loadingTypes, setLoadingTypes] = useState(false);

	useEffect(() => {
		if (vehicle) {
			setFormData({
				numberPlate: vehicle.numberPlate || "",
				vehicleTypeId: vehicle.vehicleType.id || 0,
				manufacturer: vehicle.manufacturer || "",
				model: vehicle.model || "",
			});
		}
	}, [vehicle]);

	useEffect(() => {
		const getVehicleTypes = async () => {
			setLoadingTypes(true);
			try {
				const response = await axios.get(`${APP_CONFIG.apiBaseUrl}${API_ENDPOINTS.VEHICLE_TYPE.BASE}`);
				if (response.data === null) {
					throw new Error("Server returned empty set");
				}

				if (Array.isArray(response.data)) {
					setVehicleTypes(response.data);
				} else {
					throw new Error("Invalid data format from server");
				}

			} catch (err: unknown) {
				// Fixed: Use 'unknown' instead of specific type or 'any'
				// Narrow the type safely
				let errorMessage = "Failed to load vehicle types.";
	
				if (isAxiosError(err) && err.response?.data?.message) {
					errorMessage = err.response.data.message; // Now TypeScript knows it's a string
				} else if (err instanceof Error) {
					errorMessage = err.message; // Fallback for other Errors
				} // Else: Use the default message for non-Error throws (e.g., strings)
	
				setErrors((prev) => ({ ...prev, general: errorMessage }));
				console.error("Vehicle type fetch error:", err);
			} finally {
				setLoadingTypes(false);
			}
		}

		if (open) {
			getVehicleTypes();
		}
	}, [open]);

	if (!vehicle) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography variant="h6" color="error">
					Vehicle data not found
				</Typography>
			</Box>
		);
	}

	const handleInputChange = (field: string, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field as keyof typeof errors]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};
	const validateForm = () => {
		const newErrors = {
			numberPlate: "",
			vehicleTypeId: "",
			manufacturer: "",
			model: "",
		};
		if (!formData.numberPlate.trim())
			newErrors.numberPlate = "Number plate is required";
		if (!formData.vehicleTypeId)
			newErrors.vehicleTypeId = "Please select a vehicle type";
		setErrors(newErrors);
		return Object.values(newErrors).every((error) => error === "");
	};
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			console.log("Updated vehicle:", formData);
			onSave({
				id: vehicle.id,
				numberPlate: formData.numberPlate,
				vehicleTypeId: formData.vehicleTypeId,
				manufacturer: formData.manufacturer || null,
				model: formData.model || null,
			});
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Edit Vehicle</DialogTitle>
			<DialogContent>
				{errors.general && (
					<Typography variant="body2" color="error" sx={{ mb: 2 }}>
						{errors.general}
					</Typography>
				)}
				<Box component="form" onSubmit={handleSubmit} sx={{ p: 1 }}>
					<Typography variant="h6" sx={{ color: "#333", mb: 4 }}>
						Update vehicle information
					</Typography>

					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 6}}>
							<FormControl fullWidth error={!!errors.vehicleTypeId}>
								<InputLabel>Select a vehicle type</InputLabel>
								<Select
									value={formData.vehicleTypeId}
									label="Select a vehicle type"
									onChange={(e) =>
										handleInputChange(
											"vehicleTypeId",
											Number(e.target.value)
										)
									}
									disabled={loadingTypes}
								>
									{loadingTypes ? (
										<MenuItem disabled>Loading...</MenuItem>
									) : (
										vehicleTypes.map((type) => (
											<MenuItem key={type.id} value={type.id}>
												{type.name}
											</MenuItem>
										))
									)}
								</Select>
								{errors.vehicleTypeId && (
									<Typography
										variant="caption"
										color="error"
										sx={{ mt: 1, ml: 2 }}
									>
										{errors.vehicleTypeId}
									</Typography>
								)}
							</FormControl>
						</Grid>

						<Grid size={{ xs: 12, md: 6}}>
							<TextField
								fullWidth
								label="Number Plate"
								value={formData.numberPlate}
								onChange={(e) =>
									handleInputChange("numberPlate", e.target.value)
								}
								error={!!errors.numberPlate}
								helperText={errors.numberPlate}
								placeholder="Enter number plate"
							/>
						</Grid>

						<Grid size={{ xs: 12, md: 6}}>
							<TextField
								fullWidth
								label="Manufacturer"
								value={formData.manufacturer}
								onChange={(e) =>
									handleInputChange("manufacturer", e.target.value)
								}
								error={!!errors.manufacturer}
								helperText={errors.manufacturer}
								placeholder="Enter manufacturer"
							/>
						</Grid>

						<Grid size={{ xs: 12, md: 6}}>
							<TextField
								fullWidth
								label="Model"
								value={formData.model}
								onChange={(e) =>
									handleInputChange("model", e.target.value)
								}
								error={!!errors.model}
								helperText={errors.model}
								placeholder="Enter model"
							/>
						</Grid>
					</Grid>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button
					variant="outlined"
					startIcon={<ArrowBackIcon />}
					onClick={onClose}
					sx={{ borderColor: "#666", color: "#666" }}
				>
					Back
				</Button>
				<Button
					type="submit"
					variant="contained"
					startIcon={<EditIcon />}
					sx={{
						backgroundColor: "#1976d2",
						"&:hover": { backgroundColor: "#1565c0" },
					}}
					onClick={handleSubmit}
				>
					Update
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditVehicleForm;