import React, { useEffect, useState, useMemo } from "react";
import {
	Alert,
	Autocomplete,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	TextField,
	Switch,
	Typography,
	ToggleButton,
	ToggleButtonGroup,
	Paper,
	InputAdornment,
} from "@mui/material";
import {
	AltRoute as RouteIcon,
	DirectionsCar as CarIcon,
	Repeat as RepeatIcon,
	ArrowForward as ArrowIcon,
	Event as CalendarIcon,
} from "@mui/icons-material";
// MUI X Date Picker Imports
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import axios from "axios";
import { addSeconds, format, isValid } from "date-fns";

// Mock imports based on context
import { API_ENDPOINTS } from "@constants/api";
import type { Route, Vehicle } from "@my-types";
import type { CreateTripDTO } from "@my-types/trip";
import { TripStatus, TripRepeatFrequency } from "@my-types/trip";
import { formatDistance } from "@utils/map";
import { RouteMap } from "@components/map";
import callApi from "@utils/apiCaller";

interface CreateTripFormProps {
	open: boolean;
	onClose: () => void;
	onCreated?: () => void;
}

const CreateTripForm: React.FC<CreateTripFormProps> = ({
	open,
	onClose,
	onCreated,
}) => {
	const [tripType, setTripType] = useState<"oneWay" | "roundTrip">("oneWay");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Data State
	const [routes, setRoutes] = useState<Route[]>([]);
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [isLoadingData, setIsLoadingData] = useState(true);

	// Form State
	const [selectedOutboundRoute, setSelectedOutboundRoute] =
		useState<Route | null>(null);
	const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(
		null
	);

	const [dates, setDates] = useState<{
		outboundDepart: Date | null;
		returnDepart: Date | null;
	}>({
		outboundDepart: null,
		returnDepart: null,
	});

	const mapStops = useMemo(() => {
		if (!selectedOutboundRoute?.stops) return undefined;
		
		// Convert RouteStops to the format RouteMap expects
		return [...selectedOutboundRoute.stops]
			.sort((a, b) => a.stopOrder - b.stopOrder)
			.map((s) => ({
				latitude: Number(s.location?.latitude),
				longitude: Number(s.location?.longitude),
				name: s.location?.name,
				address: s.location?.address,
			}));
	}, [selectedOutboundRoute]);

	// Derived state for read-only arrivals
	const outboundArrivalISO = useMemo(() => {
		if (
			!dates.outboundDepart ||
			!isValid(dates.outboundDepart) ||
			!selectedOutboundRoute?.duration
		)
			return null;
		return addSeconds(dates.outboundDepart, selectedOutboundRoute.duration);
	}, [dates.outboundDepart, selectedOutboundRoute]);

	const returnArrivalISO = useMemo(() => {
		if (
			!dates.returnDepart ||
			!isValid(dates.returnDepart) ||
			!selectedOutboundRoute?.duration
		)
			return null;
		return addSeconds(dates.returnDepart, selectedOutboundRoute.duration);
	}, [dates.returnDepart, selectedOutboundRoute]);

	// Recurrence State
	const [isRepeated, setIsRepeated] = useState(false);
	const [repeatFrequency, setRepeatFrequency] = useState<TripRepeatFrequency>(
		TripRepeatFrequency.NONE
	);
	const [repeatEndDate, setRepeatEndDate] = useState<Date | null>(null);

	// Data Fetching
	useEffect(() => {
		if (!open) return;
		const fetchData = async () => {
			setIsLoadingData(true);
			try {
				const [routesRes, vehiclesRes] = await Promise.all([
					axios.get(API_ENDPOINTS.ROUTE.BASE),
					axios.get(API_ENDPOINTS.VEHICLE.BASE),
				]);
				// const [routesRes, vehiclesRes] = await Promise.all([
				// 	callApi({method: "GET", url: API_ENDPOINTS.ROUTE.BASE}),
				// 	callApi({method: "GET", url: API_ENDPOINTS.VEHICLE.BASE}),
				// ]);
				setRoutes(
					Array.isArray(routesRes.data)
						? routesRes.data
						: routesRes.data.data || []
				);
				setVehicles(
					Array.isArray(vehiclesRes.data)
						? vehiclesRes.data
						: vehiclesRes.data.data || vehiclesRes.data.rows || [] 
				);
			} catch (err) {
				console.error("Failed to load form data", err);
				setError("Could not load routes or vehicles.");
			} finally {
				setIsLoadingData(false);
			}
		};
		fetchData();
	}, [open]);

	const handleSubmit = async () => {
		setError(null);
		setIsSubmitting(true);

		if (
			!selectedOutboundRoute ||
			!selectedVehicle ||
			!dates.outboundDepart
		) {
			setError("Missing required outbound fields.");
			setIsSubmitting(false);
			return;
		}
		if (tripType === "roundTrip" && !dates.returnDepart) {
			setError("Missing return departure date.");
			setIsSubmitting(false);
			return;
		}

		try {
			const payload: CreateTripDTO = {
				routeId: selectedOutboundRoute.id,
				vehicleId: selectedVehicle.id,
				startTime: dates.outboundDepart,
				endTime: outboundArrivalISO,
				status: TripStatus.SCHEDULED,
				isTemplate: isRepeated,
				isRoundTrip: tripType === "roundTrip",
			};

			if (tripType === "roundTrip" && dates.returnDepart) {
				payload.returnStartTime = dates.returnDepart;
				payload.returnEndTime = returnArrivalISO;
			}

			if (isRepeated) {
				if (
					!repeatFrequency ||
					repeatFrequency === TripRepeatFrequency.NONE
				) {
					throw new Error(
						"Select a frequency for the recurring trip."
					);
				}
				(payload as any).repeatFrequency = repeatFrequency;
				(payload as any).repeatEndDate = repeatEndDate;
			}

			const { status, data } = await callApi({method: "POST", url: API_ENDPOINTS.TRIP.CREATE, data: payload}, {returnFullResponse: true});
			
			if (status !== 201 || !data) {
				throw new Error("Failed to create trip.");
			}

			onCreated?.();
			onClose();
		} catch (err: any) {
			setError(
				err.response?.data?.message ||
					err.message ||
					"Failed to create trip."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderArrivalPreview = (arrivalDate: Date | null) => {
		if (!arrivalDate || !isValid(arrivalDate)) return null;
		return (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1,
					mt: 1,
					color: "text.secondary",
				}}
			>
				<ArrowIcon fontSize="small" />
				<Typography variant="body2">
					Arrives <strong>{format(arrivalDate, "HH:mm")}</strong> (
					{format(arrivalDate, "MMM d")})
				</Typography>
			</Box>
		);
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
				<DialogTitle
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography variant="h5" fontWeight={"bold"}>
						Create Trip
					</Typography>
					<ToggleButtonGroup
						value={tripType}
						exclusive
						onChange={(_, val) => val && setTripType(val)}
						size="small"
						aria-label="trip type"
					>
						<ToggleButton value="oneWay">One Way</ToggleButton>
						<ToggleButton value="roundTrip">
							Round Trip
						</ToggleButton>
					</ToggleButtonGroup>
				</DialogTitle>

				<DialogContent dividers>
					{isLoadingData ? (
						<Box p={5} display="flex" justifyContent="center">
							<CircularProgress />
						</Box>
					) : (
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								gap: 3,
								py: 1,
							}}
						>
							{error && <Alert severity="error">{error}</Alert>}

							{/* LOGISTICS */}
							<Grid container spacing={2}>
								<Grid size={{ xs: 12, md: 6 }}>
									<Autocomplete
										options={routes}
										getOptionLabel={(r) =>
											r.name || `Route #${r.id}`
										}
										value={selectedOutboundRoute}
										onChange={(_, val) =>
											setSelectedOutboundRoute(val)
										}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Route"
												placeholder="Select Route"
												InputProps={{
													...params.InputProps,
													startAdornment: (
														<InputAdornment position="start">
															<RouteIcon color="action" />
														</InputAdornment>
													),
												}}
												helperText={
													selectedOutboundRoute?.distance
														? `Total Distance: ${formatDistance(
																selectedOutboundRoute.distance
														  )}`
														: " "
												}
											/>
										)}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 6 }}>
									<Autocomplete
										options={vehicles}
										getOptionLabel={(v) =>
											`${v.manufacturer} ${v.model} (${v.numberPlate})`
										}
										value={selectedVehicle}
										onChange={(_, val) =>
											setSelectedVehicle(val)
										}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Vehicle"
												placeholder="Select Vehicle"
												slotProps={{
													input: {
														...params.InputProps,
														startAdornment: (
															<InputAdornment position="start">
																<CarIcon color="action" />
															</InputAdornment>
														),
													},
												}}
												helperText=" " // Spacer to align with route helper
											/>
										)}
									/>
								</Grid>
							</Grid>

							{mapStops && (
								<Paper 
                                    variant="outlined" 
                                    sx={{ 
                                        height: 200, 
                                        overflow: 'hidden', 
                                        borderRadius: 1,
                                        mt: -2 // Pull it up slightly closer to inputs
                                    }}
                                >
									<RouteMap 
                                        stops={mapStops} 
                                        height="100%" 
                                        zoom={10} 
                                        showMarkers={true}
                                        showRoute={true}
                                    />
								</Paper>
							)}

							<Divider />

							{/* SCHEDULE */}
							<Box>
								<Typography
									variant="subtitle2"
									color="text.secondary"
									gutterBottom
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1,
										mb: 2,
									}}
								>
									<CalendarIcon fontSize="small" /> SCHEDULE
								</Typography>

								<Grid
									container
									spacing={3}
									alignItems="flex-start"
								>
									<Grid
										size={{
											xs: 12,
											md:
												tripType === "roundTrip"
													? 6
													: 12,
										}}
									>
										<DateTimePicker
											label="Departure"
											value={dates.outboundDepart}
											onChange={(newValue) =>
												setDates({
													...dates,
													outboundDepart: newValue,
												})
											}
											disablePast
											slotProps={{
												textField: { fullWidth: true },
											}}
										/>
										{renderArrivalPreview(
											outboundArrivalISO
										)}
									</Grid>

									{tripType === "roundTrip" && (
										<Grid size={{ xs: 12, md: 6 }}>
											<DateTimePicker
												label="Return Departure"
												value={dates.returnDepart}
												onChange={(newValue) =>
													setDates({
														...dates,
														returnDepart: newValue,
													})
												}
												minDateTime={
													dates.outboundDepart ||
													undefined
												}
												slotProps={{
													textField: {
														fullWidth: true,
														helperText:
															"Must be after outbound departure",
													},
												}}
											/>
											{renderArrivalPreview(
												returnArrivalISO
											)}
										</Grid>
									)}
								</Grid>
							</Box>

							{/* RECURRENCE */}
							<Paper
								variant="outlined"
								sx={{
									p: 2,
									bgcolor: isRepeated
										? "action.hover"
										: "transparent",
									transition: "0.3s",
								}}
							>
								<Box
									display="flex"
									justifyContent="space-between"
									alignItems="center"
								>
									<Box
										display="flex"
										alignItems="center"
										gap={1}
									>
										<RepeatIcon
											color={
												isRepeated
													? "primary"
													: "disabled"
											}
										/>
										<Box>
											<Typography variant="subtitle2">
												Recurring Trip
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
											>
												Create a repeating template
											</Typography>
										</Box>
									</Box>
									<Switch
										checked={isRepeated}
										onChange={(e) => {
											setIsRepeated(e.target.checked);
											if (!e.target.checked) {
												setRepeatFrequency(
													TripRepeatFrequency.NONE
												);
												setRepeatEndDate(null);
											}
										}}
									/>
								</Box>

								{isRepeated && (
									<Box mt={2}>
										<Grid container spacing={2}>
											<Grid size={{ xs: 12, md: 8 }}>
												<ToggleButtonGroup
													value={repeatFrequency}
													exclusive
													onChange={(_, v) =>
														v &&
														setRepeatFrequency(v)
													}
													fullWidth
													size="small"
												>
													<ToggleButton
														value={
															TripRepeatFrequency.DAILY
														}
													>
														Daily
													</ToggleButton>
													<ToggleButton
														value={
															TripRepeatFrequency.WEEKLY
														}
													>
														Weekly
													</ToggleButton>
													<ToggleButton
														value={
															TripRepeatFrequency.MONTHLY
														}
													>
														Monthly
													</ToggleButton>
												</ToggleButtonGroup>
											</Grid>
											<Grid size={{ xs: 12, md: 4 }}>
												<DatePicker
													label="End Date"
													value={repeatEndDate}
													onChange={(newValue) =>
														setRepeatEndDate(
															newValue
														)
													}
													disablePast
													slotProps={{
														textField: {
															size: "small",
															fullWidth: true,
														},
													}}
												/>
											</Grid>
										</Grid>
									</Box>
								)}
							</Paper>
						</Box>
					)}

					
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3 }}>
					<Button onClick={onClose} color="inherit">
						Cancel
					</Button>
					<Button
						variant="contained"
						disabled={isSubmitting || isLoadingData}
						onClick={handleSubmit}
						startIcon={
							isSubmitting ? (
								<CircularProgress size={20} />
							) : (
								<CarIcon />
							)
						}
					>
						{isSubmitting ? "Processing..." : "Confirm Trip"}
					</Button>
				</DialogActions>
			</Dialog>
		</LocalizationProvider>
	);
};

export default CreateTripForm;
