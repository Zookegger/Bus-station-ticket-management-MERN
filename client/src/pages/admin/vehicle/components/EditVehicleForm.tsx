import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import type { VehicleDetail } from "./types";

interface Props {
  open: boolean;
  vehicle: VehicleDetail | null;
  onClose: () => void;
  onSave: (updated: VehicleDetail) => void;
}

const EditVehicleForm: React.FC<Props> = ({ open, vehicle, onClose, onSave }) => {
  const [formData, setFormData] = useState<VehicleDetail | null>(vehicle);

  useEffect(() => {
    setFormData(vehicle);
  }, [vehicle]);

  if (!formData) return null;

  const handleChange = (field: keyof VehicleDetail, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Vehicle</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField
          label="Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <TextField
          label="Vehicle Type"
          value={formData.vehicleType}
          onChange={(e) => handleChange("vehicleType", e.target.value)}
        />
        <TextField
          label="License Plate"
          value={formData.licensePlate}
          onChange={(e) => handleChange("licensePlate", e.target.value)}
        />
        <TextField
          label="Seat Capacity"
          type="number"
          value={formData.seatCapacity}
          onChange={(e) => handleChange("seatCapacity", Number(e.target.value))}
        />
        <TextField
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange("status", e.target.value)}
        />
        <TextField
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditVehicleForm;
