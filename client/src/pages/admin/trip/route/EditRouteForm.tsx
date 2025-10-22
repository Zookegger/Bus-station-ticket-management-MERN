import React, { useState, useEffect } from "react";
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
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import Map from "../../../../components/common/Map"; // <-- giữ nguyên file Map.tsx

interface RouteType {
  id: number;
  name: string;
  description: string;
}

import type { Route } from "@pages/admin/vehicle/components/vehicleType/types";

// Dummy route types
const routeTypes: RouteType[] = [
  { id: 1, name: "Short Route", description: "Route for short distances (under 100km)" },
  { id: 2, name: "Medium Route", description: "Route for medium distances (100-300km)" },
  { id: 3, name: "Long Route", description: "Route for long distances (over 300km)" },
];

interface EditRouteFormProps {
  routeToEdit: Route;
  onSave: (updatedRoute: Route) => void;
  onBack: () => void;
}

// Hàm geocoding đơn giản với Nominatim (OpenStreetMap)
const geocode = async (query: string): Promise<[number, number] | null> => {
  if (!query) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
};

const EditRouteForm: React.FC<EditRouteFormProps> = ({ routeToEdit, onSave, onBack }) => {
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

  // Tọa độ start & end cho Map
  const [startPoint, setStartPoint] = useState<[number, number]>([21.0285, 105.8542]);
  const [endPoint, setEndPoint] = useState<[number, number]>([10.7769, 106.7009]);

  useEffect(() => {
    setFormData({
      routeType: routeToEdit.routeType,
      departure: routeToEdit.departure,
      destination: routeToEdit.destination,
      price: routeToEdit.price,
    });

    // Geocode ngay khi load form
    (async () => {
      const start = await geocode(routeToEdit.departure);
      const end = await geocode(routeToEdit.destination);
      if (start) setStartPoint(start);
      if (end) setEndPoint(end);
    })();
  }, [routeToEdit]);

  // Geocode khi người dùng thay đổi input
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.departure) {
        const start = await geocode(formData.departure);
        if (start) setStartPoint(start);
      }
      if (formData.destination) {
        const end = await geocode(formData.destination);
        if (end) setEndPoint(end);
      }
    }, 800); // debounce 0.8s
    return () => clearTimeout(timer);
  }, [formData.departure, formData.destination]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({ ...routeToEdit, ...formData });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#2E7D32", mb: 1 }}>
        Edit Route
      </Typography>
      <Typography variant="h6" sx={{ color: "#333", mb: 4 }}>
        Update Route Details
      </Typography>

      <Box component="form" onSubmit={handleSave}>
        <Grid container spacing={3}>
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
        <Box
          sx={{
            mt: 4,
            mb: 3,
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <Map height={400} startPoint={startPoint} endPoint={endPoint} showRoute={true} />
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
            onClick={onBack}
            sx={{
              borderColor: "#666",
              color: "#666",
              "&:hover": { borderColor: "#333", backgroundColor: "#f5f5f5" },
            }}
          >
            Back
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#1565c0" },
              minWidth: 120,
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditRouteForm;
