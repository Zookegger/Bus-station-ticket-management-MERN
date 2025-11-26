import { useState, useMemo } from "react";
import {
	Box,
	Button,
	Divider,
	MenuItem,
	Paper,
	TextField,
	Typography,
} from "@mui/material";
// - Updated import path based on context
import SeatBookingSelector from "@components/seatmap/SeatLayoutSelector"; // Adjust path if moved to @components
import type { SeatLayout } from "@components/seatmap";

// Mock Layout for a 40-seat sleeper bus (2 Floors, 3 columns, ~7 rows)
const MOCK_LAYOUT: SeatLayout = [
	// Floor 1
	[
		["available", "available", "aisle", "available", "available"],
		["available", "available", "aisle", "available", "available"],
		["available", "available", "aisle", "available", "available"],
		["available", "available", "aisle", "available", "available"],
		["available", "available", "aisle", "available", "available"],
		["available", "available", "aisle", "available", "available"],
		["available", "available", "aisle", "available", "available"],
	],
	// Floor 2
	[
		["available", "aisle", "available"],
		["available", "aisle", "available"],
		["available", "aisle", "available"],
		["available", "aisle", "available"],
		["available", "aisle", "available"],
		["available", "aisle", "available"],
		["available", "aisle", "available"],
	],
];

interface SelectedSeat {
	floor: number;
	row: number;
	col: number;
	label: string;
}

const SeatBooking = () => {
	// Store full seat objects to handle both logic (indices) and display (labels)
	const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
	const [isGuest, setIsGuest] = useState(true);
	const pricePerSeat = 100000;

	// Handler for the Selector component
	const handleSelectionChange = (seats: SelectedSeat[]) => {
		setSelectedSeats(seats);
	};

	const totalPrice = selectedSeats.length * pricePerSeat;

	return (
		<Box
			p={3}
			display="flex"
			justifyContent="center"
			alignItems="flex-start"
		>
			{/* LEFT: Seat Selection Map */}
			<Paper sx={{ flex: 2, p: 3, minWidth: "300px" }} elevation={3}>
				<Typography variant="h6" fontWeight={600} mb={2}>
					Select your seats
				</Typography>

				{/* Interactive Seat Map */}
				<SeatBookingSelector
					initialLayout={MOCK_LAYOUT}
					selectedSeats={selectedSeats} // Pass state down for controlled component
					onSelectionChange={handleSelectionChange}
					maxSelectable={5} // Optional limit
					bookedSeats={[{ floor: 0, row: 0, col: 0 }]} // Example booked seat
				/>

				<Divider sx={{ my: 3 }} />

				{/* Selected List Display */}
				<Typography fontWeight={500}>
					Selected Seats:{" "}
					<Typography
						component="span"
						fontWeight="bold"
						color="primary"
					>
						{selectedSeats.length > 0
							? selectedSeats.map((s) => s.label).join(", ")
							: "None"}
					</Typography>
				</Typography>
			</Paper>

			{/* RIGHT: Info Section */}
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
				{/* 🚌 Trip Information */}
				<Paper sx={{ p: 2 }} elevation={2}>
					<Typography fontWeight={600} mb={1}>
						Trip Information
					</Typography>
					<Box display="flex" flexDirection="column" gap={0.5}>
						<Typography variant="body2">🚌 HCM → Đà Lạt</Typography>
						<Typography variant="body2">
							⏰ 22:00 - 12/11/2025
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Nhà xe Phương Trang
						</Typography>
					</Box>
				</Paper>

				{/* 🚗 Bus Info */}
				<Paper sx={{ p: 2 }} elevation={2}>
					<Typography fontWeight={600} mb={1}>
						Bus Information
					</Typography>
					<Box display="flex" flexDirection="column" gap={0.5}>
						<Typography variant="body2">
							Biển số: 51B-12345
						</Typography>
						<Typography variant="body2">
							Loại xe: Giường nằm 40 chỗ
						</Typography>
						<Typography variant="body2">
							Ghế trống: {40 - 1 - selectedSeats.length}{" "}
							{/* Minus mocked booked seat */}
						</Typography>
					</Box>
				</Paper>

				{/* 👤 User or Guest Info */}
				<Paper sx={{ p: 2 }} elevation={2}>
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
						mb={2}
					>
						<Typography fontWeight={600}>Passenger Info</Typography>
						<Button
							size="small"
							onClick={() => setIsGuest(!isGuest)}
							sx={{ textTransform: "none" }}
						>
							{isGuest ? "Login?" : "Guest?"}
						</Button>
					</Box>

					{isGuest ? (
						<Box display="flex" flexDirection="column" gap={2}>
							<TextField
								label="Họ và tên"
								fullWidth
								size="small"
							/>
							<TextField label="Email" fullWidth size="small" />
							<TextField
								label="Số điện thoại"
								fullWidth
								size="small"
							/>
						</Box>
					) : (
						<Box display="flex" flexDirection="column" gap={0.5}>
							<Typography variant="body2">
								<strong>Tên:</strong> Nguyễn Văn A
							</Typography>
							<Typography variant="body2">
								<strong>Email:</strong> example@gmail.com
							</Typography>
							<Typography variant="body2">
								<strong>SĐT:</strong> 0901234567
							</Typography>
						</Box>
					)}
				</Paper>

				{/* 🎟️ Coupon */}
				<Paper sx={{ p: 2 }} elevation={2}>
					<Typography fontWeight={600} mb={1}>
						Coupon
					</Typography>
					<Box display="flex" gap={1}>
						<TextField
							fullWidth
							placeholder="Enter coupon code"
							size="small"
						/>
						<Button variant="contained" size="small">
							Apply
						</Button>
					</Box>
				</Paper>

				{/* 💳 Payment */}
				<Paper sx={{ p: 2, bgcolor: "#f5fbf5" }} elevation={3}>
					<Typography fontWeight={600} mb={1}>
						Payment
					</Typography>
					<TextField
						select
						fullWidth
						label="Select payment method"
						size="small"
						defaultValue=""
					>
						<MenuItem value="momo">MoMo</MenuItem>
						<MenuItem value="vnpay">VNPay</MenuItem>
						<MenuItem value="cash">Cash</MenuItem>
					</TextField>

					<Divider sx={{ my: 2 }} />

					<Box display="flex" justifyContent="space-between" mb={2}>
						<Typography>Seats ({selectedSeats.length})</Typography>
						<Typography fontWeight="bold">
							{totalPrice.toLocaleString("vi-VN")} đ
						</Typography>
					</Box>

					<Button
						fullWidth
						variant="contained"
						color="success"
						size="large"
						disabled={selectedSeats.length === 0}
						sx={{ fontWeight: "bold" }}
					>
						Purchase • {totalPrice.toLocaleString("vi-VN")} đ
					</Button>
				</Paper>
			</Box>
		</Box>
	);
};

export default SeatBooking;
