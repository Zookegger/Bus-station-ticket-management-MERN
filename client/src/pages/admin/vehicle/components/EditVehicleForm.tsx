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
	Grid
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	Edit as EditIcon,
} from "@mui/icons-material";
import type { UpdateVehicleDTO } from "../../../../types/vehicle";

interface VehicleType {
	id: number;
	name: string;
	description: string;
}

interface EditVehicleFormProps {
	vehicle: {
		id: number;
		numberPlate: string;
		vehicleTypeId: number;
		manufacturer?: string | null;
		model?: string | null;
	};
	onUpdate: (updatedVehicle: UpdateVehicleDTO) => void;
	onCancel: () => void;
}

const vehicleTypes: VehicleType[] = [
	{ id: 1, name: "Quảng nam 4 chỗ (2 dòng)", description: "Xe 4 chỗ ngồi" },
	{ id: 2, name: "Xe 16 chỗ", description: "Xe 16 chỗ tiêu chuẩn" },
	{ id: 3, name: "Xe 29 chỗ", description: "Xe 29 chỗ lớn" },
	{ id: 4, name: "Limousine 9 chỗ", description: "Xe Limousine cao cấp" },
	{ id: 5, name: "Xe Giường nằm", description: "Xe giường nằm" },
];

const EditVehicleForm: React.FC<EditVehicleFormProps> = ({
	vehicle,
	onUpdate,
	onCancel,
}) => {
	const [formData, setFormData] = useState({
		numberPlate: vehicle.numberPlate,
		vehicleTypeId: vehicle.vehicleTypeId,
		manufacturer: vehicle.manufacturer || "",
		model: vehicle.model || "",
	});
	const [errors, setErrors] = useState({
		numberPlate: "",
		vehicleTypeId: "",
		manufacturer: "",
		model: "",
	});

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
			onUpdate({
				numberPlate: formData.numberPlate,
				vehicleTypeId: formData.vehicleTypeId,
				manufacturer: formData.manufacturer || null,
				model: formData.model || null,
			});
		}
	};

	return (
		<Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
			<Typography
				variant="h4"
				sx={{ fontWeight: "bold", color: "#2E7D32", mb: 1 }}
			>
				Edit Vehicle
			</Typography>
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

			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					mt: 4,
					pt: 3,
					borderTop: "1px solid #e0e0e0",
				}}
			>
				<Button
					variant="outlined"
					startIcon={<ArrowBackIcon />}
					onClick={onCancel}
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
				>
					Update
				</Button>
			</Box>
		</Box>
	);
};

export default EditVehicleForm;
