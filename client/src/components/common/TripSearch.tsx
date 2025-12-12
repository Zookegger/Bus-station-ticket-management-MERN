import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	TextField,
	FormControl,
	FormHelperText,
	Alert,
	ListItemText,
	ListItemButton,
	ListItem,
	Autocomplete,
	IconButton,
	Paper,
	Typography,
	InputAdornment,
	Grid,
	useTheme,
	useMediaQuery,
	type PaperProps,
	type ButtonProps,
	type IconButtonProps,
	type AutocompleteProps,
	type BoxProps,
	type SvgIconProps,
	type TextFieldProps,
} from "@mui/material";
import {
	DateTimePicker,
	LocalizationProvider,
	type DateTimePickerProps,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
	LocationOn,
	Search,
	SwapHoriz,
	AirlineSeatReclineNormal,
} from "@mui/icons-material";
import { createSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { type Location } from "@my-types";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS, ROUTES } from "@constants/index";

// --- Types ---

type TripSearchFormState = {
	departure: string;
	destination: string;
	minTickets: number;
	date: Date;
};

type FormErrorState = Partial<
	Record<keyof TripSearchFormState | "general", string>
>;

export interface TripSearchSlotProps {
	paper?: PaperProps;
	submitButton?: ButtonProps;
	swapButton?: IconButtonProps;
	swapIcon?: SvgIconProps;
	box?: BoxProps;
	datePicker?: Partial<DateTimePickerProps>;
	departureAutocomplete?: Omit<
		AutocompleteProps<Location, false, false, false>,
		"options" | "renderInput"
	>;
	destinationAutocomplete?: Omit<
		AutocompleteProps<Location, false, false, false>,
		"options" | "renderInput"
	>;
	minTicketsField?: Omit<TextFieldProps, "value" | "onChange">;
}

interface TripSearchProps {
	initialFrom?: string | null;
	initialTo?: string | null;
	initialDate?: Date | null;
	initialMin?: number | null;
	slotProps?: TripSearchSlotProps;
}

const TripSearch: React.FC<TripSearchProps> = ({
	initialFrom,
	initialTo,
	initialDate,
	initialMin,
	slotProps,
}) => {
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const [departure, setDeparturePoint] = useState<string | null>(
		initialFrom || null
	);
	const [destination, setDestinationPoint] = useState<string | null>(
		initialTo || null
	);
	const [locations, setLocations] = useState<Location[]>([]);
	const [isLoadingLocations, setIsLoadingLocations] =
		useState<boolean>(false);
	const [date, setDate] = useState<Date | null>(initialDate || null);
	const [minTickets, setMinTickets] = useState<number | null>(
		initialMin ?? null
	);
	const [errors] = useState<FormErrorState>({});
	const [fetchError, setFetchError] = useState<string | null>(null);

	useEffect(() => {
		if (initialFrom) setDeparturePoint(initialFrom);
		if (initialTo) setDestinationPoint(initialTo);
		if (initialDate) setDate(initialDate);
		if (typeof initialMin !== "undefined" && initialMin !== null) {
			setMinTickets(initialMin);
		}
	}, [initialFrom, initialTo, initialDate, initialMin]);

	useEffect(() => {
		const fetchLocations = async () => {
			setIsLoadingLocations(true);
			setFetchError(null);
			try {
				const response = await callApi({
					method: "GET",
					url: API_ENDPOINTS.LOCATION.SEARCH,
				});

				const data = response as any;
				if (Array.isArray(data)) {
					setLocations(data);
				} else if (data?.locations && Array.isArray(data.locations)) {
					setLocations(data.locations);
				} else if (data?.data && Array.isArray(data.data)) {
					setLocations(data.data);
				} else {
					setLocations([]);
				}
			} catch (err: any) {
				console.error("Failed to fetch locations:", err);
				setFetchError("Failed to load locations.");
				setLocations([]);
			} finally {
				setIsLoadingLocations(false);
			}
		};
		fetchLocations();
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!departure || !destination || !date) return;

		const paramsObj: Record<string, string> = {
			from: departure,
			to: destination,
			date: format(date, "yyyy-MM-dd"),
		};

		if (minTickets != null && !Number.isNaN(minTickets)) {
			paramsObj.minSeats = String(Math.max(1, Math.floor(minTickets)));
		}

		const params = createSearchParams(paramsObj).toString();
		navigate(`${ROUTES.SEARCH}?${params}`);
	};

	const handleSwap = () => {
		setDeparturePoint(destination);
		setDestinationPoint(departure);
	};

	const departureOptions = locations.filter(
		(loc) => loc.name !== destination
	);
	const destinationOptions = locations.filter(
		(loc) => loc.name !== departure
	);

	// --- STYLING CONCEPT ---
	// Strictly adhering to the "filled" white style from the original concept.
	const commonInputSx = {
		backgroundColor: "white",
		cursor: "pointer",
		"& .MuiInputBase-input": {
			cursor: "pointer",
		},
		// Force white background on filled variant to match original look
		"& .MuiFilledInput-root": {
			backgroundColor: "white",
			"&:hover": {
				backgroundColor: "white",
			},
			"&.Mui-focused": {
				backgroundColor: "white",
			},
		},
	};

	return (
		<Paper
			elevation={2}
			{...slotProps?.paper}
			// Using padding from your original concept
			sx={{ p: 3, borderRadius: 2, ...slotProps?.paper?.sx }}
		>
			{fetchError && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{fetchError}
				</Alert>
			)}

			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<Box
					component="form"
					onSubmit={handleSubmit}
					{...slotProps?.box}
				>
					<Grid container spacing={3} alignItems="center">
						{/* --- Row 1: Departure -> Swap -> Destination --- */}

						<Grid size={{ xs: 12, md: 5 }}>
							<FormControl
								fullWidth
								required
								error={!!errors.departure}
							>
								<Autocomplete
									{...slotProps?.departureAutocomplete}
									loading={isLoadingLocations}
									options={departureOptions}
									// Applying Original Classes
									className="hvr-icon-grow"
									getOptionLabel={(o) => o.name}
									popupIcon={
										<LocationOn className="hvr-icon" />
									}
									value={
										departureOptions.find(
											(l) => l.name === departure
										) || null
									}
									onChange={(_, val) =>
										setDeparturePoint(val ? val.name : null)
									}
									isOptionEqualToValue={(opt, val) =>
										opt.id === val.id
									}
									// Original popup style
									sx={{
										"& .MuiAutocomplete-popupIndicator": {
											transform: "none",
										},
										...slotProps?.departureAutocomplete?.sx,
									}}
									renderOption={(props, option) => (
										<ListItem
											{...props}
											key={option.id}
											disablePadding
										>
											<ListItemButton>
												<ListItemText
													primary={option.name}
													secondary={option.address}
												/>
											</ListItemButton>
										</ListItem>
									)}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Departure"
											placeholder="To where?"
											variant="filled"
											sx={commonInputSx}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						{/* Swap Button */}
						<Grid
							size={{ xs: 12, md: 2 }}
							display="flex"
							justifyContent="center"
						>
							<IconButton
								onClick={handleSwap}
								{...slotProps?.swapButton}
								// Original Classes
								className="hvr-icon-spin"
								sx={{
									bgcolor: "action.hover",
									alignSelf: "center",
									transform: isMobile
										? "rotate(90deg)"
										: "none",
									...slotProps?.swapButton?.sx,
								}}
							>
								<SwapHoriz
									fontSize="large"
									className="hvr-icon"
									{...slotProps?.swapIcon}
									sx={{ ...slotProps?.swapIcon?.sx }}
								/>
							</IconButton>
						</Grid>

						<Grid size={{ xs: 12, md: 5 }}>
							<FormControl
								fullWidth
								required
								error={!!errors.destination}
							>
								<Autocomplete
									{...slotProps?.destinationAutocomplete}
									loading={isLoadingLocations}
									options={destinationOptions}
									getOptionLabel={(o) => o.name}
									// Original Classes
									className="hvr-icon-grow"
									popupIcon={
										<LocationOn className="hvr-icon" />
									}
									value={
										destinationOptions.find(
											(l) => l.name === destination
										) || null
									}
									onChange={(_, val) =>
										setDestinationPoint(
											val ? val.name : null
										)
									}
									isOptionEqualToValue={(opt, val) =>
										opt.name === val.name
									}
									// Original popup style
									sx={{
										"& .MuiAutocomplete-popupIndicator": {
											transform: "none",
										},
										...slotProps?.destinationAutocomplete
											?.sx,
									}}
									renderOption={(props, option) => (
										<ListItem
											{...props}
											key={option.id}
											disablePadding
										>
											<ListItemButton>
												<ListItemText
													primary={option.name}
													secondary={option.address}
												/>
											</ListItemButton>
										</ListItem>
									)}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Destination"
											placeholder="Select destination location"
											variant="filled"
											sx={commonInputSx} 
										/>
									)}
								/>
							</FormControl>
						</Grid>

						{/* --- Row 2: Date | Seats | Search Button --- */}

						<Grid size={{ xs: 12, md: 5 }}>
							<FormControl
								fullWidth
								required
								error={!!errors.date}
							>
								<DateTimePicker
									{...slotProps?.datePicker}
									label="Travel Date"
									format="dd/MM/yyyy"
									value={date}
									disablePast
									onChange={(val) =>
										val && setDate(new Date(val.toString()))
									}
									// Apply Common Style to DatePicker as well
									sx={{
										...commonInputSx,
										...slotProps?.datePicker?.sx,
									}}
									slotProps={{
										textField: {
											variant: "filled", // Original Variant
											fullWidth: true,
										},
										...slotProps?.datePicker?.slotProps,
									}}
								/>
								{errors.date && (
									<FormHelperText>
										{errors.date}
									</FormHelperText>
								)}
							</FormControl>
						</Grid>

						{/* Min Tickets (Seats) */}
						<Grid size={{ xs: 12, md: 3 }}>
							<FormControl fullWidth error={!!errors.minTickets}>
								<TextField
									label="Seats"
									type="number"
									variant="filled" // Original Variant
									value={minTickets ?? ""}
									placeholder="1"
									onChange={(e) => {
										const v = e.target.value;
										if (v === "")
											return setMinTickets(null);
										const n = Math.floor(Number(v));
										if (Number.isNaN(n) || n < 1)
											setMinTickets(1);
										else setMinTickets(n);
									}}
									sx={commonInputSx} // Original Style
									InputProps={{
										startAdornment: (
											<InputAdornment
												position="start"
												sx={{ mt: "16px !important" }}
											>
												{/* Added mt because filled input adornments sometimes drift up */}
												<AirlineSeatReclineNormal />
											</InputAdornment>
										),
										inputProps: { min: 1, step: 1 },
									}}
									{...slotProps?.minTicketsField}
								/>
							</FormControl>
						</Grid>

						<Grid size={{ xs: 12, md: 4 }}>
							<Button
								variant="contained"
								type="submit"
								size="large"
								fullWidth
								startIcon={<Search />}
								{...slotProps?.submitButton}
								sx={{
									px: 4,
									py: 1.8,
									height: "56px",
									...slotProps?.submitButton?.sx,
								}}
							>
								<Typography
									variant="button"
									fontSize={16}
									fontWeight={600}
								>
									Search
								</Typography>
							</Button>
						</Grid>
					</Grid>
				</Box>
			</LocalizationProvider>
		</Paper>
	);
};

export default TripSearch;
