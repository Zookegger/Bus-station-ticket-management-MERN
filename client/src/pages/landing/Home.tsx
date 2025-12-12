import React, { Suspense, use, useRef } from "react";
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
	Skeleton,
	IconButton,
	useTheme,
	useMediaQuery,
	Paper,
	CardActions,
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
	ChevronLeft,
	ChevronRight,
} from "@mui/icons-material";
import TripSearch from "@components/common/TripSearch";
import buildImgUrl from "@utils/imageHelper";
import { format } from "date-fns"; // Restored
import { useNavigate, useSearchParams } from "react-router-dom";

// --- 1. Cache & Fetchers ---
const promiseCache = new Map();
function getPromise(key: string, fetcher: () => Promise<any>) {
	if (!promiseCache.has(key)) promiseCache.set(key, fetcher());
	return promiseCache.get(key);
}

const fetchUpcomingTrips = async () => {
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
	if (data?.data && Array.isArray(data.data)) return data.data;
	if (Array.isArray(data)) return data;
	return [];
};

const fetchCoupons = async () => {
	const response = await callApi({
		method: "GET",
		url: API_ENDPOINTS.COUPON.SEARCH,
		params: { isActive: true, limit: 10 },
	});
	const data = response as any;
	if (Array.isArray(data)) return data;
	if (data?.data && Array.isArray(data.data)) return data.data;
	return [];
};

// --- 2. Skeletons ---
const TripCardSkeleton = () => (
	<Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
		<CardContent sx={{ flexGrow: 1 }}>
			<Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />
			<Stack spacing={2}>
				{[1, 2, 3].map((i) => (
					<Stack
						key={i}
						direction="row"
						alignItems="center"
						spacing={1}
					>
						<Skeleton variant="circular" width={20} height={20} />
						<Skeleton variant="text" width="50%" />
					</Stack>
				))}
			</Stack>
		</CardContent>
		<Box sx={{ p: 2, pt: 0 }}>
			<Skeleton
				variant="rectangular"
				height={36}
				sx={{ borderRadius: 1 }}
			/>
		</Box>
	</Card>
);

const CarouselSkeleton = () => (
	<Stack direction="row" spacing={2} sx={{ overflow: "hidden" }}>
		{[1, 2, 3, 4].map((i) => (
			<Skeleton
				key={i}
				variant="rectangular"
				width={280}
				height={300}
				sx={{ borderRadius: 2, flexShrink: 0 }}
			/>
		))}
	</Stack>
);

// --- 3. Content Components ---

const UpcomingTripsList = () => {
	const navigate = useNavigate();
	const trips = use(getPromise("trips", fetchUpcomingTrips)) as Trip[];

	if (trips.length === 0) {
		return (
			<Typography variant="body2" color="text.secondary">
				No upcoming trips found.
			</Typography>
		);
	}

	return (
		<Grid container spacing={3}>
			{trips.map((trip) => (
				<Grid key={trip.id} size={{ xs: 12, sm: 6, md: 4 }}>
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
								{trip.route?.name || `Trip #${trip.id}`}
							</Typography>

							<Stack spacing={1.5}>
								{/* Time Row */}
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
											new Date(trip.startTime),
											"MMM dd, yyyy • HH:mm"
										)}
									</Typography>
								</Stack>

								{/* Vehicle Row */}
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
										{trip.vehicle?.vehicleType?.name}
									</Typography>
								</Stack>

								{/* Price Row */}
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
	);
};

const CouponsCarousel = () => {
	const coupons = use(getPromise("coupons", fetchCoupons)) as Coupon[];
	const scrollRef = useRef<HTMLDivElement>(null);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	if (coupons.length === 0) {
		return (
			<Typography variant="body2" color="text.secondary">
				No special offers available.
			</Typography>
		);
	}

	const scroll = (direction: "left" | "right") => {
		if (scrollRef.current) {
			const scrollAmount = 320;
			scrollRef.current.scrollBy({
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
		}
	};

	return (
		<Box sx={{ position: "relative", mx: -2, px: 2 }}>
			<IconButton
				onClick={() => scroll("left")}
				sx={{
					position: "absolute",
					left: 0,
					top: "50%",
					transform: "translateY(-50%)",
					zIndex: 2,
					bgcolor: "background.paper",
					boxShadow: 3,
					"&:hover": { bgcolor: "background.paper" },
				}}
			>
				<ChevronLeft />
			</IconButton>

			<Stack
				ref={scrollRef}
				direction="row"
				spacing={2}
				sx={{
					overflowX: "auto",
					py: 2,
					px: 1,
					scrollBehavior: "smooth",
					"&::-webkit-scrollbar": { display: "none" },
					msOverflowStyle: "none",
					scrollbarWidth: "none",
					scrollSnapType: "x mandatory",
					"& > *": { scrollSnapAlign: "start" },
				}}
			>
				{coupons.map((coupon) => (
					<Paper
						key={coupon.id}
						sx={{ flexBasis: isMobile ? undefined : 250 }}
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
							{coupon.imgUrl ? (
								<CardMedia
									component="img"
									height="140"
									image={buildImgUrl(
										coupon.imgUrl,
										"coupons"
									)}
									sx={{ objectFit: "fill" }}
									alt={coupon.title || coupon.code}
								/>
							) : (
								<Box
									sx={{
										height: 140,
										bgcolor: "grey.100",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<LocalOffer
										sx={{
											fontSize: 48,
											color: "primary.main",
										}}
									/>
								</Box>
							)}

							<CardContent sx={{ flexGrow: 1 }}>
								<Typography
									gutterBottom
									variant="h6"
									component="div"
									noWrap
								>
									{coupon.title || coupon.code}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{
										display: "-webkit-box",
										WebkitLineClamp: 2,
										WebkitBoxOrient: "vertical",
										overflow: "hidden",

										overflowY: "auto",
										height: 40,
									}}
								>
									{coupon.description ?? "N/A"}
								</Typography>
							</CardContent>
							<CardActions>
								<Stack direction="row" spacing={1}>
									<Chip
										label={
											coupon.type.toUpperCase() ===
											CouponType.PERCENTAGE
												? `${coupon.value}% Off`
												: `$${coupon.value} Off`
										}
										color="primary"
										size="small"
										sx={{ fontWeight: "bold" }}
									/>
									<Chip
										label={coupon.code}
										variant="outlined"
										size="small"
									/>
								</Stack>
							</CardActions>
						</Card>
					</Paper>
				))}
			</Stack>

			<IconButton
				onClick={() => scroll("right")}
				sx={{
					position: "absolute",
					right: 0,
					top: "50%",
					transform: "translateY(-50%)",
					zIndex: 2,
					bgcolor: "background.paper",
					boxShadow: 3,
					"&:hover": { bgcolor: "background.paper" },
				}}
			>
				<ChevronRight />
			</IconButton>
		</Box>
	);
};

// --- 4. Main Home ---
const Home: React.FC = () => {
	const [searchParams] = useSearchParams();

	const initialMinFromQuery = (() => {
		const m = searchParams.get("minSeats");
		if (!m) return null;
		const n = parseInt(m, 10);
		return Number.isFinite(n) && n > 0 ? n : null;
	})();

	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			{/* Hero Section */}
			<Box
				sx={{
					position: "relative",
					overflow: "hidden",
					flex: { xs: "0 0 auto", md: "0 0 50%" },
					display: "flex",
					py: { xs: 4, md: 6 },
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
				<Container maxWidth="lg" sx={{ zIndex: 1 }}>
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
								box: { sx: { mb: 3 } },
								paper: {
									elevation: 0,
									sx: { background: "unset" },
								},
								submitButton: { sx: { borderRadius: 6 } },
								swapButton: { sx: { color: "ButtonFace" } },
							}}
							initialMin={initialMinFromQuery}
						/>
					</Box>
				</Container>
			</Box>

			{/* Upcoming Trips */}
			<Box sx={{ py: 4, bgcolor: "background.default" }}>
				<Container maxWidth="lg">
					<Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
						Upcoming Trips
					</Typography>
					<Suspense
						fallback={
							<Grid container spacing={3}>
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<Grid
										key={i}
										size={{ xs: 12, sm: 6, md: 4 }}
									>
										<TripCardSkeleton />
									</Grid>
								))}
							</Grid>
						}
					>
						<UpcomingTripsList />
					</Suspense>
				</Container>
			</Box>

			{/* Coupons Carousel */}
			<Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
				<Container maxWidth="lg" sx={{ py: 4 }}>
					<Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
						Special Offers & Coupons
					</Typography>
					<Suspense fallback={<CarouselSkeleton />}>
						<CouponsCarousel />
					</Suspense>
				</Container>
			</Box>
		</Box>
	);
};

export default Home;
