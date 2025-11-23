import { useState } from "react";
import {
  Box,
  Grid,
  Button,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Divider,
} from "@mui/material";

const seatRows = [
  ["A1", "A2"],
  ["B1", "B2"],
  ["C1", "C2"],
  ["D1", "D2"],
  ["E1", "E2"],
  ["F1", "F2"],
  ["G1", "G2"],
  ["H1", "H2"],
];

const SeatBooking = () => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isGuest, setIsGuest] = useState(true); // 👈 khách vãng lai
  const pricePerSeat = 100000;

  const handleSelectSeat = (seat: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  return (
    <Box
      p={3}
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      gap={3}
      maxWidth="1200px"
      margin="0 auto" // 👈 căn giữa bố cục
    >
      {/* LEFT: Seat Selection */}
      <Paper sx={{ flex: 2, p: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Select your seats
        </Typography>

        <Typography variant="body2" mb={1}>
          Floor 1
        </Typography>

        <Grid container spacing={1}>
          {seatRows.map((row, rowIndex) => (
            <Grid size={{ xs:12 }} key={rowIndex} display="flex" gap={1}>
              {row.map((seat) => (
                <Button
                  key={seat}
                  variant={selectedSeats.includes(seat) ? "contained" : "outlined"}
                  onClick={() => handleSelectSeat(seat)}
                  sx={{
                    minWidth: 55,
                    height: 45,
                    fontWeight: 600,
                    backgroundColor: selectedSeats.includes(seat)
                      ? "#4caf50"
                      : "#e3f2fd",
                    color: selectedSeats.includes(seat) ? "white" : "black",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: selectedSeats.includes(seat)
                        ? "#43a047"
                        : "#bbdefb",
                    },
                  }}
                >
                  {seat}
                </Button>
              ))}
            </Grid>
          ))}
        </Grid>

        <Typography mt={3} fontWeight={500}>
          Selected:{" "}
          {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
        </Typography>
      </Paper>

      {/* RIGHT: Info Section */}
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        gap={2}
        sx={{
          alignItems: "stretch",
          position: "sticky",
          top: 24,
          minWidth: 320,
        }}
      >
        {/* 🚌 Trip Information */}
        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={600} mb={1}>
            Trip Information
          </Typography>
          <Typography variant="body2">🚌 HCM → Đà Lạt</Typography>
          <Typography variant="body2">⏰ 22:00 - 12/11/2025</Typography>
          <Typography variant="body2">Nhà xe Phương Trang</Typography>
        </Paper>

        {/* 🚗 Bus Info */}
        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={600} mb={1}>
            Bus Information
          </Typography>
          <Typography variant="body2">Biển số: 51B-12345</Typography>
          <Typography variant="body2">Loại xe: Giường nằm 40 chỗ</Typography>
          <Typography variant="body2">Ghế trống: {40 - selectedSeats.length}</Typography>
        </Paper>

        {/* 👤 User or Guest Info */}
        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={600} mb={1}>
            {isGuest ? "Guest Information" : "User Information"}
          </Typography>

          {isGuest ? (
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField label="Họ và tên" fullWidth size="small" />
              <TextField label="Email" fullWidth size="small" />
              <TextField label="Số điện thoại" fullWidth size="small" />
            </Box>
          ) : (
            <>
              <Typography variant="body2">Tên: Nguyễn Văn A</Typography>
              <Typography variant="body2">Email: example@gmail.com</Typography>
              <Typography variant="body2">SĐT: 0901234567</Typography>
            </>
          )}
        </Paper>

        {/* 🎟️ Coupon */}
        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={600} mb={1}>
            Coupon
          </Typography>
          <Box display="flex" gap={1}>
            <TextField fullWidth placeholder="Enter coupon code" size="small" />
            <Button variant="contained">Apply</Button>
          </Box>
        </Paper>

        {/* 💳 Payment */}
        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={600} mb={1}>
            Payment
          </Typography>
          <TextField select fullWidth label="Select payment method" size="small">
            <MenuItem value="momo">MoMo</MenuItem>
            <MenuItem value="vnpay">VNPay</MenuItem>
            <MenuItem value="cash">Cash</MenuItem>
          </TextField>
          <Divider sx={{ my: 2 }} />
          <Typography fontWeight={600}>
            Total: {selectedSeats.length * pricePerSeat} đ
          </Typography>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={selectedSeats.length === 0}
          >
            Purchase
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default SeatBooking;
