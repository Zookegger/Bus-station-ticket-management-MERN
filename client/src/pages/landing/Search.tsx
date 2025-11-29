import {
	Box,
	Typography,
	CircularProgress,
	Alert,
	Button,
	Pagination,
	Divider,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Stack,
	Paper,
	Chip,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS, ROUTES } from "@constants/index";
import type { Trip, TripResponse } from "@my-types/trip";
import { format } from "date-fns";
import { DirectionsBus } from "@mui/icons-material";

const DEFAULT_PAGE_SIZE = 10;

const SearchPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const [fromLocation, setFromLocation] = useState<string>("");
	const [toLocation, setToLocation] = useState<string>("");
	const [travelDate, setTravelDate] = useState<string>("");
	const [pageNumber, setPageNumber] = useState<number>(1);

	// Sorting state
	const [orderBy, setOrderBy] = useState<string>("startTime");
	const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [trips, setTrips] = useState<Trip[]>([]);
	const [total, setTotal] = useState<number>(0);

	useEffect(() => {
		const from = searchParams.get("from") ?? "";
		const to = searchParams.get("to") ?? "";
		const date = searchParams.get("date") ?? "";
		const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;

		setFromLocation(from);
		setToLocation(to);
		setTravelDate(date);
		setPageNumber(page);
	}, [searchParams]);

	useEffect(() => {
		// If required params are missing, don't call the API.
		if (!fromLocation || !toLocation || !travelDate) {
			setTrips([]);
			setTotal(0);
			return;
		}

		const controller = new AbortController();

		const fetchTrips = async () => {
			try {
				setLoading(true);
				setError(null);

				const params = {
					from: fromLocation,
					to: toLocation,
					date: travelDate,
					page: pageNumber,
					limit: DEFAULT_PAGE_SIZE,
					orderBy,
					sortOrder,
					checkSeatAvailability: "true", // Ensure we only see trips with seats
				};

				const res = await callApi({
					method: "GET",
					url: API_ENDPOINTS.TRIP.SEARCH,
					params,
					signal: controller.signal,
				});

				// Type guard or casting to handle the response
				const data = res as
					| TripResponse
					| { data: TripResponse }
					| Trip[];

				if (Array.isArray(data)) {
					setTrips(data);
					setTotal(data.length);
				} else if ("rows" in data && Array.isArray(data.rows)) {
					setTrips(data.rows);
					setTotal(data.count);
				} else if (
					"data" in data &&
					"rows" in data.data &&
					Array.isArray(data.data.rows)
				) {
					setTrips(data.data.rows);
					setTotal(data.data.count);
				} else {
					setTrips([]);
					setTotal(0);
				}
			} catch (err: any) {
				if (err.name === "AbortError") return;
				setError(err.message || "Failed to fetch trips");
			} finally {
				setLoading(false);
			}
		};

		fetchTrips();

		return () => controller.abort();
	}, [fromLocation, toLocation, travelDate, pageNumber, orderBy, sortOrder]);

	const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
		const params = new URLSearchParams(Array.from(searchParams.entries()));
		params.set("page", String(value));
		navigate(`${ROUTES.SEARCH}?${params.toString()}`);
	};

	const handleSortChange = (event: SelectChangeEvent) => {
		const value = event.target.value;
		if (value === "price_asc") {
			setOrderBy("price");
			setSortOrder("ASC");
		} else if (value === "price_desc") {
			setOrderBy("price");
			setSortOrder("DESC");
		} else if (value === "time_asc") {
			setOrderBy("startTime");
			setSortOrder("ASC");
		} else if (value === "time_desc") {
			setOrderBy("startTime");
			setSortOrder("DESC");
		}
	};

	return (
		<Box p={3} maxWidth={1000} mx="auto">
			<Paper
				elevation={0}
				sx={{ p: 3, mb: 3, bgcolor: "background.default" }}
			>
				<Stack
					direction={{ xs: "column", sm: "row" }}
					justifyContent="space-between"
					alignItems="center"
					spacing={2}
				>
					<Box>
						<Typography variant="h4" fontWeight={700} gutterBottom>
							Search Results
						</Typography>
						<Typography variant="body1" color="text.secondary">
							{fromLocation && toLocation && travelDate
								? `${fromLocation} → ${toLocation} • ${format(
										new Date(travelDate),
										"EEE, dd MMM yyyy"
								  )}`
								: "Please perform a search from the home page."}
						</Typography>
					</Box>

					{trips.length > 0 && (
						<FormControl size="small" sx={{ minWidth: 200 }}>
							<InputLabel>Sort by</InputLabel>
							<Select
								value={`${
									orderBy === "price" ? "price" : "time"
								}_${sortOrder.toLowerCase()}`}
								label="Sort by"
								onChange={handleSortChange}
							>
								<MenuItem value="time_asc">
									Earliest Departure
								</MenuItem>
								<MenuItem value="time_desc">
									Latest Departure
								</MenuItem>
								<MenuItem value="price_asc">
									Lowest Price
								</MenuItem>
								<MenuItem value="price_desc">
									Highest Price
								</MenuItem>
							</Select>
						</FormControl>
					)}
				</Stack>
			</Paper>

			{loading && (
				<Box display="flex" justifyContent="center" p={8}>
					<CircularProgress />
				</Box>
			)}

			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}

			{!loading && !error && trips.length === 0 && (
				<Paper sx={{ p: 4, textAlign: "center" }}>
					<Typography variant="h6" color="text.secondary">
						No trips found for this route on this date.
					</Typography>
					<Button
						variant="outlined"
						sx={{ mt: 2 }}
						onClick={() => navigate(ROUTES.HOME)}
					>
						Search Another Date
					</Button>
				</Paper>
			)}

			{!loading && trips.length > 0 && (
				<Stack spacing={2}>
					{trips.map((t) => {
						// Safely access nested properties
						const stops = t.route?.stops || [];
						// Sort stops by order just in case
						const sortedStops = [...stops].sort(
							(a, b) => a.stopOrder - b.stopOrder
						);

						const originName =
							sortedStops.length > 0
								? sortedStops[0].locations?.name
								: "Unknown Origin";
						const destName =
							sortedStops.length > 0
								? sortedStops[sortedStops.length - 1].locations
										?.name
								: "Unknown Dest";

						const vehicleName =
							t.vehicle?.vehicleType?.name || "Standard Bus";

						return (
							<Paper
								key={t.id}
								elevation={2}
								sx={{
									p: 0,
									overflow: "hidden",
									transition: "transform 0.2s",
									"&:hover": {
										transform: "translateY(-2px)",
										boxShadow: 4,
									},
								}}
							>
								<Box p={3}>
									<Stack
										direction={{ xs: "column", md: "row" }}
										spacing={3}
										alignItems={{
											xs: "flex-start",
											md: "center",
										}}
									>
										{/* Time & Route Info */}
										<Box flex={1}>
											<Stack
												direction="row"
												alignItems="center"
												spacing={1}
												mb={1}
											>
												<Chip
													label={vehicleName}
													size="small"
													color="primary"
													variant="outlined"
													icon={<DirectionsBus />}
												/>
												{t.status && (
													<Chip
														label={t.status}
														size="small"
														color={
															t.status ===
															"SCHEDULED"
																? "success"
																: "default"
														}
													/>
												)}
											</Stack>

											<Stack
												direction="row"
												alignItems="center"
												spacing={3}
											>
												<Box>
													<Typography
														variant="h5"
														fontWeight="bold"
													>
														{t.startTime
															? format(
																	new Date(
																		t.startTime
																	),
																	"HH:mm"
															  )
															: "--:--"}
													</Typography>
													<Typography
														variant="body2"
														color="text.secondary"
													>
														{originName}
													</Typography>
												</Box>

												<Box
													sx={{
														flex: 1,
														borderBottom:
															"1px dashed #ccc",
														position: "relative",
														mx: 2,
														minWidth: 50,
													}}
												>
													<Typography
														variant="caption"
														sx={{
															position:
																"absolute",
															top: -20,
															left: "50%",
															transform:
																"translateX(-50%)",
															color: "text.secondary",
														}}
													>
														Direct
													</Typography>
												</Box>

												<Box textAlign="right">
													<Typography
														variant="h5"
														fontWeight="bold"
														color="text.secondary"
													>
														--:--
													</Typography>
													<Typography
														variant="body2"
														color="text.secondary"
													>
														{destName}
													</Typography>
												</Box>
											</Stack>
										</Box>

										<Divider
											orientation="vertical"
											flexItem
											sx={{
												display: {
													xs: "none",
													md: "block",
												},
											}}
										/>

										{/* Price & Action */}
										<Box
											minWidth={200}
											textAlign={{
												xs: "left",
												md: "right",
											}}
											width={{ xs: "100%", md: "auto" }}
										>
											<Typography
												variant="h5"
												color="primary.main"
												fontWeight="bold"
												mb={1}
											>
												{t.price?.toLocaleString(
													"vi-VN"
												)}{" "}
												đ
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
												mb={2}
											>
												per seat
											</Typography>
											<Button
												variant="contained"
												size="large"
												fullWidth
												onClick={() =>
													navigate(
														ROUTES.SEAT_BOOKING.replace(
															":tripId",
															String(t.id)
														)
													)
												}
												sx={{ borderRadius: 2 }}
											>
												Select Seats
											</Button>
										</Box>
									</Stack>
								</Box>
							</Paper>
						);
					})}

					<Box display="flex" justifyContent="center" mt={4}>
						<Pagination
							count={Math.max(
								1,
								Math.ceil(total / DEFAULT_PAGE_SIZE)
							)}
							page={pageNumber}
							onChange={handlePageChange}
							color="primary"
							size="large"
						/>
					</Box>
				</Stack>
			)}
		</Box>
	);
};

export default SearchPage;
