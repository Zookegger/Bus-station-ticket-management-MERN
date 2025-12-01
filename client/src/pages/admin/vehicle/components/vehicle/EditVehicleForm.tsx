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
	FormHelperText,
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	Edit as EditIcon,
	Error as ErrorIcon,
} from "@mui/icons-material";
import { VehicleStatus, type UpdateVehicleDTO } from "@my-types/vehicle";
import type { VehicleDetail } from "@my-types/vehicleList";
import type { VehicleType } from "@my-types/vehicleType";
import { API_ENDPOINTS } from "@constants/index";
import callApi from "@utils/apiCaller";
import { SeatLayoutPreview } from "@components/seatmap";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, type VehicleFormData } from "@schemas/vehicleSchema";

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
	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<VehicleFormData>({
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
	const [loadingTypes, setLoadingTypes] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | null>(null);

	const watchedVehicleTypeId = watch("vehicleTypeId");

	useEffect(() => {
		if (vehicle) {
			reset({
				numberPlate: vehicle.numberPlate || "",
				vehicleTypeId: vehicle.vehicleType.id,
				manufacturer: vehicle.manufacturer || "",
				status: vehicle.status as VehicleStatus,
				model: vehicle.model || "",
			});
		}
	}, [vehicle, reset]);

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

				const items = Array.isArray(data) ? data : data?.data || [];

				if (Array.isArray(items)) {
					setVehicleTypes(items);
				}
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

	useEffect(() => {
		if (watchedVehicleTypeId) {
			const type = vehicleTypes.find((t) => t.id === watchedVehicleTypeId);
			setSelectedVehicleType(type || null);
		} else {
			setSelectedVehicleType(null);
		}
	}, [watchedVehicleTypeId, vehicleTypes]);

	if (!vehicle) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography variant="h6" color="error">
					Vehicle data not found
				</Typography>
			</Box>
		);
	}

	const onSubmit: SubmitHandler<VehicleFormData> = async (data) => {
		try {
			const { status, data: resData } = await callApi({
				method: "PUT",
				url: API_ENDPOINTS.VEHICLE.UPDATE(vehicle.id),
				data: data,
			});

			if (status !== 200) {
				throw new Error(`Server Error: ${resData.message}`);
			}
			onSave({
				id: resData.vehicle.id,
				numberPlate: resData.vehicle.numberPlate,
				vehicleTypeId: resData.vehicle.vehicleTypeId,
				manufacturer: resData.vehicle.manufacturer,
				model: resData.vehicle.model,
				status: resData.vehicle.status,
			});
			onClose();
		} catch (err: any) {
			setErrorMessage(err.message);
			console.error(err);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Update vehicle information</DialogTitle>
			<DialogContent>
				{errorMessage && (
					<Alert
						color="error"
						icon={<ErrorIcon color="error" />}
						sx={{ mb: 2 }}
					>
						<Typography variant="body2">{errorMessage}</Typography>
					</Alert>
				)}
				<Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 6 }}>
							<Controller
								name="vehicleTypeId"
								control={control}
								render={({ field }) => (
									<FormControl
										fullWidth
										error={!!errors.vehicleTypeId}
									>
										<InputLabel>Select a vehicle type</InputLabel>
										<Select
											{...field}
											label="Select a vehicle type"
											value={field.value || ""}
											onChange={(e) => field.onChange(Number(e.target.value))}
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
										<FormHelperText>{errors.vehicleTypeId?.message}</FormHelperText>
									</FormControl>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, md: 6 }}>
							<Controller
								name="numberPlate"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										label="Number Plate"
										error={!!errors.numberPlate}
										helperText={errors.numberPlate?.message}
										placeholder="Enter number plate"
									/>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, md: 6 }}>
							<Controller
								name="manufacturer"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										label="Manufacturer"
										error={!!errors.manufacturer}
										helperText={errors.manufacturer?.message}
										placeholder="Enter manufacturer"
									/>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, md: 6 }}>
							<Controller
								name="model"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										label="Model"
										error={!!errors.model}
										helperText={errors.model?.message}
										placeholder="Enter model"
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
										<InputLabel>Select a status</InputLabel>
										<Select
											{...field}
											label="Select a status"
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
					startIcon={isSubmitting ? <CircularProgress size={20} /> : <EditIcon />}
					sx={{
						backgroundColor: "#1976d2",
						"&:hover": { backgroundColor: "#1565c0" },
					}}
					disabled={isSubmitting}
					onClick={handleSubmit(onSubmit)}
				>
					{isSubmitting ? "Updating..." : "Edit"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditVehicleForm;
