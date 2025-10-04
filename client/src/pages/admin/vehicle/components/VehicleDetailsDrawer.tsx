import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

interface VehicleDetail {
  id: number;
  name: string;
  vehicleType: string;
  licensePlate: string;
  seatCapacity: number;
  status: string;
  acquiredDate: string;
  lastUpdated: string;
  description: string;
  fuelType: string;
  yearOfManufacture: number;
  insuranceExpiry: string;
  maintenanceSchedule: string;
}

interface VehicleDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  vehicle: VehicleDetail | null;
  onEdit?: (vehicle: VehicleDetail) => void;
}

const VehicleDetailsDrawer: React.FC<VehicleDetailsDrawerProps> = ({
  open,
  onClose,
  vehicle,
  onEdit,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready":
        return "warning";
      case "Hoạt động":
        return "success";
      case "In-Progress":
        return "info";
      default:
        return "default";
    }
  };

  if (!vehicle) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: 400,
          boxShadow: "-4px 0 8px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Box
        sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#1976d2",
            }}
          >
            Vehicle Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Grid container spacing={3}>
            {/* Vehicle Information Card */}
            <Grid size={{ xs: 12 }}>
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "#333",
                      mb: 2,
                    }}
                  >
                    Vehicle Information
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {vehicle.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Vehicle Type
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {vehicle.vehicleType}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        License Plate
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {vehicle.licensePlate}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Seat Capacity
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {vehicle.seatCapacity}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Status Information Card */}
            <Grid size={{ xs: 12 }}>
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "#333",
                      mb: 2,
                    }}
                  >
                    Status Information
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={vehicle.status}
                        color={getStatusColor(vehicle.status) as any}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Acquired Date
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {vehicle.acquiredDate}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {vehicle.lastUpdated}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            pt: 2,
            borderTop: "1px solid #e0e0e0",
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => onEdit && onEdit(vehicle)}
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              flex: 1,
            }}
          >
            Edit Vehicle
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onClose}
            sx={{
              flex: 1,
            }}
          >
            Back to List
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default VehicleDetailsDrawer;
