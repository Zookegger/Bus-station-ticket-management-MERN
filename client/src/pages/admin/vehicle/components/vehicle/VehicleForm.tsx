import React, { useState, useEffect, useMemo } from "react";
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
	IconButton,
	Divider,
	Stack,
	Chip,
	Paper,
	Autocomplete,
} from "@mui/material";
import {
	Close as CloseIcon,
	Add as AddIcon,
	Edit as EditIcon,
	DirectionsBus as BusIcon,
} from "@mui/icons-material";
import { VehicleStatus } from "@my-types/vehicle";
import type { VehicleDetail } from "@my-types/vehicleList";
import type { VehicleType } from "@my-types/vehicleType";
import { API_ENDPOINTS } from "@constants/index";

import callApi from "@utils/apiCaller";
import { SeatLayoutPreview } from "@components/seatmap";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	vehicleSchema,
	type VehicleFormData,
	type VehicleInput,
} from "@schemas/vehicleSchema";

interface VehicleFormProps {
	open: boolean;
	initialData?: VehicleDetail | null;
	onClose: () => void;
	onSuccess?: (message?: string) => void;
}

// Helper: Consistent status colors
const getStatusColor = (status: VehicleStatus) => {
	switch (status) {
		case VehicleStatus.ACTIVE:
			return "success";
		case VehicleStatus.MAINTENANCE:
			return "warning";
		case VehicleStatus.INACTIVE:
			return "error";
		default:
			return "default";
	}
};

const VehicleForm: React.FC<VehicleFormProps> = ({
	open,
	initialData,
	onClose,
	onSuccess,
}) => {
	const isEditMode = !!initialData;

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
	const [loadingTypes, setLoadingTypes] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const watchedVehicleTypeId = watch("vehicleTypeId");

	// Efficiently find the selected type object for preview & autocomplete
	const selectedVehicleType = useMemo(
		() =>
			vehicleTypes.find((t) => t.id === Number(watchedVehicleTypeId)) ||
			null,
		[watchedVehicleTypeId, vehicleTypes]
	);

	// 1. Reset Form Effect
	useEffect(() => {
		if (open) {
			if (isEditMode && initialData) {
				reset({
					numberPlate: initialData.numberPlate || "",
					vehicleTypeId: initialData.vehicleType.id,
					manufacturer: initialData.manufacturer || "",
					status: initialData.status as VehicleStatus,
					model: initialData.model || "",
				});
			} else {
				reset({
					numberPlate: "",
					manufacturer: "",
					model: "",
					status: VehicleStatus.ACTIVE,
					vehicleTypeId: undefined,
				});
			}
			setErrorMessage(null);
		}
	}, [open, isEditMode, initialData, reset]);

	// 2. Fetch Vehicle Types Effect
	useEffect(() => {
		if (!open) return;

		const getVehicleTypes = async () => {
			setLoadingTypes(true);
			try {
				const data = await callApi({
					method: "GET",
					url: API_ENDPOINTS.VEHICLE_TYPE.BASE,
				});
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

		getVehicleTypes();
	}, [open]);

	const onSubmit: SubmitHandler<VehicleFormData> = async (data) => {
		setErrorMessage(null);
		try {
			const url = isEditMode
				? API_ENDPOINTS.VEHICLE.UPDATE(initialData!.id)
				: API_ENDPOINTS.VEHICLE.BASE;
			const method = isEditMode ? "PUT" : "POST";

			const { status, data: resData } = await callApi({
				method,
				url,
				data,
			});

			if (
				(isEditMode && status !== 200) ||
				(!isEditMode && status !== 201)
			) {
				throw new Error(
					resData.message ||
						`Failed to ${isEditMode ? "update" : "create"} vehicle`
				);
			}

			if (onSuccess)
				onSuccess(
					isEditMode
						? "Vehicle updated successfully."
						: "Vehicle created successfully."
				);
			onClose();
		} catch (err: any) {
			setErrorMessage(err.message || "An error occurred");
			console.error(err);
		}
	};

	return (
		<Dialog
			open={open}
			// Prevent accidental closure when clicking backdrop
			onClose={(_event, reason) => {
				if (reason !== "backdropClick") onClose();
			}}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					pb: 1,
				}}
			>
				<Stack direction="row" spacing={1} alignItems="center">
					<BusIcon color="primary" />
					<Typography variant="h6" component="span" fontWeight="bold">
						{isEditMode ? "Update Vehicle" : "New Vehicle Config"}
					</Typography>
				</Stack>
				<IconButton onClick={onClose} size="small">
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<Divider />

			<DialogContent sx={{ display: "flex" }}>
				<Box
					component="form"
					id="vehicle-form"
					onSubmit={handleSubmit(onSubmit)}
				>
					{errorMessage && (
						<Alert
							severity="error"
							sx={{ mb: 3 }}
							action={
								<IconButton
									size="small"
									color="inherit"
									onClick={() => setErrorMessage(null)}
								>
									<CloseIcon fontSize="small" />
								</IconButton>
							}
						>
							{errorMessage}
						</Alert>
					)}

					<Grid container spacing={4}>
						{/* --- LEFT COLUMN: INPUTS --- */}
						<Grid size={{ xs: 12, md: 7 }}>
							<Stack spacing={3}>
								{/* Section A: Identification */}
								<Box>
									<Typography
										variant="subtitle2"
										color="text.secondary"
										sx={{
											mb: 1.5,
											textTransform: "uppercase",
											letterSpacing: 0.5,
											fontSize: "0.75rem",
										}}
									>
										Identification
									</Typography>
									<Grid container spacing={2}>
										<Grid size={{ xs: 12, sm: 6 }}>
											<Controller
												name="vehicleTypeId"
												control={control}
												render={({
													field: {
														onChange,
														value,
														...fieldProps
													},
												}) => (
													<Autocomplete
														{...fieldProps}
														options={vehicleTypes}
														getOptionLabel={(
															option
														) => option.name}
														isOptionEqualToValue={(
															option,
															val
														) =>
															option.id === val.id
														}
														loading={loadingTypes}
														disabled={loadingTypes}
														value={
															selectedVehicleType
														} // Derived from state
														onChange={(
															_,
															newValue
														) => {
															onChange(
																newValue
																	? newValue.id
																	: undefined
															);
														}}
														renderInput={(
															params
														) => (
															<TextField
																{...params}
																label="Vehicle Type"
																error={
																	!!errors.vehicleTypeId
																}
																helperText={
																	errors
																		.vehicleTypeId
																		?.message
																}
																placeholder="Search type..."
																slotProps={{
																	input: {
																		...params.InputProps,
																		endAdornment:
																			(
																				<React.Fragment>
																					{loadingTypes ? (
																						<CircularProgress
																							color="inherit"
																							size={
																								20
																							}
																						/>
																					) : null}
																					{
																						params
																							.InputProps
																							.endAdornment
																					}
																				</React.Fragment>
																			),
																	},
																}}
															/>
														)}
													/>
												)}
											/>
										</Grid>

										<Grid size={{ xs: 12, sm: 6 }}>
											<Controller
												name="numberPlate"
												control={control}
												render={({ field }) => (
													<TextField
														{...field}
														fullWidth
														label="License Plate"
														placeholder="e.g. 59F-123.45"
														error={
															!!errors.numberPlate
														}
														helperText={
															errors.numberPlate
																?.message
														}
														slotProps={{
															input: {
																style: {
																	textTransform:
																		"uppercase",
																},
															},
														}}
													/>
												)}
											/>
										</Grid>
									</Grid>
								</Box>

								<Divider sx={{ borderStyle: "dashed" }} />

								{/* Section B: Specs & Status */}
								<Box>
									<Typography
										variant="subtitle2"
										color="text.secondary"
										sx={{
											mb: 1.5,
											textTransform: "uppercase",
											letterSpacing: 0.5,
											fontSize: "0.75rem",
										}}
									>
										Specifications & Status
									</Typography>
									<Grid container spacing={2}>
										<Grid size={{ xs: 12, sm: 6 }}>
											<Controller
												name="manufacturer"
												control={control}
												render={({ field }) => (
													<TextField
														{...field}
														fullWidth
														label="Manufacturer"
														error={
															!!errors.manufacturer
														}
														helperText={
															errors.manufacturer
																?.message
														}
													/>
												)}
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 6 }}>
											<Controller
												name="model"
												control={control}
												render={({ field }) => (
													<TextField
														{...field}
														fullWidth
														label="Model"
														error={!!errors.model}
														helperText={
															errors.model
																?.message
														}
													/>
												)}
											/>
										</Grid>
										<Grid size={{ xs: 12 }}>
											<Controller
												name="status"
												control={control}
												render={({ field }) => (
													<FormControl
														fullWidth
														error={!!errors.status}
													>
														<InputLabel>
															Operational Status
														</InputLabel>
														<Select
															{...field}
															label="Operational Status"
															renderValue={(
																selected
															) => (
																<Chip
																	size="small"
																	label={
																		selected
																	}
																	color={getStatusColor(
																		selected as VehicleStatus
																	)}
																	sx={{
																		fontWeight:
																			"bold",
																		textTransform:
																			"uppercase",
																	}}
																/>
															)}
														>
															{Object.values(
																VehicleStatus
															).map((status) => (
																<MenuItem
																	key={status}
																	value={
																		status
																	}
																>
																	<Stack
																		direction="row"
																		alignItems="center"
																		spacing={
																			1
																		}
																	>
																		<Box
																			sx={{
																				width: 8,
																				height: 8,
																				borderRadius:
																					"50%",
																				bgcolor: `${getStatusColor(
																					status
																				)}.main`,
																			}}
																		/>
																		<Typography
																			variant="body2"
																			sx={{
																				textTransform:
																					"capitalize",
																			}}
																		>
																			{status.toLowerCase()}
																		</Typography>
																	</Stack>
																</MenuItem>
															))}
														</Select>
														<FormHelperText>
															{
																errors.status
																	?.message
															}
														</FormHelperText>
													</FormControl>
												)}
											/>
										</Grid>
									</Grid>
								</Box>
							</Stack>
						</Grid>

						{/* --- RIGHT COLUMN: PREVIEW --- */}
						<Grid
							size={{ xs: 12, md: 5 }}
							display="flex"
							flexDirection={"column"}
							flex={1}
						>
							<Paper
								variant="outlined"
								sx={{
									display: "flex",
									bgcolor: "grey.50",
									p: 2,
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									borderStyle: "dashed",
									borderRadius: 2,
                           flex: 1
								}}
							>
								{selectedVehicleType ? (
									<>
										<Typography
											variant="overline"
											color="text.secondary"
											gutterBottom
										>
											Seat Layout Preview (
											{selectedVehicleType.name})
										</Typography>
										<Box
											sx={{
												flexGrow: 1,
												width: "100%",
												overflow: "auto",
												display: "flex",
												justifyContent: "center",
												alignItems: "flex-start",
											}}
										>
											<SeatLayoutPreview
												seatLayout={
													selectedVehicleType.seatLayout
												}
											/>
										</Box>
									</>
								) : (
									<Stack
										display={"flex"}
										alignItems="center"
                              justifyContent={"center"}
										spacing={1}
										flex={1}
									>
										<BusIcon
											sx={{
												fontSize: 48,
												opacity: 0.5,
											}}
										/>
										<Typography variant="body2">
											Select a vehicle type to see layout
										</Typography>
									</Stack>
								)}
							</Paper>
						</Grid>
					</Grid>
				</Box>
			</DialogContent>

			<Divider />

			<DialogActions sx={{ px: 3, py: 2 }}>
				<Button
					onClick={onClose}
					color="inherit"
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					form="vehicle-form" // IMPORTANT: Binds to form ID
					variant="contained"
					disabled={isSubmitting}
					startIcon={
						isSubmitting ? (
							<CircularProgress size={20} color="inherit" />
						) : isEditMode ? (
							<EditIcon />
						) : (
							<AddIcon />
						)
					}
					sx={{ minWidth: 140 }}
				>
					{isSubmitting
						? isEditMode
							? "Updating..."
							: "Creating..."
						: isEditMode
						? "Save Changes"
						: "Create Vehicle"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default VehicleForm;
