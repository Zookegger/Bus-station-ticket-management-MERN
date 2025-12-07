import React, { useEffect, useState, useMemo, useCallback } from "react";
import useWebsocket from "@hooks/useWebsocket";
import { useParams, useNavigate } from "react-router-dom";
import {
	Box,
	Button,
	Divider,
	MenuItem,
	Paper,
	TextField,
	Typography,
	CircularProgress,
	Alert,
	Select,
	InputLabel,
	FormControl,
	Chip,
	Snackbar,
	FormHelperText,
	Card,
	CardHeader,
	CardContent,
	CardActions,
	InputAdornment,
	Backdrop,
	useTheme,
	Avatar,
	List,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	LinearProgress,
	Stepper,
	Step,
	StepLabel,
} from "@mui/material";
import {
	ArrowBack,
	ArrowForward,
	LocationPin,
	Payment as PaymentIcon,
	Person as PersonIcon,
	Route,
	ShoppingCartCheckout,
} from "@mui/icons-material";
import { format } from "date-fns";
import type { Trip } from "@my-types/trip";
import type { Seat } from "@my-types/seat";
import type { SeatLayout } from "@components/seatmap/types";
import { API_ENDPOINTS } from "@constants/index";
import callApi from "@utils/apiCaller";
import { SeatStatus } from "@my-types/seat";
import { useAuth } from "@hooks/useAuth";
import { CouponType, type Coupon, type PaymentMethod } from "@my-types";
import { Stack } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import SeatBookingSelector from "@components/seatmap/SeatLayoutSelector";
import { ROOMS, RT_EVENTS } from "@constants/realtime";
import { formatCurrency } from "@utils/formatting";
import { Container } from "@mui/system";

// --- Types for Local State ---
interface SelectedSeatPoint {
	floor: number;
	row: number;
	col: number;
	label: string;
}

const SeatBooking: React.FC = () => {
	const { tripId } = useParams();
	const { isAuthenticated, user } = useAuth();
	const navigate = useNavigate();

	// --- Data State ---
	const [trip, setTrip] = useState<Trip | null>(null);
	const [seats, setSeats] = useState<Seat[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [formError, setFormError] = useState<Record<string, string>>({
		payment_method: "",
		coupon_code: "",
	});
	const [paymentMethods, setPaymentMethods] = useState<
		PaymentMethod[] | null
	>(null);

	// Alert for realtime seat changes
	const [alertMsg, setAlertMsg] = useState<string | null>(null);

	// --- Selection State ---
	const [selectedPoints, setSelectedPoints] = useState<SelectedSeatPoint[]>(
		[]
	);
	const [selectedPaymentMethod, setSelectedPaymentMethod] =
		useState<PaymentMethod | null>(null);

	// Guest Form State
	const [guestInfo, setGuestInfo] = useState({
		name: "",
		email: "",
		phone: "",
	});

	// UI enhancements state
	const [couponCode, setCouponCode] = useState<string>("");
	const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
	const [couponApplied, setCouponApplied] = useState<boolean>(false);
	const [couponError, setCouponError] = useState<string | null>(null);
	const [discountAmount, setDiscountAmount] = useState<number>(0);

	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));
	const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

	const [step, setStep] = useState<number>(1);

	// Determine seat selector size based on breakpoint with a sensible default
	const seatSelectorSize = isDesktop
		? "large"
		: isTablet
		? "medium"
		: isMobile
		? "small"
		: "medium";

	// --- Fetch Data ---
	useEffect(() => {
		if (!tripId) return;

		const fetchData = async () => {
			try {
				setLoading(true);
				// 1. Fetch Trip Details
				// NOTE: Ensure backend 'getTripById' includes: [{ model: Vehicle, include: [VehicleType] }]
				const parsedId = Number.parseInt(tripId, 10);
				if (Number.isNaN(parsedId)) throw new Error("Invalid trip id");

				const tripRes = await callApi({
					method: "GET",
					url: API_ENDPOINTS.TRIP.BY_ID(parsedId),
				});

				if (!tripRes) throw new Error("Failed to load trip");
				setTrip(tripRes);

				// 2. Fetch Seats for this Trip
				const seatsRes = await callApi({
					method: "GET",
					url: API_ENDPOINTS.SEAT.BY_TRIP_ID(parsedId), // Assuming /seats
				});

				if (!seatsRes) {
					throw new Error("No response");
				}

				const seatData = Array.isArray(seatsRes.rows)
					? seatsRes.rows || seatsRes.data.rows
					: [];
				setSeats(seatData);

				// 3. Load in Payment methods
				const paymentMethodsRes = await callApi({
					method: "GET",
					url: API_ENDPOINTS.PAYMENT_METHOD.ACTIVE,
				});

				if (!paymentMethodsRes) {
					throw new Error(
						"No online gateway payment method available."
					);
				}

				const methodData = Array.isArray(paymentMethodsRes.rows)
					? paymentMethodsRes.rows || paymentMethodsRes.data.rows
					: null;

				setPaymentMethods(methodData);
			} catch (err: any) {
				console.error("Error fetching booking data:", err);
				setError(err.message || "Could not load booking details");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [tripId]);

	// --- Computed Properties ---

	// 1. Extract Layout from Trip -> Vehicle -> VehicleType
	const seatLayout = useMemo<SeatLayout | null>(() => {
		if (!trip?.vehicle?.vehicleType?.seatLayout) return null;
		try {
			return JSON.parse(trip.vehicle.vehicleType.seatLayout);
		} catch (e) {
			console.error("Failed to parse seat layout", e);
			return null;
		}
	}, [trip]);

	// 2. Identify Booked Seats (for the Selector component)
	const bookedSeats = useMemo(() => {
		return seats
			.filter(
				(s) => String(s.status).toUpperCase() !== SeatStatus.AVAILABLE
			)
			.map((s) => ({
				floor: (s.floor || 1) - 1, // Convert 1-based to 0-based
				row: (s.row || 1) - 1, // Convert 1-based to 0-based
				col: (s.column || 1) - 1, // Convert 1-based to 0-based
			}));
	}, [seats]);

	// Sorted stops for itinerary display
	const stopsSorted = useMemo(() => {
		if (!trip?.route?.stops) return [];
		return [...trip.route.stops].sort(
			(a, b) => (Number(a.stopOrder) || 0) - (Number(b.stopOrder) || 0)
		);
	}, [trip]);

	// 2b. Build a map / detailed list of seat statuses keyed for the selector.
	// The selector may not support status today; we provide a detailed
	// structure so it can be upgraded without changing this page later.
	const seatStatusMap = useMemo(() => {
		const map: Record<
			string,
			{ id: number; status: SeatStatus; number?: string }
		> = {};
		seats.forEach((s) => {
			const key = `${(s.floor || 1) - 1}_${(s.row || 1) - 1}_${
				(s.column || 1) - 1
			}`;
			map[key] = {
				id: s.id,
				status: s.status,
				number: (s as any).number,
			};
		});
		return map;
	}, [seats]);

	const occupiedSeatsDetailed = useMemo(() => {
		return seats.map((s) => ({
			id: s.id,
			floor: (s.floor || 1) - 1,
			row: (s.row || 1) - 1,
			col: (s.column || 1) - 1,
			status: s.status,
			number: (s as any).number,
		}));
	}, [seats]);

	// 3. Calculate Total Price
	const totalPrice = useMemo(() => {
		return (trip?.price || 0) * selectedPoints.length;
	}, [trip, selectedPoints]);

	// --- Handlers ---

	// Remove a selected seat by label
	const removeSelectedSeat = (label: string) => {
		setSelectedPoints((prev) => prev.filter((p) => p.label !== label));
	};

	// Websocket handler for seat updates
	const handleSeatUpdate = useCallback((payload: Seat[] | Seat) => {
		const updatedSeats = Array.isArray(payload) ? payload : [payload];

		setSeats((prevSeats) => {
			const newSeats = [...prevSeats];
			updatedSeats.forEach((update) => {
				const index = newSeats.findIndex((s) => s.id === update.id);
				if (index !== -1) {
					newSeats[index] = { ...newSeats[index], ...update };
				}
			});
			return newSeats;
		});

		// Remove stolen seats from my selection and notify
		setSelectedPoints((prevSelected) => {
			const stolenLabels: string[] = [];
			const validSelection = prevSelected.filter((point) => {
				const isTaken = updatedSeats.some(
					(s) =>
						String(s.status).toUpperCase() !==
							SeatStatus.AVAILABLE &&
						s.floor === point.floor + 1 &&
						s.row === point.row + 1 &&
						s.column === point.col + 1
				);

				if (isTaken) {
					stolenLabels.push(point.label);
					return false;
				}
				return true;
			});

			if (stolenLabels.length > 0) {
				setAlertMsg(
					`Alert: Seat(s) ${stolenLabels.join(
						", "
					)} were just booked by another user.`
				);
			}

			return validSelection;
		});
	}, []);

	// Initialize websocket and subscribe to seat events
	const { socket, emitEvent, isConnected } = useWebsocket({
		events: {
			[RT_EVENTS.SEAT_BULK]: handleSeatUpdate,
			[RT_EVENTS.SEAT_UPDATE]: handleSeatUpdate,
		},
		auto_connect: true,
		requireAuth: false,
	});

	// Join trip room when tripId/socket available
	useEffect(() => {
		if (tripId && socket && isConnected && emitEvent) {
			const roomName = ROOMS.trip(tripId);
			emitEvent("room:join", { room: roomName });

			return () => {
				emitEvent("room:leave", { room: roomName });
			};
		}
	}, [tripId, socket, isConnected, emitEvent]);

	const applyCoupon = async () => {
		setCouponError(null);

		if (!couponCode || couponCode.trim() === "") {
			setCouponError("Please enter a coupon code");
			return;
		}

		try {
			setLoading(true);
			const { status, data } = await callApi(
				{
					method: "GET",
					url: API_ENDPOINTS.COUPON.BY_CODE(couponCode),
				},
				{ returnFullResponse: true }
			);

			if (status !== 304 && status !== 200) {
				throw new Error("Coupon validation failed");
			}

			// API may return an array or a single object
			const res_coupon: Coupon | null = Array.isArray(data)
				? data.length > 0
					? (data[0] as Coupon)
					: null
				: (data as Coupon | null);

			const now = new Date();

			if (!res_coupon) {
				setCouponError("Invalid coupon code.");
				return;
			}

			// Check usage limits
			if (
				typeof res_coupon.maxUsage === "number" &&
				res_coupon.maxUsage > 0 &&
				typeof res_coupon.currentUsageCount === "number" &&
				res_coupon.currentUsageCount >= res_coupon.maxUsage
			) {
				setCouponError("Coupon usage limit reached.");
				return;
			}

			const start = res_coupon.startPeriod
				? new Date(res_coupon.startPeriod)
				: null;
			const end = res_coupon.endPeriod
				? new Date(res_coupon.endPeriod)
				: null;

			if (start && now < start) {
				setCouponError("Coupon not active yet.");
				return;
			}

			if (end && now > end) {
				setCouponError("Coupon has expired.");
				return;
			}

			if (!res_coupon.isActive) {
				setCouponError("Coupon is not active.");
				return;
			}

			// Compute discount based on current selection
			const seatsCount = selectedPoints.length || 1; // treat 1 as default for preview
			const subtotal = (trip?.price || 0) * seatsCount;
			let discount = 0;
			if (res_coupon.type.toUpperCase() === CouponType.PERCENTAGE) {
				const pct = Number(res_coupon.value) || 0;
				discount = (subtotal * pct) / 100;
			} else {
				const fixed = Number(res_coupon.value) || 0;
				discount = Math.min(fixed, subtotal);
			}

			setDiscountAmount(Number(discount.toFixed(2)));
			setAppliedCoupon(res_coupon);
			setCouponApplied(true);
			setCouponError(null);
		} catch (err: any) {
			setCouponError(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Recompute discount when applied coupon, selected seats or trip price changes
	useEffect(() => {
		if (!appliedCoupon) {
			setDiscountAmount(0);
			return;
		}

		const seatsCount = selectedPoints.length || 1;
		const subtotal = (trip?.price || 0) * seatsCount;
		let discount = 0;
		if (appliedCoupon.type.toUpperCase() === CouponType.PERCENTAGE) {
			const pct = Number(appliedCoupon.value) || 0;
			discount = (subtotal * pct) / 100;
		} else {
			const fixed = Number(appliedCoupon.value) || 0;
			discount = Math.min(fixed, subtotal);
		}

		setDiscountAmount(Number(discount.toFixed(2)));
	}, [appliedCoupon, selectedPoints, trip?.price]);

	const handleSelectionChange = (newSelection: SelectedSeatPoint[]) => {
		setSelectedPoints(newSelection);
	};

	const handleOrderSubmit = async (
		event: React.MouseEvent<HTMLButtonElement>
	) => {
		event.preventDefault();

		
		if (!trip) return;
		

		// basic validations
		if (!selectedPaymentMethod) {
			setFormError((f) => ({
				...f,
				payment_method: "Select a payment method",
			}));
			return;
		} else {
			setFormError((f) => ({ ...f, payment_method: "" }));
		}

		if (!user && !isAuthenticated) {
			const missing: Record<string, string> = {};
			if (!guestInfo.name) missing.name = "Name is required";
			if (!guestInfo.email) missing.email = "Email is required";
			if (!guestInfo.phone) missing.phone = "Phone is required";
			if (Object.keys(missing).length > 0) {
				setFormError((f) => ({ ...f, ...missing }));
				return;
			}
		}

		// Map visual selection back to database IDs
		const seatIdsToBook = selectedPoints
			.map((point) => {
				const matchedSeat = seats.find(
					(s) =>
						s.floor === point.floor + 1 &&
						s.row === point.row + 1 &&
						s.column === point.col + 1
				);

				return matchedSeat?.id;
			})
			.filter((id): id is number => id !== undefined && id !== null);

		if (seatIdsToBook.length !== selectedPoints.length) {
			alert(
				"Error: Could not match some selected seats to system records. Please refresh."
			);
			console.error(
				"Error: Could not match some selected seats to system records. Please refresh."
			);
			return;
		}

		try {
			setLoading(true);
			const payload = {
				seatIds: seatIdsToBook,
				userId: isAuthenticated && user ? user.id : null, // Replace with actual auth user ID
				guestInfo: isAuthenticated && user ? null : guestInfo,
				paymentMethodCode: selectedPaymentMethod?.code,
				couponCode: appliedCoupon?.code || null,
			};

			const { status, data } = await callApi({
				method: "POST",
				url: API_ENDPOINTS.ORDER.CREATE,
				data: payload,
			}, { returnFullResponse: true });

			console.log(status);
			console.log(data);

			if (status === 201 && data) {
				window.location.href = data.paymentUrl;
			}

		} catch (err: any) {
			console.error(err);
			alert("Booking failed: " + (err.message || "Unknown error"));
		} finally {
			setLoading(false);
		}
	};

	// --- Render ---

	if (loading) {
		return (
			<Backdrop open={loading}>
				<CircularProgress />
			</Backdrop>
		);
	}

	if (error || !trip || !seatLayout) {
		return (
			<Box p={3}>
				<Alert severity="error">
					{error ||
						"Trip data incomplete. Ensure vehicle layout is configured."}
				</Alert>
				<Button
					startIcon={<ArrowBack />}
					onClick={() => navigate(-1)}
					sx={{ mt: 2 }}
				>
					Go Back
				</Button>
			</Box>
		);
	}

	return (
		<Container maxWidth={"lg"}>
			<Box
				sx={{
					width: "100%",
					mt: 3,
					position: "sticky",
					top: 24,
				}}
			>
				<Stepper activeStep={Math.max(0, step - 1)} alternativeLabel>
					<Step>
						<StepLabel>Select seats</StepLabel>
					</Step>
					<Step>
						<StepLabel>Passenger & Payment</StepLabel>
					</Step>
				</Stepper>
				<LinearProgress
					variant="determinate"
					value={(step / 2) * 100}
				/>
			</Box>
			<Box
				p={3}
				display="flex"
				justifyContent="center"
				alignItems="flex-start"
				flexWrap="wrap"
				flex={1}
				gap={3}
				flexDirection={"row"}
			>
				{step === 1 ? (
					<>
						{/* Real-time alerts for seat updates */}
						<Snackbar
							open={Boolean(alertMsg)}
							autoHideDuration={6000}
							onClose={() => setAlertMsg(null)}
							anchorOrigin={{
								vertical: "top",
								horizontal: "center",
							}}
						>
							<Alert
								severity="warning"
								onClose={() => setAlertMsg(null)}
								variant="standard"
							>
								<Typography
									variant="h6"
									textAlign={"center"}
									sx={{ verticalAlign: "middle" }}
								>
									{alertMsg}
								</Typography>
							</Alert>
						</Snackbar>
						{/* LEFT: Seat Selection Map */}
						<Paper
							sx={{
								flex:
									isTablet || isDesktop
										? 3
										: isMobile
										? 2
										: 2,
								p: 3,
								display: "flex",
								flexDirection: "column",
								height: "100%",
							}}
							elevation={3}
						>
							<Typography variant="h6" fontWeight={600} mb={2}>
								Select your seats
							</Typography>

							<SeatBookingSelector
								initialLayout={seatLayout}
								bookedSeats={bookedSeats}
								// Detailed seat status info (optional) — selector can opt-in to use this
								seatStatusMap={seatStatusMap}
								occupiedSeatsDetailed={occupiedSeatsDetailed}
								// We pass the local state to control the component
								// Note: Ensure SeatBookingSelector supports 'selectedSeats' prop as {floor, row, col}[]
								selectedSeats={selectedPoints.map((p) => ({
									floor: p.floor,
									row: p.row,
									col: p.col,
								}))}
								onSelectionChange={handleSelectionChange}
								maxSelectable={5}
								size={seatSelectorSize}
							/>

							<Divider sx={{ my: 3 }} />

							<Box
								display="flex"
								justifyContent="space-between"
								alignItems="center"
							>
								<Typography fontWeight={500}>
									Selected:{" "}
									<Typography
										component="span"
										fontWeight="bold"
										color="primary"
									>
										{selectedPoints.length > 0
											? selectedPoints
													.map((s) => s.label)
													.join(", ")
											: "None"}
									</Typography>
								</Typography>

								{/* Selected chips */}
								{selectedPoints.length > 0 && (
									<Box
										mt={2}
										display="flex"
										gap={1}
										flexWrap="wrap"
									>
										{selectedPoints.map((p) => (
											<Chip
												key={p.label}
												label={p.label}
												onDelete={() =>
													removeSelectedSeat(p.label)
												}
												color="primary"
												size="medium"
											/>
										))}
									</Box>
								)}
							</Box>
						</Paper>

						{/* RIGHT: Info & Checkout */}
						<Box
							flex={isTablet || isDesktop ? 2 : isMobile ? 2 : 1}
							display="flex"
							flexDirection="column"
							gap={2}
							sx={{
								position: { md: "sticky" },
								top: 24,
							}}
						>
							{/* Trip Summary */}
							<Card>
								<Paper elevation={2}>
									<CardHeader
										title={
											<InputAdornment position="start">
												<Route
													fontSize="medium"
													sx={{ mr: 0.5 }}
												/>
												<Typography
													variant="h6"
													fontWeight={600}
												>
													Trip Summary
												</Typography>
											</InputAdornment>
										}
									/>

									<CardContent>
										<Box
											display="flex"
											flexDirection="column"
											gap={1}
										>
											<Typography variant="body1">
												<strong>Vehicle:</strong>{" "}
												{trip.vehicle?.numberPlate} (
												{
													trip.vehicle?.vehicleType
														?.name
												}
												)
											</Typography>
											<Typography variant="body1">
												<strong>Departure:</strong>{" "}
												{trip.startTime
													? format(
															new Date(
																trip.startTime
															),
															"HH:mm - dd/MM/yyyy"
													  )
													: "N/A"}
											</Typography>
											<Typography variant="body1">
												<strong>Route:</strong>{" "}
											</Typography>
											<List>
												{stopsSorted.length > 0
													? stopsSorted.map(
															(stop, index) => {
																const isEnd =
																	index ===
																	stopsSorted.length -
																		1;
																const color =
																	isEnd
																		? theme
																				.palette
																				.primary
																				.main
																		: theme
																				.palette
																				.text
																				.primary;
																return (
																	<Box
																		key={
																			stop.id ||
																			index
																		}
																		sx={{
																			display:
																				"flex",
																			mb:
																				index ===
																				stopsSorted.length -
																					1
																					? 0
																					: 2,
																			position:
																				"relative",
																		}}
																	>
																		{/* Connecting Line */}
																		{!isEnd && (
																			<Box
																				sx={{
																					position:
																						"absolute",
																					top: 32,
																					left: 20,
																					bottom: -16,
																					width: 2,
																					bgcolor:
																						"grey.300",
																					zIndex: 0,
																				}}
																			/>
																		)}

																		{/* Icon Marker */}
																		<Box
																			sx={{
																				mr: 1,
																				zIndex: 1,
																			}}
																		>
																			<Avatar
																				sx={{
																					width: 40,
																					height: 40,
																					bgcolor:
																						"white",
																					border: "3px solid",
																					borderColor:
																						color,
																					color: color,
																				}}
																			>
																				<LocationPin fontSize="medium" />
																			</Avatar>
																		</Box>

																		{/* Info Card */}
																		<Paper
																			elevation={
																				0
																			}
																			variant="outlined"
																			sx={{
																				flex: 1,
																				p: 1.5,
																				bgcolor:
																					"background.paper",
																				border: "1px solid",
																				borderColor:
																					"grey.200",
																				"&:hover":
																					{
																						borderColor:
																							"primary.light",
																					},
																			}}
																		>
																			<Typography
																				variant="subtitle2"
																				fontWeight="600"
																			>
																				{
																					stop.locations!
																						.name
																				}
																			</Typography>
																			<Typography
																				variant="body2"
																				color="text.secondary"
																				sx={{
																					fontSize:
																						"0.85rem",
																				}}
																			>
																				{
																					stop.locations!
																						.address
																				}
																			</Typography>
																		</Paper>
																	</Box>
																);
															}
													  )
													: "N/A"}
											</List>
										</Box>

										<Box
											display="flex"
											justifyContent="space-between"
											mt={2}
										>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												Price per seat
											</Typography>
											<Typography fontWeight="bold">
												{formatCurrency(
													trip?.price,
													"VND",
													"vi-VN"
												)}
											</Typography>
										</Box>
										<Box
											display="flex"
											justifyContent="space-between"
											mb={2}
										>
											<Typography>
												Seats ({selectedPoints.length})
											</Typography>
											<Typography fontWeight="bold">
												{formatCurrency(
													totalPrice,
													"VND",
													"vi-VN"
												)}
											</Typography>
										</Box>
									</CardContent>

									<CardActions>
										<Button
											variant="contained"
											fullWidth
											onClick={() => setStep(2)}
											disabled={
												selectedPoints.length === 0
											}
											endIcon={<ArrowForward />}
										>
											Continue
										</Button>
									</CardActions>
								</Paper>
							</Card>
						</Box>
					</>
				) : (
					<>
						<Box
							flex={1}
							display="flex"
							flexDirection={isMobile ? "column" : "row"}
							gap={2}
							sx={{
								position: { md: "sticky" },
								top: 24,
							}}
						>
							<Paper
								variant="outlined"
								sx={{
									flex:
										isDesktop || isTablet
											? 3
											: isMobile
											? 2.5
											: 2,
									display: "flex",
									flexDirection: "column",
									overflow: "hidden", // Prevents double scrollbars
									maxHeight: "50vh", // Fixed height for the whole card
								}}
							>
								{/* Checkout info */}
								<TableContainer
									component={Paper}
									variant="outlined"
									sx={{
										flex:
											isDesktop || isTablet
												? 3
												: isMobile
												? 2.5
												: 2,

										overflowY: "auto",
									}}
								>
									<Table
										stickyHeader
										size="medium"
										aria-label="checkout order table"
									>
										<TableHead>
											<TableRow>
												<TableCell>
													<Typography
														fontWeight={"bold"}
													>
														Items
													</Typography>
												</TableCell>
												<TableCell align="right">
													<Typography
														fontWeight={"bold"}
													>
														Amount
													</Typography>
												</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{/* 1. List Individual Seats */}
											{selectedPoints.map((point) => (
												<TableRow key={point.label}>
													<TableCell scope="row">
														Seat {point.label}
														<Typography
															variant="caption"
															display="block"
															color="text.secondary"
														>
															{trip?.vehicle
																?.vehicleType
																?.name ||
																"Standard"}
														</Typography>
													</TableCell>
													<TableCell align="right">
														{formatCurrency(
															trip?.price,
															"VND",
															"vi-VN"
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>

								<Box
									sx={{
										p: 2,
										bgcolor: "background.paper",
										borderTop: "1px solid",
										borderColor: "divider",
										zIndex: 1, // Ensures it sits on top if needed
										boxShadow:
											"0px -4px 10px rgba(0,0,0,0.05)", // Subtle shadow to indicate depth
									}}
								>
									{/* Subtotal Row */}
									<Box
										display="flex"
										justifyContent="space-between"
										mb={1}
									>
										<Typography
											variant="body2"
											color="text.secondary"
										>
											Subtotal ({selectedPoints.length}{" "}
											items)
										</Typography>
										<Typography variant="body2">
											{formatCurrency(
												(trip?.price || 0) *
													selectedPoints.length,
												"VND",
												"vi-VN"
											)}
										</Typography>
									</Box>

									{/* Discount Row (Conditional) */}
									{discountAmount > 0 && (
										<Box
											display="flex"
											justifyContent="space-between"
											mb={1}
										>
											<Typography
												variant="body2"
												color="success.main"
											>
												Discount{" "}
												{appliedCoupon
													? `(${appliedCoupon.code})`
													: ""}
											</Typography>
											<Typography
												variant="body2"
												color="success.main"
											>
												-{" "}
												{formatCurrency(
													discountAmount,
													"VND",
													"vi-VN"
												)}
											</Typography>
										</Box>
									)}

									<Divider sx={{ my: 1 }} />

									{/* Total Row */}
									<Box
										display="flex"
										justifyContent="space-between"
										alignItems="center"
									>
										<Typography
											variant="h6"
											fontWeight="bold"
										>
											Total
										</Typography>
										<Typography
											variant="h6"
											fontWeight="bold"
											color="primary"
										>
											{(() => {
												const sub =
													(trip?.price || 0) *
													selectedPoints.length;
												const final = Math.max(
													0,
													sub - discountAmount
												);
												return formatCurrency(
													final,
													"VND",
													"vi-VN"
												);
											})()}
										</Typography>
									</Box>
								</Box>
							</Paper>

							<Box
								flex={
									isDesktop || isTablet ? 2 : isMobile ? 2 : 1
								}
								display="flex"
								flexDirection="column"
								gap={2}
								sx={{
									position: { md: "sticky" },
									top: 24,
								}}
							>
								{/* Passenger Info Form */}
								<Card>
									<CardHeader
										title={
											<InputAdornment position="start">
												<PersonIcon
													fontSize="medium"
													sx={{ mr: 0.5 }}
												/>
												<Typography
													variant="h6"
													fontWeight={600}
												>
													Passenger Information
												</Typography>
											</InputAdornment>
										}
									/>
									<Divider />
									<Paper elevation={2}>
										<CardContent>
											{!(isAuthenticated && user) ? (
												<Box
													display="flex"
													flexDirection="column"
													gap={2}
												>
													<TextField
														label="Full Name"
														fullWidth
														size="small"
														value={guestInfo.name}
														onChange={(e) =>
															setGuestInfo({
																...guestInfo,
																name: e.target
																	.value,
															})
														}
													/>
													<TextField
														label="Email"
														fullWidth
														size="small"
														type="email"
														value={guestInfo.email}
														onChange={(e) =>
															setGuestInfo({
																...guestInfo,
																email: e.target
																	.value,
															})
														}
													/>
													<TextField
														label="Phone Number"
														fullWidth
														size="small"
														value={guestInfo.phone}
														onChange={(e) =>
															setGuestInfo({
																...guestInfo,
																phone: e.target
																	.value,
															})
														}
													/>
												</Box>
											) : (
												<Box
													display="flex"
													flexDirection="column"
													gap={2}
												>
													<Typography>
														Full Name:{" "}
														{user.fullName}
													</Typography>
													<Typography>
														Email: {user.email}
													</Typography>
													<Typography>
														Phone Number:{" "}
														{user.phoneNumber}
													</Typography>
												</Box>
											)}
										</CardContent>
									</Paper>
								</Card>

								{/* Payment & Submit */}
								<Card>
									<Paper elevation={3}>
										<Stack divider={<Divider />}>
											<CardHeader
												title={
													<InputAdornment position="start">
														<PaymentIcon
															fontSize="medium"
															sx={{ mr: 0.5 }}
														/>
														<Typography
															fontWeight={600}
															variant="h6"
														>
															Payment
														</Typography>
													</InputAdornment>
												}
											/>
											<CardContent>
												<FormControl
													error={
														!!formError.payment_method
													}
													fullWidth
													size="medium"
													// If you are using the outlined variant (default), this is standard
													variant="outlined"
												>
													<InputLabel
														id="payment-method-label"
														shrink={true}
													>
														Payment method
													</InputLabel>
													<Select
														labelId="payment-method-label"
														id="payment-method-select"
														label="Payment method"
														value={
															selectedPaymentMethod?.code ||
															""
														}
														displayEmpty
														onChange={(e) => {
															const code = e
																.target
																.value as string;
															const found =
																paymentMethods?.find(
																	(m) =>
																		m.code ===
																		code
																) || null;
															setSelectedPaymentMethod(
																found
															);
														}}
														renderValue={(
															selected
														) => {
															// If nothing is selected, return the placeholder with opacity/styling
															if (!selected) {
																return (
																	<span
																		style={{
																			color: "#aaa",
																		}}
																	>
																		Select
																		payment
																		method
																	</span>
																);
															}
															// Since you have the object in state, use it. No need to .find() again.
															return (
																selectedPaymentMethod?.name ||
																selected
															);
														}}
													>
														{/* Handle the empty/loading state gracefully */}
														{paymentMethods?.length ? (
															paymentMethods.map(
																(method) => (
																	<MenuItem
																		key={
																			method.code
																		}
																		value={
																			method.code
																		}
																	>
																		{method.name ||
																			method.code}
																	</MenuItem>
																)
															)
														) : (
															<MenuItem
																disabled
																value=""
															>
																<em>
																	No payment
																	methods
																	available
																</em>
															</MenuItem>
														)}
													</Select>

													{/* Only render helper text if there is an error */}
													{!!formError.payment_method && (
														<FormHelperText>
															{
																formError.payment_method
															}
														</FormHelperText>
													)}
												</FormControl>

												{/* Coupon input */}
												<Box
													display="flex"
													gap={1}
													alignItems="stretch"
													justifyContent={"center"}
													mt={2}
												>
													<TextField
														placeholder="Enter coupon code"
														value={couponCode}
														onChange={(e) =>
															setCouponCode(
																e.target.value
															)
														}
														fullWidth
														error={!!couponError}
														slotProps={{
															htmlInput: {
																sx: {
																	height: "100%",
																	flex: 1,
																},
															},
														}}
													/>
													<Button
														variant="contained"
														disabled={couponApplied}
														onClick={applyCoupon}
													>
														Apply
													</Button>
												</Box>
												{couponError && (
													<Typography
														variant="caption"
														color="error"
													>
														{couponError}
													</Typography>
												)}

												{/* Applied coupon summary + breakdown */}
												{appliedCoupon && (
													<Box
														mt={1}
														display="flex"
														flexDirection="column"
														gap={0.5}
													>
														<Box
															display="flex"
															alignItems="center"
															gap={1}
														>
															<Chip
																label={`${
																	appliedCoupon.code
																} • ${
																	appliedCoupon.title ||
																	""
																}`}
																color="success"
																size="small"
																onDelete={() => {
																	setAppliedCoupon(
																		null
																	);
																	setCouponApplied(
																		false
																	);
																	setDiscountAmount(
																		0
																	);
																	setCouponCode(
																		""
																	);
																}}
															/>
															<Typography
																variant="caption"
																color="text.secondary"
															>
																{appliedCoupon.type.toUpperCase() ===
																CouponType.PERCENTAGE
																	? `${appliedCoupon.value}% off`
																	: `${formatCurrency(
																			Number(
																				appliedCoupon.value ||
																					0
																			),
																			"VND",
																			"vi-VN"
																	  )} off`}
															</Typography>
														</Box>
														{/* validity */}
														<Typography
															variant="caption"
															color="text.secondary"
														>
															Valid until:{" "}
															{appliedCoupon.endPeriod
																? format(
																		new Date(
																			appliedCoupon.endPeriod
																		),
																		"dd/MM/yyyy HH:mm"
																  )
																: "N/A"}
														</Typography>
													</Box>
												)}
											</CardContent>
											<CardActions
												sx={{ alignItems: "stretch" }}
											>
												{(() => {
													const subtotal =
														(trip?.price || 0) *
														selectedPoints.length;
													const discount =
														discountAmount || 0;
													const finalTotal = Math.max(
														0,
														subtotal - discount
													);
													return (
														<>
															<Button
																fullWidth
																variant="contained"
																color="success"
																size="large"
																disabled={
																	selectedPoints.length ===
																		0 ||
																	!selectedPaymentMethod
																}
																onClick={
																	handleOrderSubmit
																}
																sx={{
																	fontWeight:
																		"bold",
																	flex: 3,
																}}
																startIcon={
																	<ShoppingCartCheckout />
																}
															>
																Purchase •{" "}
																{formatCurrency(
																	finalTotal,
																	"VND",
																	"vi-VN"
																)}
															</Button>
															<Button
																variant="outlined"
																onClick={() =>
																	setStep(1)
																}
																sx={{
																	flex: 1,
																}}
																startIcon={
																	<ArrowBack />
																}
															>
																Back
															</Button>
														</>
													);
												})()}
											</CardActions>
										</Stack>
									</Paper>
								</Card>
							</Box>
						</Box>
					</>
				)}
			</Box>
		</Container>
	);
};

export default SeatBooking;
