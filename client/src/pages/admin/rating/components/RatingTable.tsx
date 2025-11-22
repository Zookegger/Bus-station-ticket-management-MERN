// src/components/ratings/RatingTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import type { Rating } from "@my-types/rating";
import { Star, StarBorder } from "@mui/icons-material";

interface RatingTableProps {
  ratings: Rating[];
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onViewDetail: (rating: Rating) => void;
}

const RatingStars = ({ score }: { score: number }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Box
          key={i}
          component={i < score ? Star : StarBorder}
          sx={{
            fontSize: 20,
            color: i < score ? "#FFB400" : "#e0e0e0",
          }}
        />
      ))}
      <Typography variant="body2" sx={{ ml: 1, fontWeight: "medium" }}>
        {score} ★
      </Typography>
    </Box>
  );
};

export default function RatingTable({
  ratings,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
  onViewDetail,
}: RatingTableProps) {
  return (
    <TableContainer component={Paper} elevation={3}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f5f5f0" }}>
            <TableCell sx={{ fontWeight: "bold" }}>Chuyến đi</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Ngày chuyến</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Người dùng</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Đánh giá</TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold" }}>
              Hành động
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {ratings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography color="text.secondary">
                  Không có đánh giá nào
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            <>
              {ratings.map((rating) => (
                <TableRow
                  key={rating.id}
                  hover
                  sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {rating.trip}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(rating.tripDate).toLocaleDateString("vi-VN")}
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(rating.tripDate).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{rating.userEmail}</Typography>
                  </TableCell>
                  <TableCell>
                    <RatingStars score={rating.rating} />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => onViewDetail(rating)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => {
          onRowsPerPageChange(parseInt(e.target.value, 10));
          onPageChange(0);
        }}
        labelRowsPerPage="Số dòng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} của ${count !== -1 ? count : `nhiều hơn ${to}`}`
        }
      />
    </TableContainer>
  );
}
