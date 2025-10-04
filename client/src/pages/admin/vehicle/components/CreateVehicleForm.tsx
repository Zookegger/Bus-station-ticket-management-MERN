import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from "@mui/icons-material";

interface VehicleType {
  id: number;
  name: string;
  description: string;
}

// Dummy data for vehicle types
const vehicleTypes: VehicleType[] = [
  {
    id: 1,
    name: "Quảng nam 4 chỗ (2 dòng)",
    description: "Xe 4 chỗ ngồi, phù hợp cho nhóm nhỏ",
  },
  {
    id: 2,
    name: "Xe 16 chỗ",
    description: "Xe 16 chỗ tiêu chuẩn",
  },
  {
    id: 3,
    name: "Xe 29 chỗ",
    description: "Xe 29 chỗ lớn",
  },
  {
    id: 4,
    name: "Limousine 9 chỗ",
    description: "Xe Limousine cao cấp",
  },
  {
    id: 5,
    name: "Xe Giường nằm",
    description: "Xe giường nằm cho chuyến đi dài",
  },
];

const CreateVehicleForm: React.FC = () => {
  const [formData, setFormData] = useState({
    vehicleType: "",
    vehicleName: "",
    licensePlate: "",
  });

  const [errors, setErrors] = useState({
    vehicleType: "",
    vehicleName: "",
    licensePlate: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      vehicleType: "",
      vehicleName: "",
      licensePlate: "",
    };

    if (!formData.vehicleType) {
      newErrors.vehicleType = "Please select a vehicle type";
    }

    if (!formData.vehicleName.trim()) {
      newErrors.vehicleName = "Vehicle name is required";
    }

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = "License plate is required";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Creating vehicle:", formData);
      alert("Vehicle created successfully!");

      // Reset form
      setFormData({
        vehicleType: "",
        vehicleName: "",
        licensePlate: "",
      });
    }
  };

  const handleBackToList = () => {
    console.log("Navigate back to vehicle list");
    window.history.back();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#2E7D32",
          mb: 1,
        }}
      >
        Create Vehicle
      </Typography>

      <Typography
        variant="h6"
        sx={{
          color: "#333",
          mb: 4,
        }}
      >
        Vehicle Details
      </Typography>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Vehicle Type */}
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth error={!!errors.vehicleType}>
              <InputLabel>Select a vehicle type</InputLabel>
              <Select
                value={formData.vehicleType}
                label="Select a vehicle type"
                onChange={(e) =>
                  handleInputChange("vehicleType", e.target.value)
                }
              >
                {vehicleTypes.map((type) => (
                  <MenuItem key={type.id} value={type.name}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.vehicleType && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 1, ml: 2 }}
                >
                  {errors.vehicleType}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Vehicle Name */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Vehicle Name"
              value={formData.vehicleName}
              onChange={(e) => handleInputChange("vehicleName", e.target.value)}
              error={!!errors.vehicleName}
              helperText={errors.vehicleName}
              placeholder="Enter vehicle name"
            />
          </Grid>

          {/* License Plate */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="License Plate"
              value={formData.licensePlate}
              onChange={(e) =>
                handleInputChange("licensePlate", e.target.value)
              }
              error={!!errors.licensePlate}
              helperText={errors.licensePlate}
              placeholder="Enter license plate (e.g., 51N 0000)"
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            pt: 3,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToList}
            sx={{
              borderColor: "#666",
              color: "#666",
              "&:hover": {
                borderColor: "#333",
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            Back to List
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              minWidth: 120,
            }}
          >
            Create
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateVehicleForm;
