import React, { useState } from "react";
import { Box, Typography, TextField, Button, Grid, Paper } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import type { CreateVehicleTypeDTO } from "./types";

interface CreateVehicleTypeFormProps {
  onCreate: (vehicleType: CreateVehicleTypeDTO) => void;
  onCancel: () => void;
}

const CreateVehicleTypeForm: React.FC<CreateVehicleTypeFormProps> = ({
  onCreate,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateVehicleTypeDTO>({
    name: "",
    baseFare: 0,
    totalSeats: 0,
    totalFlooring: 1,
    totalRow: 0,
    totalColumn: 0,
    description: "",
  });

  const [errors, setErrors] = useState<Partial<CreateVehicleTypeDTO>>({});

  const handleInputChange =
    (field: keyof CreateVehicleTypeDTO) =>
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
    const newErrors: Partial<CreateVehicleTypeDTO> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.baseFare <= 0) {
      newErrors.baseFare = "Price must be greater than 0";
    }

    if (formData.totalSeats <= 0) {
      newErrors.totalSeats = "Total seats must be greater than 0";
    }

    if (formData.totalFlooring <= 0) {
      newErrors.totalFlooring = "Total flooring must be greater than 0";
    }

    if (formData.totalRow <= 0) {
      newErrors.totalRow = "Total rows must be greater than 0";
    }

    if (formData.totalColumn <= 0) {
      newErrors.totalColumn = "Total columns must be greater than 0";
    }

    // Validate that seats = rows * columns * flooring
    const calculatedSeats =
      formData.totalRow * formData.totalColumn * formData.totalFlooring;
    if (calculatedSeats !== formData.totalSeats) {
      newErrors.totalSeats = `Seats should equal ${calculatedSeats} (rows × columns × flooring)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (validateForm()) {
      onCreate(formData);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <AddIcon sx={{ color: "#1976d2", mr: 1, fontSize: 32 }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            Add New Vehicle Type
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Fill in the details for the new vehicle type below
        </Typography>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                placeholder="e.g. Electric Bus"
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
                placeholder="e.g. 100000"
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
                label="Seats"
                type="number"
                placeholder="e.g. 42"
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
                label="Floors"
                type="number"
                placeholder="e.g. 3"
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
                label="Rows"
                type="number"
                placeholder="e.g. 7"
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
                label="Columns"
                type="number"
                placeholder="e.g. 6"
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
                placeholder="Enter description (optional)"
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
              startIcon={<AddIcon />}
              sx={{ bgcolor: "#2e7d32" }}
            >
              Create
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateVehicleTypeForm;
