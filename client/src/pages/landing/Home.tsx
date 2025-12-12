import React, { useEffect, useState } from "react";
import {
	Container,
	Box,
	Typography,
	Card,
	CardContent,
	CardMedia,
	Chip,
	Grid,
	Stack,
	Button,
} from "@mui/material";
import cover from "@assets/background.jpg";
import { type Coupon, CouponType, type Trip } from "@my-types";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS, ROUTES } from "@constants/index";
import {
	LocalOffer,
	AccessTime,
	DirectionsBus,
	AttachMoney,
} from "@mui/icons-material";
import TripSearch from "@components/common/TripSearch";
import buildImgUrl from "@utils/imageHelper";
import { format } from "date-fns";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Home landing component containing the primary hero and search form.
 * Provides Autocomplete fields for departure and destination while preserving
 * prior layout and styling. Background hero uses pseudo-element overlays.
 */
const Home: React.FC = () => {
	// Coupons carousel state
	const [coupons, setCoupons] = useState<Coupon[]>([]);
	const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

	// Upcoming trips state
	const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
	const [isLoadingTrips, setIsLoadingTrips] = useState(false);

	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	// Read optional minSeats query param to prefill hero search
	const initialMinFromQuery = (() => {
		const m = searchParams.get("minSeats");
		if (!m) return null;
		const n = parseInt(m, 10);
		return Number.isFinite(n) && n > 0 ? n : null;
	})();

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

	// Fetch upcoming trips
	useEffect(() => {
		const fetchUpcomingTrips = async () => {
			setIsLoadingTrips(true);
			try {
				const response = await callApi({
					method: "GET",
					url: API_ENDPOINTS.TRIP.SEARCH,
					params: {
						status: "Scheduled",
						startDate: new Date().toISOString(),
						orderBy: "startTime",
						sortOrder: "ASC",
						limit: 6,
						checkSeatAvailability: "true",
					},
				});

				const data = response as any;
				if (data?.data && Array.isArray(data.data)) {
					setUpcomingTrips(data.data);
				} else if (Array.isArray(data)) {
					setUpcomingTrips(data);
				} else {
					setUpcomingTrips([]);
				}
			} catch (err) {
				console.error("Failed to fetch upcoming trips:", err);
				setUpcomingTrips([]);
			} finally {
				setIsLoadingTrips(false);
			}
		};
		fetchUpcomingTrips();
	}, []);

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

						<TripSearch
							slotProps={{
								box: {
									sx: { mb: 3 },
								},
								paper: {
									elevation: 0,
									sx: { background: "unset" },
								},
								submitButton: {
									sx: {
										borderRadius: 6,
									},
								},
								swapButton: {
									className: "hvr-icon-spin",
								},
							}}
							initialMin={initialMinFromQuery}
						/>
					</Box>
				</Container>
			</Box>

			{/* Upcoming Trips Section */}
			<Box sx={{ py: 4, bgcolor: "background.default" }}>
				<Container maxWidth="lg">
					<Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
						Upcoming Trips
					</Typography>
					{isLoadingTrips ? (
						<Typography>Loading trips...</Typography>
					) : upcomingTrips.length > 0 ? (
						<Grid container spacing={3}>
							{upcomingTrips.map((trip) => (
								<Grid
									key={trip.id}
									size={{ xs: 12, sm: 6, md: 4 }}
								>
									<Card
										sx={{
											height: "100%",
											display: "flex",
											flexDirection: "column",
											transition: "transform 0.2s",
											"&:hover": {
												transform: "translateY(-4px)",
												boxShadow: 4,
											},
										}}
									>
										<CardContent sx={{ flexGrow: 1 }}>
											<Typography
												variant="h6"
												component="div"
												gutterBottom
												noWrap
											>
												{trip.route?.name ||
													`Trip #${trip.id}`}
											</Typography>

											<Stack spacing={1.5}>
												<Stack
													direction="row"
													alignItems="center"
													spacing={1}
												>
													<AccessTime
														fontSize="small"
														color="action"
													/>
													<Typography
														variant="body2"
														color="text.secondary"
													>
														{format(
															new Date(
																trip.startTime
															),
															"MMM dd, yyyy • HH:mm"
														)}
													</Typography>
												</Stack>

												<Stack
													direction="row"
													alignItems="center"
													spacing={1}
												>
													<DirectionsBus
														fontSize="small"
														color="action"
													/>
													<Typography
														variant="body2"
														color="text.secondary"
													>
														{trip.vehicle
															?.numberPlate ||
															"Standard Bus"}
													</Typography>
												</Stack>

												<Stack
													direction="row"
													alignItems="center"
													spacing={1}
												>
													<AttachMoney
														fontSize="small"
														color="primary"
													/>
													<Typography
														variant="h6"
														color="primary"
														fontWeight="bold"
													>
														{trip.price}
													</Typography>
												</Stack>
											</Stack>
										</CardContent>
										<Box sx={{ p: 2, pt: 0 }}>
											<Button
												variant="contained"
												fullWidth
												onClick={() =>
													navigate(
														ROUTES.SEAT_BOOKING.replace(
															":tripId",
															String(trip.id)
														)
													)
												}
											>
												Book Now
											</Button>
										</Box>
									</Card>
								</Grid>
							))}
						</Grid>
					) : (
						<Typography variant="body2" color="text.secondary">
							No upcoming trips found.
						</Typography>
					)}
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
													image={buildImgUrl(
														coupon.imgUrl,
														"coupons"
													)}
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
																	? `${Math.floor(
																			coupon.value
																	  )}%`
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
