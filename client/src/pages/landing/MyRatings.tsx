import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import RatingCardList from "./RatingCardList";
import PendingRatingBanner from "./PendingRatingBanner";
import { mockUserTrips } from "@data/mockUserTrips";
import { mockUserRatings } from "@data/mockUserRatings";

export default function MyRatings() {
  const pendingCount = mockUserTrips.filter(
    (t) => t.status === "COMPLETED" && !t.hasRated
  ).length;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: "90%", maxWidth: 1550, mx: "auto" }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: "#e3f2fd" }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          Đánh giá & Xếp hạng của tôi
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Quản lý đánh giá chuyến đi của bạn và chia sẻ trải nghiệm du lịch
        </Typography>
      </Paper>

      {/* Pending Reviews Banner */}
      {pendingCount > 0 && <PendingRatingBanner count={pendingCount} />}

      {/* Total Reviews Summary */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h6" fontWeight="medium">
          {mockUserRatings.length} Tổng số đánh giá
        </Typography>
        <Button
          component={Link}
          to="/rating/new"
          variant="contained"
          color="warning"
        >
          Đánh giá ngay
        </Button>
      </Stack>

      {/* Danh sách card */}
      <RatingCardList
        ratings={mockUserRatings}
        onDelete={(id) => console.log("Xóa ID:", id)}
      />
    </Box>
  );
}
