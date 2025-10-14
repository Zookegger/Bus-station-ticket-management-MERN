import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";

interface RemoveVehicleFormProps {
  vehicleName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const RemoveVehicleForm: React.FC<RemoveVehicleFormProps> = ({ vehicleName, onConfirm, onCancel }) => {
  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#D32F2F", mb: 2 }}>
        Remove Vehicle
      </Typography>
      <Typography variant="h6" sx={{ color: "#333", mb: 4 }}>
        Are you sure you want to remove <strong>{vehicleName}</strong>?
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onCancel}>
          Cancel
        </Button>

        <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={onConfirm}>
          Delete
        </Button>
      </Box>
    </Box>
  );
};

export default RemoveVehicleForm;
