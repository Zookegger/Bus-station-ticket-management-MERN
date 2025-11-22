// src/pages/RatingManagement.tsx hoặc trong cùng file nếu muốn
import { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import RatingTable from "./components/ratingtable";
import type { Rating } from "@my-types/rating";
import { mockRatings } from "@data/mockRating";

export default function RatingManagement() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);

  // Có thể thêm bộ lọc tìm kiếm theo email, chuyến, ngày... (tùy chọn)
  const filteredRatings = useMemo(() => mockRatings, []);

  const paginatedRatings = filteredRatings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Quản lý đánh giá khách hàng
        </Typography>
      </Paper>

      <RatingTable
        ratings={paginatedRatings}
        page={page}
        rowsPerPage={rowsPerPage}
        total={filteredRatings.length}
        onPageChange={setPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(0);
        }}
        onViewDetail={setSelectedRating}
      />

      {/* Dialog chi tiết đánh giá */}
      <Dialog
        open={!!selectedRating}
        onClose={() => setSelectedRating(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết đánh giá</DialogTitle>
        <DialogContent dividers>
          {selectedRating && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Người dùng:</strong> {selectedRating.userEmail}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Chuyến đi:</strong> {selectedRating.trip}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Thời gian chuyến:</strong>{" "}
                {new Date(selectedRating.tripDate).toLocaleString("vi-VN")}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Điểm:</strong> {selectedRating.rating} ★
              </Typography>
              {selectedRating.comment ? (
                <Typography variant="body1" sx={{ mt: 2, fontStyle: "italic" }}>
                  "{selectedRating.comment}"
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Không có bình luận
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRating(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
