import React, { useEffect, useState } from "react";
import {
	Box,
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
	FormHelperText,
	CircularProgress,
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	Add as AddIcon,
	Error as ErrorIcon,
} from "@mui/icons-material";
import { VehicleStatus } from "@my-types/vehicle";
import { API_ENDPOINTS } from "@constants/index";
import type { VehicleType } from "@my-types/vehicleType";
import callApi from "@utils/apiCaller";
import { SeatLayoutPreview } from "@components/seatmap";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, type VehicleFormData, type VehicleInput } from "@schemas/vehicleSchema";

interface CreateVehicleFormProps {
	open: boolean;
	onClose: () => void;
}

const CreateVehicleForm: React.FC<CreateVehicleFormProps> = ({
	open,
	onClose,
}) => {
	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<VehicleInput, any, VehicleFormData>({
		resolver: zodResolver(vehicleSchema),
		defaultValues: {
			numberPlate: "",
			manufacturer: "",
			model: "",
			status: VehicleStatus.ACTIVE,
			vehicleTypeId: undefined,
		},
	});

	const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | null>(null);

	const watchedVehicleTypeId = watch("vehicleTypeId");

	useEffect(() => {
		if (open) {
			reset({
				numberPlate: "",
				manufacturer: "",
				model: "",
				status: VehicleStatus.ACTIVE,
				vehicleTypeId: undefined,
			});
			setErrorMessage(null);
			setSelectedVehicleType(null);
		}
	}, [open, reset]);

	useEffect(() => {
		const getVehicleTypes = async () => {
			try {
				const { data, status } = await callApi(
					{
						method: "GET",
						url: API_ENDPOINTS.VEHICLE_TYPE.BASE,
					},
					{ returnFullResponse: true }
				);

				if (status === 200 || status === 304) {
					if (Array.isArray(data)) {
						setVehicleTypes(data);
					} else if (data && Array.isArray(data.data)) {
						setVehicleTypes(data.data);
					}
				}
			} catch (err: any) {
				setErrorMessage(err.message);
				console.error("Vehicle type fetch error:", err);
			}
		};

		if (open) {
			getVehicleTypes();
		}
	}, [open]);

	useEffect(() => {
		if (watchedVehicleTypeId) {
			const type = vehicleTypes.find((t) => t.id === Number(watchedVehicleTypeId));
			setSelectedVehicleType(type || null);
		} else {
			setSelectedVehicleType(null);
		}
	}, [watchedVehicleTypeId, vehicleTypes]);

	const onSubmit = async (data: VehicleFormData) => {
		try {
			const { status, data: resData } = await callApi({
				method: "POST",
				url: API_ENDPOINTS.VEHICLE.BASE,
				data: data,
			});
			if (status !== 201) {
				throw new Error(resData.message ?? "Failed to create vehicle");
			}
			alert("Vehicle created successfully!");
			onClose();
		} catch (err: any) {
			console.error("Error creating vehicle:", err);
			setErrorMessage(
				err.message ?? "Failed to create vehicle. Please try again."
			);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Add new Vehicle</DialogTitle>
			<DialogContent>
				<Box component="form" onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={3} marginTop={1}>
						{/* Vehicle Type */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="vehicleTypeId"
								control={control}
								render={({ field }) => (
									<FormControl
										fullWidth
										error={!!errors.vehicleTypeId}
									>
										<InputLabel>Vehicle type</InputLabel>
										<Select
											{...field}
											label="Vehicle type"
											value={field.value || ""}
											// Note: onChange value is handled by controller based on schema
										>
											{vehicleTypes.map((type) => (
												<MenuItem key={type.id} value={type.id}>
													{type.name}
												</MenuItem>
											))}
										</Select>
										<FormHelperText>{errors.vehicleTypeId?.message}</FormHelperText>
									</FormControl>
								)}
							/>
						</Grid>

						{/* Manufacturer */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="manufacturer"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										value={field.value || ""}
										fullWidth
										label="Manufacturer"
										error={!!errors.manufacturer}
										helperText={errors.manufacturer?.message}
										placeholder="Enter manufacturer name"
									/>
								)}
							/>
						</Grid>

						{/* Model */}
						<Grid size={{ xs: 12, sm: 4 }}>
							<Controller
								name="model"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										value={field.value || ""}
										fullWidth
										label="Model"
										error={!!errors.model}
										helperText={errors.model?.message}
										placeholder="Enter vehicle model"
									/>
								)}
							/>
						</Grid>

						{/* License Plate */}
						<Grid size={{ xs: 12, sm: 5 }}>
							<Controller
								name="numberPlate"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										label="License Plate"
										error={!!errors.numberPlate}
										helperText={errors.numberPlate?.message}
										placeholder="Enter license plate (e.g., 51N 0000)"
									/>
								)}
							/>
						</Grid>

						{/* Status */}
						<Grid size={{ xs: 12, sm: 3 }}>
							<Controller
								name="status"
								control={control}
								render={({ field }) => (
									<FormControl fullWidth error={!!errors.status}>
										<InputLabel>Status</InputLabel>
										<Select
											{...field}
											label="Status"
										>
											{Object.values(VehicleStatus).map((status) => (
												<MenuItem key={status} value={status}>
													{status.charAt(0).toUpperCase() +
														status.slice(1).toLowerCase()}
												</MenuItem>
											))}
										</Select>
										<FormHelperText>{errors.status?.message}</FormHelperText>
									</FormControl>
								)}
							/>
						</Grid>

						{selectedVehicleType && (
							<Grid size={{ xs: 12 }}>
								<SeatLayoutPreview
									seatLayout={selectedVehicleType.seatLayout}
								/>
							</Grid>
						)}
					</Grid>
				</Box>
			</DialogContent>
			<DialogActions>
				{errorMessage && (
					<Alert icon={<ErrorIcon color="error" />}>
						{errorMessage}
					</Alert>
				)}

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
					startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />}
					sx={{
						backgroundColor: "#1976d2",
						"&:hover": {
							backgroundColor: "#1565c0",
						},
						minWidth: 120,
					}}
					disabled={isSubmitting}
					onClick={handleSubmit(onSubmit)}
				>
					{isSubmitting ? "Adding..." : "Confirm"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CreateVehicleForm;