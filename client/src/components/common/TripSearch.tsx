import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	TextField,
	FormControl,
	FormHelperText,
	Stack,
	Alert,
	ListItemText,
	ListItemButton,
	ListItem,
	Autocomplete,
	IconButton,
	useTheme,
	useMediaQuery,
	Paper,
	Typography,
	type PaperProps,
	type ButtonProps, // Import these types
	type IconButtonProps,
	type AutocompleteProps,
	type BoxProps,
	type SvgIconProps,
} from "@mui/material";
import {
	DateTimePicker,
	LocalizationProvider,
	type DateTimePickerProps,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocationOn, Search, SwapHoriz } from "@mui/icons-material";
import { createSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { type Location } from "@my-types";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS, ROUTES } from "@constants/index";

// --- Types ---

type TripSearchFormState = {
	departure: string;
	destination: string;
	date: Date;
};

type FormErrorState = Partial<
	Record<keyof TripSearchFormState | "general", string>
>;

// 1. Define the SlotProps Interface
export interface TripSearchSlotProps {
	paper?: PaperProps;
	submitButton?: ButtonProps;
	swapButton?: IconButtonProps;
	swapIcon?: SvgIconProps;
	box?: BoxProps;
	datePicker?: Partial<DateTimePickerProps>;
	// We use Partial/Omit here to ensure the user doesn't accidentally break
	// core functionality like 'options' or 'onChange'
	departureAutocomplete?: Omit<
		AutocompleteProps<Location, false, false, false>,
		"options" | "renderInput"
	>;
	destinationAutocomplete?: Omit<
		AutocompleteProps<Location, false, false, false>,
		"options" | "renderInput"
	>;
}

interface TripSearchProps {
	initialFrom?: string | null;
	initialTo?: string | null;
	initialDate?: Date | null;
	slotProps?: TripSearchSlotProps;
}

const TripSearch: React.FC<TripSearchProps> = ({
	initialFrom,
	initialTo,
	initialDate,
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
	const [errors] = useState<FormErrorState>({});
	const [fetchError, setFetchError] = useState<string | null>(null);

	useEffect(() => {
		if (initialFrom) setDeparturePoint(initialFrom);
		if (initialTo) setDestinationPoint(initialTo);
		if (initialDate) setDate(initialDate);
	}, [initialFrom, initialTo, initialDate]);

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
					console.warn("Unexpected response structure:", data);
					setLocations([]);
				}
			} catch (err: any) {
				console.error("Failed to fetch locations:", err);
				setFetchError(
					"Failed to load locations. Please try refreshing the page."
				);
				setLocations([]);
			} finally {
				setIsLoadingLocations(false);
			}
		};
		fetchLocations();
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!departure || !destination || !date) {
			return;
		}

		const params = createSearchParams({
			from: departure,
			to: destination,
			date: format(date, "yyyy-MM-dd"),
		}).toString();

		navigate(`${ROUTES.SEARCH}?${params}`);
	};

	const handleSwap = () => {
		setDeparturePoint(destination);
		setDestinationPoint(departure);
	};

	const departureOptions = locations.filter(
		(loc: Location) => loc.name !== destination
	);
	const destinationOptions = locations.filter(
		(loc: Location) => loc.name !== departure
	);

	return (
		<Paper {...slotProps?.paper}>
			{fetchError && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{fetchError}
				</Alert>
			)}

			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<Box
					component="form"
					mb={3}
					onSubmit={handleSubmit}
					{...slotProps?.box}
					sx={{ ...slotProps?.box?.sx }}
				>
					<Stack
						direction={{ xs: "column", md: "row" }}
						gap={3}
						marginBottom={4}
					>
						<FormControl
							fullWidth
							required
							error={!!errors.departure}
						>
							<Autocomplete
								// 4. Spread Departure Slot Props
								// We spread BEFORE the controlled props (value, onChange)
								// so the user can't accidentally break the logic.
								{...slotProps?.departureAutocomplete}
								loading={isLoadingLocations}
								options={departureOptions}
								className="hvr-icon-grow"
								getOptionLabel={(o) => o.name}
								popupIcon={<LocationOn className="hvr-icon" />}
								sx={{
									"& .MuiAutocomplete-popupIndicator": {
										transform: "none",
									},
									...slotProps?.departureAutocomplete?.sx, // Explicitly merge SX if needed
								}}
								value={
									departureOptions.find(
										(l) => l.name === departure
									) || null
								}
								onChange={(_, val) => {
									setDeparturePoint(val ? val.name : null);
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
										variant="filled"
										placeholder="To where?"
										sx={{
											backgroundColor: "white",
											cursor: "pointer",
											"& .MuiInputBase-input": {
												cursor: "pointer",
											},
										}}
									/>
								)}
								isOptionEqualToValue={(opt, val) =>
									opt.id === val.id
								}
								fullWidth
							/>
						</FormControl>

						<IconButton
							onClick={handleSwap}
							// 5. Spread Swap Button Slot Props
							{...slotProps?.swapButton}
							sx={{
								bgcolor: "action.hover",
								alignSelf: "center",
								transform: isMobile ? "rotate(90deg)" : "none",
								...slotProps?.swapButton?.sx,
							}}
							className="hvr-icon-spin"
						>
							<SwapHoriz
								fontSize="large"
								{...slotProps?.swapIcon}
								sx={{ ...slotProps?.swapIcon?.sx }}
							/>
						</IconButton>

						<FormControl
							fullWidth
							required
							error={!!errors.destination}
						>
							<Autocomplete
								// 6. Spread Destination Slot Props
								{...slotProps?.destinationAutocomplete}
								loading={isLoadingLocations}
								options={destinationOptions}
								getOptionLabel={(o) => o.name}
								className="hvr-icon-grow"
								popupIcon={<LocationOn className="hvr-icon" />}
								sx={{
									"& .MuiAutocomplete-popupIndicator": {
										transform: "none",
									},
									...slotProps?.destinationAutocomplete?.sx,
								}}
								value={
									destinationOptions.find(
										(l) => l.name === destination
									) || null
								}
								onChange={(_, val) => {
									setDestinationPoint(val ? val.name : null);
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
										variant="filled"
										placeholder="Select destination location"
										sx={{
											backgroundColor: "white",
											cursor: "pointer",
											"& .MuiInputBase-input": {
												cursor: "pointer",
											},
										}}
									/>
								)}
								isOptionEqualToValue={(opt, val) =>
									opt.name === val.name
								}
								fullWidth
							/>
						</FormControl>

						<FormControl fullWidth required error={!!errors.date}>
							<DateTimePicker
								// 7. Spread Date Picker Slot Props
								{...slotProps?.datePicker}
								label="Travel Date"
								format="dd/MM/yyyy"
								value={date}
								disablePast
								sx={{
									backgroundColor: "white",
									...slotProps?.datePicker?.sx,
								}}
								onChange={(val) => {
									if (val) {
										setDate(new Date(val.toString()));
									}
								}}
								slotProps={{
									textField: {
										variant: "filled",
									},
									// Merge nested slotProps if the user passes them
									...slotProps?.datePicker?.slotProps,
								}}
							/>
							{errors.date && (
								<FormHelperText>{errors.date}</FormHelperText>
							)}
						</FormControl>
					</Stack>

					<Button
						variant="contained"
						type="submit"
						size="large"
						startIcon={<Search />}
						// 8. Spread Submit Button Slot Props (LAST allows overriding defaults)
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
				</Box>
			</LocalizationProvider>
		</Paper>
	);
};

export default TripSearch;
