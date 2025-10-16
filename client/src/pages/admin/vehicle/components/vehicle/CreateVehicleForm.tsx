import React, { useEffect, useState } from "react";
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
	Add as AddIcon,
} from "@mui/icons-material";
import axios, { isAxiosError } from "axios";
import type { CreateVehicleDTO } from "@my-types/vehicle";
import { APP_CONFIG, API_ENDPOINTS } from "@constants/index";
import type { VehicleType } from "@my-types/vehicleType";

interface CreateVehicleFormProps {
	open: boolean;
	onClose: () => void;
}

const CreateVehicleForm: React.FC<CreateVehicleFormProps> = ({
	open,
	onClose,
}) => {
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
	const [formData, setFormData] = useState<CreateVehicleDTO>({
		numberPlate: "",
		vehicleTypeId: 0,
		model: "",
		manufacturer: "",
	});

	useEffect(() => {
		const getVehicleTypes = async () => {
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
	
				setErrors({ general: errorMessage }); // Or merge: setErrors((prev) => ({ ...prev, general: errorMessage }));
				console.error("Vehicle type fetch error:", err);
			}
		}

		getVehicleTypes();
	}, []);

	const handleInputChange = (field: string, value: string | number) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		if (errors[field as keyof typeof errors]) {
			setErrors((prev) => ({
				...prev,
				[field]: "",
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {
			vehicleTypeId: "",
			manufacturer: "",
			numberPlate: "",
			model: "",
		};

		if (!formData.vehicleTypeId) {
			newErrors.vehicleTypeId = "Please select a vehicle type";
		}

		if (!formData.manufacturer?.trim()) {
			newErrors.manufacturer = "Vehicle name is required";
		}

		if (!formData.numberPlate.trim()) {
			newErrors.numberPlate = "License plate is required";
		}

		setErrors(newErrors);
		return Object.values(newErrors).every((error) => error === "");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}
		console.log("Creating vehicle:", formData);

		try {
			const response = await axios.post(`${APP_CONFIG.apiBaseUrl}${API_ENDPOINTS.VEHICLE.BASE}`, formData);
			console.log("Vehicle created:", response.data);
			alert("Vehicle created successfully!");
			onClose(); // Close dialog on success
		} catch (error) {
			console.error("Error creating vehicle:", error);
			alert("Failed to create vehicle. Please try again.");
			return;
		}

		// Reset form
		setFormData({
			numberPlate: "",
			vehicleTypeId: 0,
			model: "",
			manufacturer: "",
		});
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Create Vehicle</DialogTitle>
			<DialogContent>
				<Typography variant="h6" sx={{ color: "#333", mb: 4 }}>
					Vehicle Details
				</Typography>

				{/* Form */}
				<Box component="form" onSubmit={handleSubmit}>
					<Grid container spacing={3}>
						{/* Vehicle Type */}
						<Grid size={{ xs: 12 }}>
							<FormControl fullWidth error={!!errors.vehicleTypeId}>
								<InputLabel>Select a vehicle type</InputLabel>
								<Select
									value={formData.vehicleTypeId}
									label="Select a vehicle type"
									onChange={(e) =>
										handleInputChange(
											"vehicleTypeId",
											e.target.value as number
										)
									}
								>
									{vehicleTypes.map((type) => (
										<MenuItem key={type.id} value={type.id}>
											{type.name}
										</MenuItem>
									))}
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

						{/* Vehicle Name */}
						<Grid size={{ xs: 12 }}>
							<TextField
								fullWidth
								label="Vehicle Name"
								value={formData.manufacturer}
								onChange={(e) =>
									handleInputChange("manufacturer", e.target.value)
								}
								error={!!errors.manufacturer}
								helperText={errors.manufacturer}
								placeholder="Enter vehicle name"
							/>
						</Grid>

						{/* Model */}
						<Grid size={{ xs: 12 }}>
							<TextField
								fullWidth
								label="Model"
								value={formData.model}
								onChange={(e) =>
									handleInputChange("model", e.target.value)
								}
								error={!!errors.model}
								helperText={errors.model}
								placeholder="Enter vehicle model"
							/>
						</Grid>

						{/* License Plate */}
						<Grid size={{ xs: 12 }}>
							<TextField
								fullWidth
								label="License Plate"
								value={formData.numberPlate}
								onChange={(e) =>
									handleInputChange(
										"numberPlate",
										e.target.value
									)
								}
								error={!!errors.numberPlate}
								helperText={errors.numberPlate}
								placeholder="Enter license plate (e.g., 51N 0000)"
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
					sx={{
						borderColor: "#666",
						color: "#666",
						"&:hover": {
							borderColor: "#333",
							backgroundColor: "#f5f5f5",
						},
					}}
				>
					Cancel
				</Button>

				<Button
					type="submit"
					variant="contained"
					startIcon={<AddIcon />}
					sx={{
						backgroundColor: "#1976d2",
						"&:hover": {
							backgroundColor: "#1565c0",
						},
						minWidth: 120,
					}}
					onClick={handleSubmit}
				>
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CreateVehicleForm;
