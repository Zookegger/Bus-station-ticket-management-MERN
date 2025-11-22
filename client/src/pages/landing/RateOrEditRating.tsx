// src/pages/user/RateOrEditRating.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  TextField,
  Button,
  Alert,
  Stack,
  Card,
  CardContent,
  Divider,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { mockTripsToRate } from "@data/mockUserTrips";
import { mockUserRatings } from "@data/mockUserRatings";
import { format } from "date-fns";
import type { UserTrip } from "@my-types/userTrip";

type Mode = "create" | "edit";

export default function RateOrEditRating() {
  const { ratingId } = useParams<{ ratingId?: string }>();
  const navigate = useNavigate();
  const mode: Mode = ratingId ? "edit" : "create";

  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load existing rating khi edit
  const existingRating = useMemo(() => {
    if (mode === "edit" && ratingId) {
      return mockUserRatings.find((r) => r.id === ratingId) || null;
    }
    return null;
  }, [mode, ratingId]);

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating);
      setComment(existingRating.comment || "");
      setSelectedTripId(existingRating.trip.id);
    }
  }, [existingRating]);

  const currentTrip: UserTrip | undefined = useMemo(() => {
    if (mode === "edit" && existingRating) return existingRating.trip;
    return mockTripsToRate.find((t) => t.id === selectedTripId);
  }, [mode, existingRating, selectedTripId]);

  const tripsToShow = mode === "create" ? mockTripsToRate : [];

  const handleSubmit = () => {
    if (!currentTrip || rating === null) return;

    setSubmitting(true);
    setTimeout(() => {
      console.log(
        mode === "edit" ? "Cập nhật đánh giá:" : "Tạo đánh giá mới:",
        {
          ratingId: mode === "edit" ? ratingId : undefined,
          tripId: currentTrip.id,
          rating,
          comment,
        }
      );

      setSubmitting(false);
      setSubmitted(true);

      setTimeout(() => {
        navigate("/my-ratings");
      }, 2000);
    }, 1200);
  };

  // Không còn chuyến nào để đánh giá + đang ở chế độ tạo mới
  if (mode === "create" && tripsToShow.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 700, mx: "auto", textAlign: "center" }}>
        <Paper sx={{ p: 6 }}>
          <Typography variant="h6" gutterBottom>
            Tuyệt vời! Bạn đã đánh giá hết các chuyến đi
          </Typography>
          <Button variant="contained" onClick={() => navigate("/my-ratings")}>
            Quay lại đánh giá của tôi
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 700, mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        Đánh giá /{" "}
        <span style={{ color: "#1976d2" }}>
          {mode === "edit" ? "Chỉnh sửa đánh giá" : "Đánh giá chuyến đi"}
        </span>
      </Typography>

      <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, mt: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {mode === "edit" ? "Chỉnh sửa đánh giá" : "Đánh giá chuyến đi"}
        </Typography>

        {submitted && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {mode === "edit"
              ? "Đánh giá đã được cập nhật thành công!"
              : "Cảm ơn bạn! Đánh giá đã được gửi thành công."}
          </Alert>
        )}

        {/* Chọn chuyến đi - chỉ hiện khi tạo mới */}
        {mode === "create" && (
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Chuyến xe</InputLabel>
            <Select
              value={selectedTripId}
              label="Chuyến xe"
              onChange={(e) => setSelectedTripId(e.target.value)}
              disabled={submitting || submitted}
            >
              <MenuItem value="" disabled>
                <em>Chọn chuyến xe</em>
              </MenuItem>
              {tripsToShow.map((trip) => (
                <MenuItem key={trip.id} value={trip.id}>
                  {trip.from} → {trip.to} •{" "}
                  {format(new Date(trip.departureTime), "dd/MM/yyyy HH:mm")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Thông tin chuyến đi */}
        {currentTrip && (
          <Card variant="outlined" sx={{ mb: 4, backgroundColor: "#f8fafc" }}>
            <CardContent>
              <Typography fontWeight="bold" color="primary" gutterBottom>
                {mode === "edit" ? "Chuyến đi" : "Chuyến đi đã chọn"}
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                {currentTrip.from} → {currentTrip.to}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {format(
                  new Date(currentTrip.departureTime),
                  "EEEE, dd MMMM yyyy 'lúc' HH:mm"
                )}
              </Typography>
              <Stack spacing={0.5} sx={{ mt: 2 }}>
                <div>
                  <strong>Tài xế:</strong> {currentTrip.driverName}
                </div>
                <div>
                  <strong>Phương tiện:</strong> {currentTrip.vehiclePlate} •{" "}
                  {currentTrip.vehicleType}
                </div>
                <div>
                  <strong>Giá:</strong>{" "}
                  {currentTrip.price.toLocaleString("vi-VN")} ₫
                </div>
              </Stack>
            </CardContent>
          </Card>
        )}

        <Divider sx={{ my: 4 }} />

        {/* Rating */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography fontWeight="medium" gutterBottom>
            Đánh giá của bạn <span style={{ color: "red" }}>*</span>
          </Typography>
          <Rating
            value={rating}
            onChange={(_, v) => setRating(v)}
            size="large"
            disabled={submitting || submitted}
            sx={{ "& .MuiRating-iconFilled": { color: "#ffb400" } }}
          />
        </Box>

        {/* Comment */}
        <TextField
          label="Bình luận (tùy chọn)"
          placeholder="Chia sẻ trải nghiệm của bạn..."
          multiline
          rows={4}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitting || submitted}
          sx={{ mb: 4 }}
        />

        {/* Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={submitting ? <CircularProgress size={20} /> : null}
            disabled={
              !currentTrip || rating === null || submitting || submitted
            }
            onClick={handleSubmit}
          >
            {submitting
              ? "Đang lưu..."
              : mode === "edit"
              ? "Lưu thay đổi"
              : "Gửi"}
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/my-ratings")}
            disabled={submitting}
          >
            {mode === "edit" ? "Quay lại đánh giá" : "Hủy"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
