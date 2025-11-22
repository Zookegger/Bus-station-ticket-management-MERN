import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Stack,
  Paper,
  Divider,
  Button,
} from "@mui/material";
import {
  MailOutlineRounded,
  PhoneIphoneRounded,
  HomeRounded,
  EventRounded,
  BadgeRounded,
  CalendarTodayRounded,
} from "@mui/icons-material";
import { type DriverRecord } from "@my-types/driver";

const currency = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

interface DriverDetailsProps {
  driver: DriverRecord;
  onClose: () => void;
}

const DriverDetails: React.FC<DriverDetailsProps> = ({ driver, onClose }) => {
  return (
    <Box sx={{ p: 2, width: { xs: 360, sm: 420, md: 520 } }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: "#1e88e5", mb: 2 }}
      >
        Chi tiết tài xế
      </Typography>

      {/* Avatar + Info */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            fontSize: 20,
            fontWeight: 600,
            bgcolor: "#e3f2fd",
            color: "#1565c0",
          }}
        >
          {getInitials(driver.fullName)}
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
            {driver.fullName}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {driver.email}
            </Typography>
            <Chip
              size="small"
              label={driver.status}
              color={
                driver.status === "active"
                  ? "success"
                  : driver.status === "suspended"
                  ? "error"
                  : "default"
              }
            />
          </Stack>
        </Box>
      </Stack>

      {/* Thông tin cá nhân */}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Box sx={{ p: 1.5, background: "#e3f2fd" }}>
          <Typography sx={{ fontWeight: 700 }}>Thông tin cá nhân</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <EventRounded fontSize="small" />
              <Typography variant="body2">
                Ngày sinh:{" "}
                {new Date(driver.dateOfBirth).toLocaleDateString("vi-VN")}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <HomeRounded fontSize="small" />
              <Typography variant="body2">Địa chỉ: {driver.address}</Typography>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Liên hệ */}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Box sx={{ p: 1.5, background: "#e3f2fd" }}>
          <Typography sx={{ fontWeight: 700 }}>Liên hệ</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PhoneIphoneRounded fontSize="small" />
              <Typography variant="body2">
                Số điện thoại: {driver.phone}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <MailOutlineRounded fontSize="small" />
              <Typography variant="body2">Email: {driver.email}</Typography>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Bằng lái */}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Box sx={{ p: 1.5, background: "#e3f2fd" }}>
          <Typography sx={{ fontWeight: 700 }}>Giấy phép lái xe</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <BadgeRounded fontSize="small" />
              <Typography variant="body2">
                Số bằng lái: {driver.licenseNumber}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="body2" sx={{ ml: 4 }}>
                Hạng bằng lái: {driver.licenseClass}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CalendarTodayRounded fontSize="small" />
              <Typography variant="body2">
                Ngày cấp:{" "}
                {new Date(driver.issueDate).toLocaleDateString("vi-VN")} - Ngày
                hết hạn:{" "}
                {new Date(driver.expiryDate).toLocaleDateString("vi-VN")}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Thống kê */}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Box sx={{ p: 1.5, background: "#e3f2fd" }}>
          <Typography sx={{ fontWeight: 700 }}>Thống kê hoạt động</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography variant="body2">
              Tổng số chuyến đi: {driver.totalTrips}
            </Typography>
            <Typography variant="body2">
              Tổng thu nhập: {currency(driver.totalEarnings)}
            </Typography>
            <Typography variant="body2">
              Đánh giá: ⭐ {driver.rating.toFixed(1)}
            </Typography>
          </Stack>
        </Box>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button variant="outlined" fullWidth onClick={onClose}>
          Quay lại danh sách
        </Button>
      </Stack>
    </Box>
  );
};

export default DriverDetails;
