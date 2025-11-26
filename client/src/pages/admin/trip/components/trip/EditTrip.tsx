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
	Grid,
	Typography,
	FormControlLabel,
	Paper,
	InputAdornment,
	Switch,
	ToggleButton,
	ToggleButtonGroup,
	TextField,
	Divider,
} from "@mui/material";
import {
	ArrowForward as ArrowIcon,
	DirectionsCar as CarIcon,
	AltRoute as RouteIcon,
	Repeat as RepeatIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker, DatePicker } from "@mui/x-date-pickers";
import { addSeconds, format, isValid } from "date-fns";

import { API_ENDPOINTS } from "@constants";
import { type TripAttributes, type UpdateTripDTO } from "@my-types/trip";
import type { Route, Vehicle } from "@my-types";
import callApi from "@utils/apiCaller";
import { RouteMap } from "@components/map";
import { TripRepeatFrequency } from "@my-types/trip";
import axios from "axios";

interface EditTripFormProps {
	open: boolean;
	trip: TripAttributes | null;
	onClose: () => void;
	onEdited?: () => void;
}

const EditTrip: React.FC<EditTripFormProps> = ({
	open,
	trip,
	onClose,
	onEdited,
}) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Data lists
	const [routes, setRoutes] = useState<Route[]>([]);
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [isLoadingData, setIsLoadingData] = useState(true);

	// Selected route/vehicle (editable)
	const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
	const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(
		null
	);

	// Form State
	const [formState, setFormState] = useState<{
		startTime: Date | null;
		isRoundTrip: boolean;
		returnStartTime: Date | null;
	}>({
		startTime: null,
		isRoundTrip: Boolean(trip?.returnTripId && trip?.returnStartTime),
		returnStartTime: null,
	});

	// Recurrence
	const [isRepeated, setIsRepeated] = useState(false);
	const [repeatFrequency, setRepeatFrequency] = useState<TripRepeatFrequency>(TripRepeatFrequency.NONE);
	const [repeatEndDate, setRepeatEndDate] = useState<Date | null>(null);

	// Populate form when trip data is available
	useEffect(() => {
		if (!trip) return;

		setFormState({
			startTime: trip.startTime ? new Date(trip.startTime) : null,
			isRoundTrip: Boolean(trip.returnTripId && trip.returnStartTime),
			returnStartTime: trip.returnStartTime
				? new Date(trip.returnStartTime)
				: null,
		});

		// Preselect route/vehicle from the trip payload if available
		setSelectedRoute(trip.route || null);
		setSelectedVehicle(trip.vehicle || null);
		// Preselect recurrence if present on trip
		if (trip.repeatFrequency && trip.repeatFrequency !== TripRepeatFrequency.NONE) {
			setIsRepeated(true);
			setRepeatFrequency(trip.repeatFrequency);
			setRepeatEndDate(trip.repeatEndDate
					? new Date(trip.repeatEndDate)
					: null
			);
		} else {
			setIsRepeated(false);
			setRepeatFrequency(TripRepeatFrequency.NONE);
			setRepeatEndDate(null);
		}
	}, [trip]);

	// Fetch routes and vehicles when dialog opens
	useEffect(() => {
		let mounted = true;
		const fetchData = async () => {
			setIsLoadingData(true);
			try {
				const [routesRes, vehiclesRes] = await Promise.all([
					axios.get(API_ENDPOINTS.ROUTE.BASE),
					axios.get(API_ENDPOINTS.VEHICLE.BASE),
				]);
				if (!mounted) return;

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
			} catch (err: any) {
				setError(err.message || "Failed to fetch data.");
			} finally {
				if (mounted) setIsLoadingData(false);
			}
		};
		fetchData();
		return () => {
			mounted = false;
		};
	}, [trip]);

	// Derived state for read-only arrival time previews
	const outboundArrival = useMemo(() => {
		const duration = selectedRoute?.duration ?? trip?.route?.duration;
		if (!formState.startTime || !isValid(formState.startTime) || !duration)
			return null;
		return addSeconds(formState.startTime, duration);
	}, [formState.startTime, selectedRoute, trip?.route?.duration]);

	const returnArrival = useMemo(() => {
		const duration = selectedRoute?.duration ?? trip?.route?.duration;
		if (
			!formState.returnStartTime ||
			!isValid(formState.returnStartTime) ||
			!duration
		)
			return null;
		return addSeconds(formState.returnStartTime, duration);
	}, [formState.returnStartTime, selectedRoute, trip?.route?.duration]);

	const mapStops = useMemo(() => {
		const r = selectedRoute || trip?.route;
		if (!r?.stops) return undefined;
		return [...r.stops]
			.sort((a: any, b: any) => a.stopOrder - b.stopOrder)
			.map((s: any) => ({
				latitude: Number(s.location?.latitude),
				longitude: Number(s.location?.longitude),
				name: s.location?.name,
				address: s.location?.address,
			}));
	}, [selectedRoute, trip]);

	const handleSave = async () => {
		if (!trip) return;

		setError(null);
		setIsSubmitting(true);

		try {
			const payload: Partial<UpdateTripDTO> = {
				startTime: formState.startTime ?? undefined,
				isRoundTrip: formState.isRoundTrip,
				returnStartTime: formState.isRoundTrip
					? formState.returnStartTime
					: null,
			};

			if (
				selectedVehicle &&
				selectedVehicle.id !== trip.vehicleId
			) {
				payload.vehicleId = selectedVehicle.id;
			}
			if (selectedRoute && selectedRoute.id !== trip.routeId) {
				payload.routeId = selectedRoute.id;
			}

			if (isRepeated) {
				payload.repeatFrequency = repeatFrequency;
				payload.repeatEndDate = repeatEndDate;
			} else {
				payload.repeatFrequency = TripRepeatFrequency.NONE;
				payload.repeatEndDate = null;
			}

			await callApi({
				method: "PUT",
				url: API_ENDPOINTS.TRIP.UPDATE(trip.id),
				data: payload,
			});

			onEdited?.();
			onClose();
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to update trip.");
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
					Est. Arrival:{" "}
					<strong>{format(arrivalDate, "HH:mm")}</strong> (
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
						Edit Trip #{trip?.id}
					</Typography>
				</DialogTitle>

				<DialogContent dividers>
					{error && <Alert severity="error">{error}</Alert>}

					<Grid container spacing={2} sx={{ mt: 1 }}>
						<Grid size={{ xs: 12, md: 6 }}>
							<Autocomplete
								options={routes}
								getOptionLabel={(r) =>
									r.name || `Route #${r.id}`
								}
								value={selectedRoute}
								onChange={(_, val) => setSelectedRoute(val)}
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
								onChange={(_, val) => setSelectedVehicle(val)}
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
								mt: 2,
								borderRadius: 1,
								overflow: "hidden",
							}}
						>
							<RouteMap
								stops={mapStops}
								height="100%"
								zoom={10}
								showMarkers
								showRoute
							/>
						</Paper>
					)}

					<Divider sx={{ my: 2 }} />

					<Grid container spacing={3}>
						<Grid
							size={{
								xs: 12,
								md: (formState.isRoundTrip) ? 6 : 12,
							}}
						>
							<DateTimePicker
								label="Departure Time"
								value={formState.startTime}
								onChange={(v) =>
									setFormState((p) => ({
										...p,
										startTime: v,
									}))
								}
								disablePast
								slotProps={{ textField: { fullWidth: true } }}
							/>
							{renderArrivalPreview(outboundArrival)}
						</Grid>

						{formState.isRoundTrip && (
							<Grid size={{ xs: 12, md: 6 }}>
								<DateTimePicker
									label="Return Departure"
									value={formState.returnStartTime}
									onChange={(v) =>
										setFormState((p) => ({
											...p,
											returnStartTime: v,
										}))
									}
									minDateTime={
										formState.startTime || undefined
									}
									slotProps={{
										textField: { fullWidth: true },
									}}
								/>
								{renderArrivalPreview(returnArrival)}
							</Grid>
						)}

						<Grid size={{ xs: 12 }}>
							<FormControlLabel
								control={
									<Switch
										checked={formState.isRoundTrip}
										onChange={(e) =>
											setFormState((p) => ({
												...p,
												isRoundTrip: e.target.checked,
											}))
										}
									/>
								}
								label="Is Round Trip?"
							/>
						</Grid>
					</Grid>

					<Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
						<Box
							display="flex"
							justifyContent="space-between"
							alignItems="center"
						>
							<Box display="flex" alignItems="center" gap={1}>
								<RepeatIcon
									color={isRepeated ? "primary" : "disabled"}
								/>
								<Box>
									<Typography variant="subtitle2">
										Recurring Trip
									</Typography>
									<Typography
										variant="caption"
										color="text.secondary"
									>
										Update template/recurrence settings
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
												v && setRepeatFrequency(v)
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
											onChange={(v) =>
												setRepeatEndDate(v)
											}
											disablePast
											slotProps={{
												textField: {
													fullWidth: true,
													size: "small",
												},
											}}
										/>
									</Grid>
								</Grid>
							</Box>
						)}
					</Paper>
				</DialogContent>

				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={onClose} color="inherit">
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						variant="contained"
						disabled={isSubmitting || isLoadingData}
						startIcon={
							isSubmitting ? (
								<CircularProgress size={20} />
							) : (
								<CarIcon />
							)
						}
					>
						{isSubmitting ? "Saving..." : "Save Changes"}
					</Button>
				</DialogActions>
			</Dialog>
		</LocalizationProvider>
	);
};

export default EditTrip;
