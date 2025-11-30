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
	Alert,
	CircularProgress,
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	Edit as EditIcon,
	Error as ErrorIcon,
} from "@mui/icons-material";
import type { UpdateVehicleDTO } from "@my-types/vehicle";
import type { VehicleDetail } from "@my-types/vehicleList";
import type { VehicleType } from "@my-types/vehicleType";
import { API_ENDPOINTS } from "@constants/index";
import callApi from "@utils/apiCaller";

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
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

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
				const { status, data } = await callApi(
					{
						method: "GET",
						url: API_ENDPOINTS.VEHICLE_TYPE.BASE,
					},
					{ returnFullResponse: true }
				);

				if ((status === 200 || status === 304) && data === null) {
					throw new Error("Server returned empty set");
				}

				setVehicleTypes(data);
			} catch (err: any) {
				setErrorMessage(err.message);
				console.error("Vehicle type fetch error:", err);
			} finally {
				setLoadingTypes(false);
			}
		};

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

		formData.numberPlate = formData.numberPlate.trim();
		formData.manufacturer = formData.manufacturer.trim();
		formData.model = formData.model.trim();

		if (!formData.vehicleTypeId)
			newErrors.vehicleTypeId = "Please select a vehicle type";
		if (!formData.numberPlate)
			newErrors.numberPlate = "Number plate is required";
		if (!formData.manufacturer)
			newErrors.manufacturer = "Manufacturer is required";
		if (!formData.model) newErrors.model = "Model is required";

		setErrors(newErrors);
		return Object.values(newErrors).every((error) => error === "");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			setIsLoading(true);

			const { status, data } = await callApi({
				method: "PUT",
				url: API_ENDPOINTS.VEHICLE.UPDATE(vehicle.id),
				data: formData,
			});

			if (status !== 200) {
				throw new Error(`Server Error: ${data.message}`);
			}
			onSave({
				id: data.vehicle.id,
				numberPlate: data.vehicle.numberPlate,
				vehicleTypeId: data.vehicle.vehicleTypeId,
				manufacturer: data.vehicle.manufacturer,
				model: data.vehicle.model,
			});
			onClose();
		} catch (err: any) {
			setErrorMessage(err.message);
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Update vehicle information</DialogTitle>
			<DialogContent>
				{errors.general && (
					<Alert
						color="error"
						icon={<ErrorIcon color="error" />}
						sx={{
							marginBottom: 2,
							display: "flex",
							justifyContent: "flex-start",
							alignItems: "center",
						}}
					>
						<Typography variant="body2" color="error">
							{errorMessage}
						</Typography>
					</Alert>
				)}
				<Box component="form" onSubmit={handleSubmit} sx={{ p: 1 }}>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 6 }}>
							<FormControl
								fullWidth
								error={!!errors.vehicleTypeId}
							>
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
											<MenuItem
												key={type.id}
												value={type.id}
											>
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

						<Grid size={{ xs: 12, md: 6 }}>
							<FormControl fullWidth error={!!errors.numberPlate}>
								<TextField
									fullWidth
									label="Number Plate"
									value={formData.numberPlate}
									onChange={(e) =>
										handleInputChange(
											"numberPlate",
											e.target.value
										)
									}
									error={!!errors.numberPlate}
									helperText={errors.numberPlate}
									placeholder="Enter number plate"
								/>
							</FormControl>
						</Grid>

						<Grid size={{ xs: 12, md: 6 }}>
							<FormControl
								fullWidth
								error={!!errors.manufacturer}
							>
								<TextField
									fullWidth
									label="Manufacturer"
									value={formData.manufacturer}
									onChange={(e) =>
										handleInputChange(
											"manufacturer",
											e.target.value
										)
									}
									error={!!errors.manufacturer}
									helperText={errors.manufacturer}
									placeholder="Enter manufacturer"
								/>
							</FormControl>
						</Grid>

						<Grid size={{ xs: 12, md: 6 }}>
							<FormControl fullWidth error={!!errors.model}>
								<TextField
									fullWidth
									label="Model"
									value={formData.model}
									onChange={(e) =>
										handleInputChange(
											"model",
											e.target.value
										)
									}
									error={!!errors.model}
									helperText={errors.model}
									placeholder="Enter model"
								/>
							</FormControl>
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
					startIcon={isLoading ? <CircularProgress /> : <EditIcon />}
					sx={{
						backgroundColor: "#1976d2",
						"&:hover": { backgroundColor: "#1565c0" },
					}}
					onClick={handleSubmit}
				>
					{isLoading ? "Updating..." : "Edit"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditVehicleForm;
