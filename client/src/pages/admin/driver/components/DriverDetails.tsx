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
import { type Driver } from "@my-types/driver";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { useNavigate } from "react-router-dom";

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
  driver: Driver;
  onClose: () => void;
  onEdit?: (driver: Driver) => void;
}

const DriverDetails: React.FC<DriverDetailsProps> = ({ driver, onClose, onEdit }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    // close drawer first
    onClose();
    if (onEdit) {
      onEdit(driver);
      return;
    }
    // fallback to navigation for older flows
    navigate("driver/create", { state: { driver } });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this driver? This action cannot be undone.")) return;
    try {
      await callApi({ method: "DELETE", url: API_ENDPOINTS.DRIVER.DELETE((driver as any).id) });
      // update mock fallback if present
      try {
        const mocks = (await import("@data/mockDrivers")).MOCK_DRIVERS as any[];
        const idx = mocks.findIndex((d) => d.id === (driver as any).id);
        if (idx >= 0) mocks.splice(idx, 1);
      } catch (e) {
        // ignore
      }
      onClose();
    } catch (err) {
      console.error("Delete driver failed", err);
      alert("Failed to delete driver");
    }
  };
  return (
    <Box sx={{ p: 2, width: { xs: 360, sm: 420, md: 520 } }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: "#1e88e5", mb: 2 }}
      >
        Driver Details
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
          {getInitials(driver.fullname ?? "")}
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
            {driver.fullname}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {driver.email}
            </Typography>
            <Chip
              size="small"
              label={driver.isSuspended ? "suspended" : driver.isActive ? "active" : "inactive"}
              color={driver.isSuspended ? "error" : driver.isActive ? "success" : "default"}
            />
          </Stack>
        </Box>
      </Stack>

      {/* Thông tin cá nhân */}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Box sx={{ p: 1.5, background: "#e3f2fd" }}>
          <Typography sx={{ fontWeight: 700 }}>Personal information</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <EventRounded fontSize="small" />
              <Typography variant="body2">
                Date of Birth: {driver.dateOfBirth ? new Date(driver.dateOfBirth).toLocaleDateString("vi-VN") : "—"}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <HomeRounded fontSize="small" />
              <Typography variant="body2">Address: {driver.address ?? "—"}</Typography>
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
              <Typography variant="body2">Phone: {driver.phoneNumber ?? "—"}</Typography>
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
          <Typography sx={{ fontWeight: 700 }}>Driver's License</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <BadgeRounded fontSize="small" />
              <Typography variant="body2">
                License Number: {driver.licenseNumber ?? "—"}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="body2" sx={{ ml: 4 }}>
                License Category: {driver.licenseCategory ?? "—"}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CalendarTodayRounded fontSize="small" />
              <Typography variant="body2">
                Issue Date: {driver.licenseIssueDate ? new Date(driver.licenseIssueDate).toLocaleDateString("vi-VN") : "—"} -
                Expiry Date: {driver.licenseExpiryDate ? new Date(driver.licenseExpiryDate).toLocaleDateString("vi-VN") : "—"}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Thống kê */}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Box sx={{ p: 1.5, background: "#e3f2fd" }}>
          <Typography sx={{ fontWeight: 700 }}>Activity Statistics</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography variant="body2">Total Trips: {typeof (driver as any).totalTrips === 'number' ? (driver as any).totalTrips : '—'}</Typography>
            <Typography variant="body2">Total Earnings: {typeof (driver as any).totalEarnings === 'number' ? currency((driver as any).totalEarnings) : '—'}</Typography>
            <Typography variant="body2">Rating: {typeof (driver as any).rating === 'number' ? `⭐ ${(driver as any).rating.toFixed(1)}` : '—'}</Typography>
          </Stack>
        </Box>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button variant="outlined" fullWidth onClick={onClose}>
          Back to List
        </Button>
        <Button variant="contained" color="primary" fullWidth onClick={handleEdit}>
          Edit
        </Button>
        <Button variant="outlined" color="error" fullWidth onClick={handleDelete}>
          Delete
        </Button>
      </Stack>
    </Box>
  );
};

export default DriverDetails;
