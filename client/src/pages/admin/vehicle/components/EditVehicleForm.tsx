import React, { useState } from "react";
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
import type { UpdateVehicleDTO } from "@my-types/vehicle";
import type { VehicleDetail } from "@my-types/vehicleList";
import type { VehicleType } from "@my-types/vehicleType";

interface EditVehicleFormProps {
	open: boolean;
	vehicle: VehicleDetail | null;
	onClose: () => void;
	onSave: (updatedVehicle: UpdateVehicleDTO) => void;
}

const vehicleTypes: VehicleType[] = [
	{ id: 1, name: "Quảng nam 4 chỗ (2 dòng)" },
	{ id: 2, name: "Xe 16 chỗ" },
	{ id: 3, name: "Xe 29 chỗ" },
	{ id: 4, name: "Limousine 9 chỗ" },
	{ id: 5, name: "Xe Giường nằm" },
];

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
	const [errors, setErrors] = useState({
		numberPlate: "",
		vehicleTypeId: "",
		manufacturer: "",
		model: "",
	});

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
