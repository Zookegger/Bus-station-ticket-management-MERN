import React from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Divider,
  Chip,
  Avatar,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PersonIcon from "@mui/icons-material/Person";
import { MOCK_ASSIGNMENTS } from "@data/mockAssignments";
import { MOCK_TRIPS } from "@data/mockTrips";

interface AssignmentDetailProps {
  assignmentId: string;
  onClose: () => void;
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({
  assignmentId,
  onClose,
}) => {
  const assignment = MOCK_ASSIGNMENTS.find((a) => a.id === assignmentId);
  const trip = MOCK_TRIPS.find((t) => t.id === assignment?.tripId);

  if (!assignment || !trip) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Không tìm thấy phân công</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#2E7D32", mb: 2 }}
      >
        Chi tiết phân công
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          {/* Cột trái */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin chuyến đi
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <LocationOnIcon color="success" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Điểm đi
                  </Typography>
                  <Typography variant="body2">{trip.startPoint}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <LocationOnIcon color="error" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Điểm đến
                  </Typography>
                  <Typography variant="body2">{trip.endPoint}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon fontSize="small" />
                <Typography variant="body2">
                  {trip.startTime} - {trip.endTime} | {trip.date}
                </Typography>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Tài xế & Phương tiện
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "#e3f2fd" }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {assignment.driverName}
                  </Typography>
                  <Chip label="Đã phân công" size="small" color="primary" />
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <DirectionsCarIcon fontSize="small" />
                <Typography variant="body2">
                  Phương tiện: {assignment.vehicle}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Bản đồ giả lập */}
          <Box
            sx={{
              flex: 1,
              height: 300,
              bgcolor: "#f5f5f5",
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ pt: 8 }}
            >
              [Google Maps sẽ được hiển thị ở đây]
            </Typography>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Chip label="Khoảng cách: 12.5 km" size="small" />
              <Chip label="Thời gian: ~22 phút" size="small" sx={{ ml: 1 }} />
            </Box>
          </Box>
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={onClose}>
          Quay lại danh sách
        </Button>
        <Button variant="contained">Chỉnh sửa phân công</Button>
      </Stack>
    </Box>
  );
};

export default AssignmentDetail;
