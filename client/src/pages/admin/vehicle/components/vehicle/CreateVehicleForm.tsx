import React, { useEffect, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { VehicleStatus, type CreateVehicleDTO } from "@my-types/vehicle";
import { APP_CONFIG, API_ENDPOINTS } from "@constants/index";
import type { VehicleType } from "@my-types/vehicleType";
import callApi from "@utils/apiCaller";
import { SeatLayoutPreview } from "../vehicleType";

interface CreateVehicleFormProps {
  open: boolean;
  onClose: () => void;
}

const CreateVehicleForm: React.FC<CreateVehicleFormProps> = ({
  open,
  onClose,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [formData, setFormData] = useState<CreateVehicleDTO>({
    numberPlate: "",
    manufacturer: "",
    model: "",
    status: "ACTIVE",
    vehicleTypeId: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedVehicleTypes, setSelectedVehicleTypes] =
    useState<VehicleType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Reset form
    setFormData({
      numberPlate: "",
      vehicleTypeId: -1,
      model: "",
      status: "ACTIVE",
      manufacturer: "",
    });
  }, [open]);

  useEffect(() => {
    const getVehicleTypes = async () => {
      try {
        const { data, status } = await callApi(
          {
            method: "GET",
            url: API_ENDPOINTS.VEHICLE_TYPE.BASE,
          },
          { returnFullResponse: true }
        );

        if (status === 200 || status === 304) {
          if (data && data.length <= 0) {
            throw new Error("Server returned empty set");
          }

          if (Array.isArray(data)) {
            setVehicleTypes(data);
          } else {
            throw new Error("Invalid data format from server");
          }
          return;
        }
        throw new Error("Server Error");
      } catch (err: any) {
        setErrorMessage(err.message);
        console.error("Vehicle type fetch error:", err);
      }
    };

    getVehicleTypes();
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
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
      vehicleTypeId: "",
      manufacturer: "",
      numberPlate: "",
      model: "",
    };

    if (!formData.vehicleTypeId || formData.vehicleTypeId === -1) {
      newErrors.vehicleTypeId = "Please select a vehicle type";
    }

    if (!formData.manufacturer?.trim()) {
      newErrors.manufacturer = "Vehicle name is required";
    }

    if (!formData.numberPlate.trim()) {
      newErrors.numberPlate = "License plate is required";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const { status, data } = await callApi({
        method: "POST",
        url: `${APP_CONFIG.apiBaseUrl}${API_ENDPOINTS.VEHICLE.BASE}`,
        data: formData,
      });
      if (status !== 201) {
        throw new Error(data.message ?? "Failed to create vehicle");
      }
      alert("Vehicle created successfully!");
      onClose(); // Close dialog on success
    } catch (err: any) {
      console.error("Error creating vehicle:", err);
      setErrorMessage(
        err.message ?? "Failed to create vehicle. Please try again."
      );
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add new Vehicle</DialogTitle>
      <DialogContent>
        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3} marginTop={1}>
            {/* Vehicle Type */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.vehicleTypeId}>
                <InputLabel>Vehicle type</InputLabel>
                <Select
                  value={formData.vehicleTypeId}
                  label="Select a vehicle type"
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected === -1) {
                      return "Select a vehicle type"; // Your placeholder text
                    }
                    const selectedType = vehicleTypes.find(
                      (type) => type.id === selected
                    );
                    return selectedType ? selectedType.name : "Unknown";
                  }}
                  onChange={(e) => {
                    handleInputChange(
                      "vehicleTypeId",
                      e.target.value as number
                    );
                    const selectedType = vehicleTypes.find(
                      (type) => type.id === (e.target.value as number)
                    );
                    if (selectedType) setSelectedVehicleTypes(selectedType);
                  }}
                >
                  <MenuItem disabled value={-1}>
                    Select a vehicle type
                  </MenuItem>
                  {vehicleTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.vehicleTypeId && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 1, ml: 2 }}
                  >
                    {errors.vehicleTypeId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Manufacturer */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Manufacturer"
                value={formData.manufacturer}
                onChange={(e) =>
                  handleInputChange("manufacturer", e.target.value)
                }
                error={!!errors.manufacturer}
                helperText={errors.manufacturer}
                placeholder="Enter manufacturer name"
              />
            </Grid>

            {/* Model */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Model"
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                error={!!errors.model}
                helperText={errors.model}
                placeholder="Enter vehicle model"
              />
            </Grid>

            {/* License Plate */}
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                fullWidth
                label="License Plate"
                value={formData.numberPlate}
                onChange={(e) =>
                  handleInputChange("numberPlate", e.target.value)
                }
                error={!!errors.numberPlate}
                helperText={errors.numberPlate}
                placeholder="Enter license plate (e.g., 51N 0000)"
              />
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Select a status</InputLabel>
                <Select
                  value={formData.status}
                  label="Select a status"
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  {VehicleStatus.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() +
                        status.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
                {errors.vehicleTypeId && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 1, ml: 2 }}
                  >
                    {errors.vehicleTypeId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {selectedVehicleTypes && (
              <Grid size={{ xs: 12 }}>
                <SeatLayoutPreview
                  seatLayout={selectedVehicleTypes?.seatLayout}
                />
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        {errorMessage && (
          <Alert icon={<ErrorIcon color="error" />}>{errorMessage}</Alert>
        )}

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onClose}
          sx={{
            borderColor: "#666",
            color: "#666",
            "&:hover": {
              borderColor: "#333",
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          Cancel
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
          disabled={
            // Disable when any required field is empty or no vehicle type selected
            !(
              formData.manufacturer &&
              formData.manufacturer.trim() &&
              formData.model &&
              formData.model.trim() &&
              formData.numberPlate.trim() &&
              formData.vehicleTypeId >= 0
            )
          }
          onClick={handleSubmit}
        >
          {isLoading ? "Adding..." : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateVehicleForm;
