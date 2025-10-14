import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import {
  Warning as WarningIcon,
  DirectionsBus as BusIcon,
} from "@mui/icons-material";
import type { VehicleType } from "./types";

interface DeleteVehicleTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  vehicleType: VehicleType | null;
}

const DeleteVehicleTypeDialog: React.FC<DeleteVehicleTypeDialogProps> = ({
  open,
  onClose,
  onConfirm,
  vehicleType,
}) => {
  if (!vehicleType) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "#ffebee", color: "#d32f2f" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <WarningIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Confirm Delete
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, textAlign: "center" }}>
        {/* Vehicle Type Icon */}
        <Box sx={{ mb: 3 }}>
          <BusIcon sx={{ fontSize: 80, color: "#d32f2f" }} />
        </Box>

        {/* Confirmation Message */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Are you sure you want to delete "{vehicleType.name}"?
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: "center" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ color: "#666", borderColor: "#ddd", mr: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{ bgcolor: "#d32f2f" }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteVehicleTypeDialog;
