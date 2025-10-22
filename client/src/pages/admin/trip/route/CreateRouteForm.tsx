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
import { ArrowBack as ArrowBackIcon, Add as AddIcon } from "@mui/icons-material";
import Map from "../../../../components/common/Map"; // giữ nguyên import của bạn

interface RouteType {
  id: number;
  name: string;
  description: string;
}

// Dummy data for route types
const routeTypes: RouteType[] = [
  { id: 1, name: "Short Route", description: "Route for short distances (under 100km)" },
  { id: 2, name: "Medium Route", description: "Route for medium distances (100-300km)" },
  { id: 3, name: "Long Route", description: "Route for long distances (over 300km)" },
];

const CreateRouteForm: React.FC = () => {
  const [formData, setFormData] = useState({
    routeType: "",
    departure: "",
    destination: "",
    price: "",
  });

  const [errors, setErrors] = useState({
    routeType: "",
    departure: "",
    destination: "",
    price: "",
  });

  // State cho Map
  const [startPoint, setStartPoint] = useState<[number, number]>([21.0285, 105.8542]); // Hà Nội
  const [endPoint, setEndPoint] = useState<[number, number]>([10.7769, 106.7009]); // TP.HCM

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Reset lỗi nếu đang có
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = { routeType: "", departure: "", destination: "", price: "" };
    if (!formData.routeType) newErrors.routeType = "Please select a route type";
    if (!formData.departure.trim()) newErrors.departure = "Departure is required";
    if (!formData.destination.trim()) newErrors.destination = "Destination is required";
    if (!formData.price.trim()) newErrors.price = "Price is required";
    else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0)
      newErrors.price = "Price must be a valid positive number";

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Creating route:", formData);
      alert("Route created successfully!");

      // Reset form
      setFormData({ routeType: "", departure: "", destination: "", price: "" });
      // Reset Map về mặc định (tuỳ chọn)
      setStartPoint([21.0285, 105.8542]);
      setEndPoint([10.7769, 106.7009]);
    }
  };

  const handleBackToList = () => {
    window.history.back();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#2E7D32", mb: 1 }}>
        Create Route
      </Typography>

      <Typography variant="h6" sx={{ color: "#333", mb: 4 }}>
        Route Details
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Route Type */}
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth error={!!errors.routeType}>
              <InputLabel>Select a route type</InputLabel>
              <Select
                value={formData.routeType}
                label="Select a route type"
                onChange={(e) => handleInputChange("routeType", e.target.value)}
              >
                {routeTypes.map((type) => (
                  <MenuItem key={type.id} value={type.name}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.routeType && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                  {errors.routeType}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Departure */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Departure"
              value={formData.departure}
              onChange={(e) => handleInputChange("departure", e.target.value)}
              error={!!errors.departure}
              helperText={errors.departure}
              placeholder="Enter departure location"
            />
          </Grid>

          {/* Destination */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Destination"
              value={formData.destination}
              onChange={(e) => handleInputChange("destination", e.target.value)}
              error={!!errors.destination}
              helperText={errors.destination}
              placeholder="Enter destination location"
            />
          </Grid>

          {/* Price */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Price"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              error={!!errors.price}
              helperText={errors.price}
              placeholder="Enter price (e.g., 100000)"
            />
          </Grid>
        </Grid>

        {/* Map */}
        <Box sx={{ mt: 4, mb: 3, border: "1px solid #e0e0e0", borderRadius: 1, overflow: "hidden" }}>
          <Map startPoint={startPoint} endPoint={endPoint} height={400} />
        </Box>

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
              "&:hover": { borderColor: "#333", backgroundColor: "#f5f5f5" },
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
              "&:hover": { backgroundColor: "#1565c0" },
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

export default CreateRouteForm;
