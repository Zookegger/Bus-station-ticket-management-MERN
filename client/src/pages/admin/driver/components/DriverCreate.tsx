import React from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { driverSchema, type DriverFormData } from "@schemas/driverSchema";
import { MOCK_DRIVERS } from "@data/mockDrivers";
import { Link, useNavigate } from "react-router-dom";

const DriverCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      gender: "Male",
      dateOfBirth: "",
      address: "",
      licenseNumber: "",
      licenseClass: "",
      issueDate: "",
      expiryDate: "",
    },
  });

  const onSubmit = (data: DriverFormData) => {
    setLoading(true);
    setTimeout(() => {
      const newDriver = {
        id: String(Date.now()),
        ...data,
        status: "active" as const,
        totalTrips: 0,
        totalEarnings: 0,
        rating: 0,
      };
      MOCK_DRIVERS.push(newDriver);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard/trip"); // Quay lại danh sách
      }, 1500);
    }, 1000);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#2E7D32", mb: 3 }}
      >
        Add New Driver
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Driver added successfully! Redirecting to the list...
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* === THÔNG TIN CÁ NHÂN === */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#1565c0" }}
            >
              Personal Information
            </Typography>

            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  fullWidth
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                />
              )}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.gender}>
                    <InputLabel>Gender</InputLabel>
                    <Select {...field} label="Gender">
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                    </Select>
                    <FormHelperText>{errors.gender?.message}</FormHelperText>
                  </FormControl>
                )}
              />

              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth?.message}
                  />
                )}
              />
            </Stack>

            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Address"
                  fullWidth
                  error={!!errors.address}
                  helperText={errors.address?.message}
                />
              )}
            />

            <Divider />

            {/* === LIÊN HỆ === */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#1565c0" }}
            >
              Contact Information
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />

              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone?.message || "VD: 0901234567"}
                  />
                )}
              />
            </Stack>

            <Divider />

            {/* === BẰNG LÁI === */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#1565c0" }}
            >
              Giấy phép lái xe
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="licenseNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="License Number"
                    fullWidth
                    error={!!errors.licenseNumber}
                    helperText={errors.licenseNumber?.message}
                  />
                )}
              />

              <Controller
                name="licenseClass"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.licenseClass}>
                    <InputLabel>License Class</InputLabel>
                    <Select {...field} label="License Class">
                      <MenuItem value="B1">B1</MenuItem>
                      <MenuItem value="B2">B2</MenuItem>
                      <MenuItem value="C">C</MenuItem>
                      <MenuItem value="D">D</MenuItem>
                      <MenuItem value="E">E</MenuItem>
                    </Select>
                    <FormHelperText>
                      {errors.licenseClass?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="issueDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Issue Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.issueDate}
                    helperText={errors.issueDate?.message}
                  />
                )}
              />

              <Controller
                name="expiryDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Expiry Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.expiryDate}
                    helperText={errors.expiryDate?.message}
                  />
                )}
              />
            </Stack>

            <Divider />

            {/* === HÀNH ĐỘNG === */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Link to="/dashboard/trip">
                <Button variant="outlined" disabled={loading}>
                  Hủy
                </Button>
              </Link>

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? "Saving..." : "Add Driver"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default DriverCreate;
