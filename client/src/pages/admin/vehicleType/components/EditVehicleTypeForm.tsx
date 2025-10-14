import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Grid, Paper } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import type { VehicleType, UpdateVehicleTypeDTO } from "./types";

interface EditVehicleTypeFormProps {
  vehicleType: VehicleType;
  onUpdate: (id: number, data: UpdateVehicleTypeDTO) => void;
  onCancel: () => void;
}

const EditVehicleTypeForm: React.FC<EditVehicleTypeFormProps> = ({
  vehicleType,
  onUpdate,
  onCancel,
}) => {
  const [formData, setFormData] = useState<UpdateVehicleTypeDTO>({
    name: vehicleType.name,
    baseFare: vehicleType.baseFare,
    totalSeats: vehicleType.totalSeats,
    totalFlooring: vehicleType.totalFlooring,
    totalRow: vehicleType.totalRow,
    totalColumn: vehicleType.totalColumn,
    description: vehicleType.description || "",
  });

  const [errors, setErrors] = useState<Partial<UpdateVehicleTypeDTO>>({});

  useEffect(() => {
    setFormData({
      name: vehicleType.name,
      baseFare: vehicleType.baseFare,
      totalSeats: vehicleType.totalSeats,
      totalFlooring: vehicleType.totalFlooring,
      totalRow: vehicleType.totalRow,
      totalColumn: vehicleType.totalColumn,
      description: vehicleType.description || "",
    });
  }, [vehicleType]);

  const handleInputChange =
    (field: keyof UpdateVehicleTypeDTO) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "baseFare" || field.includes("total")
          ? Number(event.target.value) || 0
          : event.target.value;

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateVehicleTypeDTO> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if ((formData.baseFare || 0) <= 0) {
      newErrors.baseFare = "Price must be greater than 0";
    }

    if ((formData.totalSeats || 0) <= 0) {
      newErrors.totalSeats = "Total seats must be greater than 0";
    }

    if ((formData.totalFlooring || 0) <= 0) {
      newErrors.totalFlooring = "Total flooring must be greater than 0";
    }

    if ((formData.totalRow || 0) <= 0) {
      newErrors.totalRow = "Total rows must be greater than 0";
    }

    if ((formData.totalColumn || 0) <= 0) {
      newErrors.totalColumn = "Total columns must be greater than 0";
    }

    // Validate that seats = rows * columns * flooring
    const totalSeats = formData.totalSeats || 0;
    const totalRow = formData.totalRow || 0;
    const totalColumn = formData.totalColumn || 0;
    const totalFlooring = formData.totalFlooring || 0;

    const calculatedSeats = totalRow * totalColumn * totalFlooring;
    if (calculatedSeats !== totalSeats) {
      newErrors.totalSeats = `Seats should equal ${calculatedSeats} (rows × columns × flooring)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (validateForm()) {
      onUpdate(vehicleType.id, formData);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            Edit Vehicle Type
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Modify vehicle details below
        </Typography>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vehicle Type Name"
                value={formData.name}
                onChange={handleInputChange("name")}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.baseFare || ""}
                onChange={handleInputChange("baseFare")}
                error={!!errors.baseFare}
                helperText={errors.baseFare}
                required
                InputProps={{
                  startAdornment: "₫",
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Seats"
                type="number"
                value={formData.totalSeats || ""}
                onChange={handleInputChange("totalSeats")}
                error={!!errors.totalSeats}
                helperText={errors.totalSeats}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Total Flooring"
                type="number"
                value={formData.totalFlooring || ""}
                onChange={handleInputChange("totalFlooring")}
                error={!!errors.totalFlooring}
                helperText={errors.totalFlooring}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Total Rows"
                type="number"
                value={formData.totalRow || ""}
                onChange={handleInputChange("totalRow")}
                error={!!errors.totalRow}
                helperText={errors.totalRow}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Total Columns"
                type="number"
                value={formData.totalColumn || ""}
                onChange={handleInputChange("totalColumn")}
                error={!!errors.totalColumn}
                helperText={errors.totalColumn}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange("description")}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box
            sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onCancel}
              sx={{ color: "#666", borderColor: "#ddd" }}
            >
              Back to List
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{ bgcolor: "#2e7d32" }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditVehicleTypeForm;
