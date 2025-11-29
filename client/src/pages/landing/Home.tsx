import React, { useEffect, useState } from "react";
import {
	Container,
	Box,
	Typography,
	Button,
	TextField,
	FormControl,
	FormHelperText,
	Stack,
	Alert,
	Card,
	CardContent,
	CardMedia,
	Chip,
	Grid,
} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import Autocomplete from "@mui/material/Autocomplete";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import cover from "@assets/background.jpg";
import { type Location, type Coupon, CouponType } from "@my-types";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS, ROUTES } from "@constants/index";
import { LocationOn, Search, LocalOffer } from "@mui/icons-material";
import { createSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";

type TripSearchFormState = {
	departure: string;
	destination: string;
	date: Date;
};

type FormErrorState = Partial<
	Record<keyof TripSearchFormState | "general", string>
>;

/**
 * Home landing component containing the primary hero and search form.
 * Provides Autocomplete fields for departure and destination while preserving
 * prior layout and styling. Background hero uses pseudo-element overlays.
 */
const Home: React.FC = () => {
	const navigate = useNavigate();

	const [departure, setDeparturePoint] = useState<string | null>(null);
	const [destination, setDestinationPoint] = useState<string | null>(null);
	const [locations, setLocations] = useState<Location[]>([]); // Available locations
	const [isLoadingLocations, setIsLoadingLocations] =
		useState<boolean>(false); // Loading state
	const [date, setDate] = useState<Date | null>(null); // Selected date/time
	const [errors] = useState<FormErrorState>({}); // Placeholder for future validation errors
	const [fetchError, setFetchError] = useState<string | null>(null);

	// Coupons carousel state
	const [coupons, setCoupons] = useState<Coupon[]>([]);
	const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

	// Fetch list of locations from API once on mount
	useEffect(() => {
		const fetchLocations = async () => {
			setIsLoadingLocations(true);
			setFetchError(null);
			try {
				const response = await callApi({
					method: "GET",
					url: API_ENDPOINTS.LOCATION.SEARCH,
				});

				// Handle different response structures
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

	// Fetch active coupons for carousel
	useEffect(() => {
		const fetchCoupons = async () => {
			setIsLoadingCoupons(true);
			try {
				const response = await callApi({
					method: "GET",
					url: API_ENDPOINTS.COUPON.SEARCH,
					params: { isActive: true, limit: 10 }, // Fetch active coupons, limit to 10
				});

				const data = response as any;
				if (Array.isArray(data)) {
					setCoupons(data);
				} else if (data?.rows && Array.isArray(data.rows)) {
					setCoupons(data.rows);
				} else if (data?.data && Array.isArray(data.data)) {
					setCoupons(data.data);
				} else {
					setCoupons([]);
				}
			} catch (err) {
				console.error("Failed to fetch coupons:", err);
				setCoupons([]);
			} finally {
				setIsLoadingCoupons(false);
			}
		};
		fetchCoupons();
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

	// Filter out the opposite selected location to avoid duplicates.
	const departureOptions = locations.filter(
		(loc: Location) => loc.name !== destination
	);
	const destinationOptions = locations.filter(
		(loc: Location) => loc.name !== departure
	);

	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			<Box
				sx={{
					position: "relative",
					overflow: "hidden",
					flex: { xs: "0 0 auto", md: "0 0 50%" },
					display: "flex",
					py: { xs: 4, md: 8 },
					"::before": {
						position: "absolute",
						content: '""',
						inset: 0,
						zIndex: -2,
						backgroundImage: `url(${cover})`,
						backgroundRepeat: "no-repeat",
						backgroundPosition: {
							xs: "center 25%",
							md: "center 90%",
						},
						backgroundSize: "cover",
						filter: "blur(4px)",
						transform: "scale(1.05)",
					},
					"::after": {
						content: '""',
						position: "absolute",
						inset: 0,
						zIndex: -1,
						background:
							"linear-gradient(rgba(90, 90, 90, 0.03), rgba(0, 0, 0, 0.6))",
					},
				}}
			>
				<Container maxWidth="md" sx={{ zIndex: 1 }}>
					<Box textAlign="center" maxWidth={{ lg: 800 }} mx="auto">
						<Typography
							variant="h3"
							fontWeight="bold"
							sx={{ mb: 2, color: "#e0e0e0" }}
						>
							Book Your Bus Ticket Online
						</Typography>
						<Typography
							variant="subtitle1"
							fontWeight="bold"
							sx={{ mb: 3, color: "#e0e0e0" }}
						>
							Fast, easy, and secure travel reservations
						</Typography>

						{fetchError && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{fetchError}
							</Alert>
						)}

						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<Box
								component="form"
								mb={4}
								onSubmit={handleSubmit}
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
											loading={isLoadingLocations}
											options={departureOptions}
											className="hvr-icon-grow"
											getOptionLabel={(o) => o.name}
											popupIcon={
												<LocationOn className="hvr-icon" />
											}
											sx={{
												"& .MuiAutocomplete-popupIndicator":
													{ transform: "none" },
											}}
											value={
												departureOptions.find(
													(l) => l.name === departure
												) || null
											}
											onChange={(_, val) => {
												if (val !== null)
													setDeparturePoint(val.name);
											}}
											renderOption={(props, option) => (
												<ListItem
													{...props}
													key={option.id}
													disablePadding
												>
													<ListItemButton>
														<ListItemText
															primary={
																option.name
															}
															secondary={
																option.address
															}
														/>
													</ListItemButton>
												</ListItem>
											)}
											renderInput={(params) => (
												<TextField
													{...params}
													label="Departure"
													variant="filled"
													placeholder="Select departure location"
													sx={{
														backgroundColor:
															"white",
														cursor: "pointer",
														"& .MuiInputBase-input":
															{
																cursor: "pointer",
															},
													}}
												/>
											)}
											isOptionEqualToValue={(
												opt: Location,
												val: Location
											) => opt.id === val.id}
											fullWidth
										/>
									</FormControl>
									<FormControl
										fullWidth
										required
										error={!!errors.destination}
									>
										<Autocomplete
											loading={isLoadingLocations}
											options={destinationOptions}
											getOptionLabel={(o) => o.name}
											className="hvr-icon-grow"
											popupIcon={
												<LocationOn className="hvr-icon" />
											}
											sx={{
												"& .MuiAutocomplete-popupIndicator":
													{ transform: "none" },
											}}
											value={
												destinationOptions.find(
													(l) =>
														l.name === destination
												) || null
											}
											onChange={(_, val) => {
												if (val !== null)
													setDestinationPoint(
														val?.name
													);
											}}
											renderOption={(props, option) => (
												<ListItem
													{...props}
													key={option.id}
													disablePadding
												>
													<ListItemButton>
														<ListItemText
															primary={
																option.name
															}
															secondary={
																option.address
															}
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
														backgroundColor:
															"white",
														cursor: "pointer",
														"& .MuiInputBase-input":
															{
																cursor: "pointer",
															},
													}}
												/>
											)}
											isOptionEqualToValue={(
												opt: Location,
												val: Location
											) => opt.id === val.id}
											fullWidth
										/>
									</FormControl>
									<FormControl
										fullWidth
										required
										error={!!errors.date}
									>
										<DateTimePicker
											label="Start period"
											format="dd/MM/yyyy - hh:mm aa"
											value={date}
											disablePast
											sx={{ backgroundColor: "white" }}
											onChange={(val) => {
												if (val) {
													setDate(
														new Date(val.toString())
													);
												}
											}}
											slotProps={{
												textField: {
													variant: "filled",
												},
											}}
										/>
										{errors.date && (
											<FormHelperText>
												{errors.date}
											</FormHelperText>
										)}
									</FormControl>
								</Stack>

								<Button
									variant="contained"
									type="submit"
									size="large"
									sx={{ px: 4 }}
									startIcon={<Search />}
								>
									Start Your Search
								</Button>
							</Box>
						</LocalizationProvider>

						{/* TODO: Secondary CTA (e.g., View Promotions) below primary button */}
					</Box>
				</Container>
			</Box>

			{/* Coupons Carousel Section */}
			<Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
				<Container maxWidth="lg" sx={{ py: 4 }}>
					<Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
						Special Offers & Coupons
					</Typography>
					{isLoadingCoupons ? (
						<Typography>Loading offers...</Typography>
					) : coupons.length > 0 ? (
						<Box sx={{ overflowX: "auto", pb: 2 }}>
							<Grid
								container
								spacing={2}
								sx={{ minWidth: "max-content" }}
							>
								{coupons.map((coupon) => (
									<Grid
										key={coupon.id}
										size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
									>
										{coupon.imgUrl ? (
											<Card sx={{ maxWidth: 345 }}>
												<CardMedia
													component="img"
													height="140"
													image={coupon.imgUrl}
													alt={
														coupon.title ||
														coupon.code
													}
												/>
												<CardContent>
													<Typography
														gutterBottom
														variant="h6"
														component="div"
													>
														{coupon.title ||
															coupon.code}
													</Typography>
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ mb: 1 }}
													>
														{coupon.description}
													</Typography>
													<Stack
														direction="row"
														spacing={1}
													>
														<Chip
															label={`${
																coupon.type.toUpperCase() ===
																CouponType.PERCENTAGE
																	? `${coupon.value}%`
																	: `$${coupon.value}`
															}`}
															color="primary"
															size="small"
														/>
														<Chip
															label={`Code: ${coupon.code}`}
															variant="outlined"
															size="small"
														/>
													</Stack>
												</CardContent>
											</Card>
										) : (
											<Card sx={{ maxWidth: 345 }}>
												<CardContent
													sx={{ textAlign: "center" }}
												>
													<LocalOffer
														sx={{
															fontSize: 48,
															color: "primary.main",
															mb: 2,
														}}
													/>
													<Typography
														gutterBottom
														variant="h6"
														component="div"
													>
														{coupon.title ||
															coupon.code}
													</Typography>
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ mb: 1 }}
													>
														{coupon.description}
													</Typography>
													<Stack
														direction="row"
														spacing={1}
														sx={{
															justifyContent:
																"center",
														}}
													>
														<Chip
															label={`${
																coupon.type.toUpperCase() ===
																CouponType.PERCENTAGE
																	? `${Math.floor(coupon.value)}%`
																	: `$${coupon.value}`
															} Off`}
															color="primary"
															size="small"
														/>
														<Chip
															label={`Code: ${coupon.code}`}
															variant="outlined"
															size="small"
														/>
													</Stack>
												</CardContent>
											</Card>
										)}
									</Grid>
								))}
							</Grid>
						</Box>
					) : (
						<Typography variant="body2" color="text.secondary">
							No special offers available at the moment.
						</Typography>
					)}
				</Container>
			</Box>
		</Box>
	);
};

export default Home;
