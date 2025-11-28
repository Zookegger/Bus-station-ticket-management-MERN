import React, { useEffect, useState, useMemo } from "react";
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
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { format } from "date-fns";
import type { Trip } from "@my-types/trip";
import type { Seat } from "@my-types/seat"; // Ensure this type exists based on your seat model
import type { SeatLayout } from "@components/seatmap/types";
import { API_ENDPOINTS } from "@constants/index";;
import callApi from "@utils/apiCaller";
import { SeatStatus } from "@my-types/seat"; // Assuming you have this enum on client
import { useAuth } from "@hooks/useAuth";
import type { PaymentMethod } from "@my-types";
import { Stack } from "@mui/system";
import SeatBookingSelector from "@components/seatmap/SeatLayoutSelector";

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

	// --- Selection State ---
	const [selectedPoints, setSelectedPoints] = useState<SelectedSeatPoint[]>(
		[]
	);
	const [isGuest] = useState<boolean>(Boolean(isAuthenticated && user));
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
	const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
	const [couponError, setCouponError] = useState<string | null>(null);

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
			.filter((s) => s.status === SeatStatus.BOOKED)
			.map((s) => ({
				floor: s.floor || 1, // Default to 1 if undefined
				row: s.row || 1,
				col: s.column || 1,
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

	const applyCoupon = () => {
		if (!couponCode || couponCode.trim() === "") {
			setCouponError("Please enter a coupon code");
			return;
		}
		// For now, just accept any non-empty code locally
		setAppliedCoupon(couponCode.trim());
		setCouponError(null);
	};

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

		if (isGuest) {
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

		console.log(seatIdsToBook);
		console.log(selectedPoints);

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
				guestInfo: isGuest ? guestInfo : null,
				paymentMethodCode: selectedPaymentMethod?.code,
				couponCode: null, // Add coupon logic if needed
			};

			const res = await callApi({
				method: "POST",
				url: API_ENDPOINTS.ORDER.CREATE,
				data: payload,
			});

			if (res.status === 201) {
				alert("Booking Successful!");
				window.location.href = res.paymentUrl;
				// navigate(`/orders/${res.data.order.id}`); // Navigate to detail/success page
			}
		} catch (err: any) {
			console.error(err);
			alert(
				"Booking failed: " +
					(err.message || "Unknown error")
			);
		} finally {
			setLoading(false);
		}
	};

	// --- Render ---

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" p={5}>
				<CircularProgress />
			</Box>
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
		<Box
			p={3}
			display="flex"
			justifyContent="center"
			alignItems="flex-start"
			flexWrap="wrap"
			gap={3}
			maxWidth="1200px"
			mx="auto"
		>
			{/* LEFT: Seat Selection Map */}
			<Paper sx={{ flex: 2, p: 3, minWidth: "350px" }} elevation={3}>
				<Typography variant="h6" fontWeight={600} mb={2}>
					Select your seats
				</Typography>

				<SeatBookingSelector
					initialLayout={seatLayout}
					bookedSeats={bookedSeats}
					// We pass the local state to control the component
					// Note: Ensure SeatBookingSelector supports 'selectedSeats' prop as {floor, row, col}[]
					selectedSeats={selectedPoints.map((p) => ({
						floor: p.floor,
						row: p.row,
						col: p.col,
					}))}
					onSelectionChange={handleSelectionChange}
					maxSelectable={5}
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
								? selectedPoints.map((s) => s.label).join(", ")
								: "None"}
						</Typography>
					</Typography>

					{/* Selected chips */}
					{selectedPoints.length > 0 && (
						<Box mt={2} display="flex" gap={1} flexWrap="wrap">
							{selectedPoints.map((p) => (
								<Chip
									key={p.label}
									label={p.label}
									onDelete={() => removeSelectedSeat(p.label)}
									color="primary"
									size="small"
								/>
							))}
						</Box>
					)}
				</Box>
			</Paper>

			{/* RIGHT: Info & Checkout */}
			<Box
				flex={1}
				display="flex"
				flexDirection="column"
				gap={2}
				sx={{
					minWidth: 320,
					position: { md: "sticky" },
					top: 24,
				}}
			>
				{/* Trip Summary */}
				<Paper sx={{ p: 2 }} elevation={2}>
					<Typography fontWeight={600} mb={1}>
						Trip Summary
					</Typography>
					<Box display="flex" flexDirection="column" gap={1}>
						<Typography variant="body2">
							<strong>Route:</strong> {trip.route?.name || "N/A"}
						</Typography>
						<Typography variant="body2">
							<strong>Departure:</strong>{" "}
							{trip.startTime
								? format(
										new Date(trip.startTime),
										"HH:mm - dd/MM/yyyy"
								  )
								: "N/A"}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Vehicle: {trip.vehicle?.numberPlate} (
							{trip.vehicle?.vehicleType?.name})
						</Typography>
					</Box>
				</Paper>

				{/* Passenger Info Form */}
				{isGuest && (
					<Paper sx={{ p: 2 }} elevation={2}>
						<Box display="flex" flexDirection="column" gap={2}>
							<TextField
								label="Full Name"
								fullWidth
								size="small"
								value={guestInfo.name}
								onChange={(e) =>
									setGuestInfo({
										...guestInfo,
										name: e.target.value,
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
										email: e.target.value,
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
										phone: e.target.value,
									})
								}
							/>
						</Box>
					</Paper>
				)}
				{user && (
					<Paper sx={{ p: 2 }} elevation={2}>
						<Box display="flex" flexDirection="column" gap={2}>
							<Typography>Full Name: {user.fullName}</Typography>
							<Typography>Email: {user.email}</Typography>
							<Typography>
								Phone Number: {user.phoneNumber}
							</Typography>
						</Box>
					</Paper>
				)}

				{/* Payment & Submit */}
				<Paper sx={{ p: 2 }} elevation={3}>
					<Stack divider={<Divider />}>
						<Typography fontWeight={600} gutterBottom>
							Payment
						</Typography>

						<FormControl
							error={!!formError.payment_method}
							fullWidth
							size="small"
						>
							<InputLabel
								id="payment-method-label"
								sx={{ bgcolor: "#fff" }}
							>
								Payment method
							</InputLabel>
							<Select
								fullWidth
								labelId="payment-method-label"
								size="small"
								value={selectedPaymentMethod?.code ?? ""}
								onChange={(e) => {
									const code =
										(e.target.value as string) ?? "";
									const found =
										paymentMethods?.find(
											(m) => m.code === code
										) ?? null;
									setSelectedPaymentMethod(found);
								}}
								displayEmpty
								renderValue={(value) =>
									value
										? paymentMethods?.find(
												(m) => m.code === value
										  )?.name ?? value
										: "Select payment method"
								}
							>
								{paymentMethods && paymentMethods.length > 0 ? (
									paymentMethods.map((method) => (
										<MenuItem
											key={method.code}
											value={method.code}
										>
											{method.name ?? method.code}
										</MenuItem>
									))
								) : (
									<MenuItem value="" disabled>
										No payment methods available
									</MenuItem>
								)}
							</Select>
						</FormControl>

						{/* Coupon input */}
						<Box display="flex" gap={1} alignItems="center" mt={1}>
							<TextField
								placeholder="Enter coupon code"
								size="small"
								value={couponCode}
								onChange={(e) => setCouponCode(e.target.value)}
								fullWidth
								error={!!couponError}
								helperText={couponError ?? undefined}
							/>
							<Button
								variant="outlined"
								size="small"
								onClick={applyCoupon}
							>
								Apply
							</Button>
						</Box>

						{appliedCoupon && (
							<Box mt={1}>
								<Typography
									variant="caption"
									color="success.main"
								>
									Coupon applied: {appliedCoupon}
								</Typography>
							</Box>
						)}

						{/* Price info */}
						<Box
							display="flex"
							justifyContent="space-between"
							mt={2}
						>
							<Typography variant="body2" color="text.secondary">
								Price per seat
							</Typography>
							<Typography fontWeight="bold">
								{(trip?.price || 0).toLocaleString("vi-VN")} đ
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
								{totalPrice.toLocaleString("vi-VN")} đ
							</Typography>
						</Box>

						<Button
							fullWidth
							variant="contained"
							color="success"
							size="large"
							disabled={selectedPoints.length === 0}
							onClick={handleOrderSubmit}
							sx={{ fontWeight: "bold" }}
						>
							Purchase • {totalPrice.toLocaleString("vi-VN")} đ
						</Button>
					</Stack>
				</Paper>
			</Box>
		</Box>
	);
};

export default SeatBooking;
