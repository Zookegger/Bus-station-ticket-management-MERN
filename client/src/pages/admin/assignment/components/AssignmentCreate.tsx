import React from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MOCK_TRIPS } from "@data/mockTrips";
import { MOCK_DRIVERS } from "@data/mockDrivers";

const AssignmentCreate: React.FC = () => {
  const navigate = useNavigate();
  const [tripId, setTripId] = React.useState("");
  const [driverId, setDriverId] = React.useState("");

  const trip = MOCK_TRIPS.find((t) => t.id === tripId);
  const driver = MOCK_DRIVERS.find((d) => d.id === driverId);

  const handleAssign = () => {
    // Thêm vào MOCK_ASSIGNMENTS
    console.log("assignment:", { trip, driver });
    setTimeout(() => navigate("/assignments"), 1000);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#2E7D32", mb: 3 }}
      >
        Driver Assignment
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Trip</InputLabel>
            <Select
              value={tripId}
              label="Trip"
              onChange={(e) => setTripId(e.target.value)}
            >
              {MOCK_TRIPS.filter((t) => t.status === "pending").map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.startPoint} → {t.endPoint} ({t.date})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {trip && (
            <>
              <TextField label="Start Point" value={trip.startPoint} disabled />
              <TextField label="End Point" value={trip.endPoint} disabled />
              <TextField
                label="Time"
                value={`${trip.startTime} - ${trip.endTime}`}
                disabled
              />
              <TextField label="Date" value={trip.date} disabled />
            </>
          )}

          <Divider />

          <FormControl fullWidth>
            <InputLabel>Driver</InputLabel>
            <Select
              value={driverId}
              label="Driver"
              onChange={(e) => setDriverId(e.target.value)}
            >
              {MOCK_DRIVERS.filter((d) => d.status === "active").map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.fullName} - {d.phone} (⭐ {d.rating})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {driver && (
            <TextField
              label="Driver Information"
              value={`${driver.fullName} | ${driver.phone} | License: ${driver.licenseNumber}`}
              disabled
            />
          )}

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate("/dashboard/trip")}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAssign}
              disabled={!tripId || !driverId}
            >
              Assign
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AssignmentCreate;
