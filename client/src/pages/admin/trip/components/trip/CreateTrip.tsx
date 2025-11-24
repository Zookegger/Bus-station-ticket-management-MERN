import React, { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import axios from "axios";
import { API_ENDPOINTS } from "@constants/api";
import type { Route, Vehicle } from "@my-types";
import type { CreateTripDTO } from "@my-types/trip";
import { TripStatus } from "@my-types/trip";

interface CreateTripFormProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

/** Dialog form component for creating a Trip (one-way or round-trip). */
const CreateTripForm: React.FC<CreateTripFormProps> = ({ open, onClose, onCreated }) => {
  const [tripType, setTripType] = useState<"oneWay" | "roundTrip">("oneWay");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [selectedOutboundRoute, setSelectedOutboundRoute] = useState<Route | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [dates, setDates] = useState({
    outboundDepart: "",
    outboundArrive: "",
    returnDepart: "",
    returnArrive: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesRes, vehiclesRes] = await Promise.all([
          axios.get(API_ENDPOINTS.ROUTE.BASE),
          axios.get(API_ENDPOINTS.VEHICLE.BASE),
        ]);

        const routeList = Array.isArray(routesRes.data) ? routesRes.data : routesRes.data.data || [];
        const vehicleList = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : vehiclesRes.data.data || [];

        setRoutes(routeList);
        setVehicles(vehicleList);
      } catch (err) {
        console.error("Failed to load form data", err);
        setError("Could not load routes or vehicles. Please check connection.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    if (!selectedOutboundRoute || !selectedVehicle || !dates.outboundDepart) {
      setError("Please fill in all required outbound fields.");
      setIsSubmitting(false);
      return;
    }
    if (tripType === "roundTrip" && !dates.returnDepart) {
      setError("Please fill in the return departure date.");
      setIsSubmitting(false);
      return;
    }

    try {
      const outboundPayload: CreateTripDTO = {
        routeId: selectedOutboundRoute.id,
        vehicleId: selectedVehicle.id,
        startTime: new Date(dates.outboundDepart),
        endTime: dates.outboundArrive ? new Date(dates.outboundArrive) : null,
        price: selectedOutboundRoute.price || 0,
        status: TripStatus.SCHEDULED,
        isTemplate: false,
      };
      await axios.post(API_ENDPOINTS.TRIP.CREATE, outboundPayload);

      if (tripType === "roundTrip") {
        // Attempt to find reverse route by name heuristic; can be improved with IDs.
        const reverseName = selectedOutboundRoute.name.split(" - ").reverse().join(" - ");
        const reverseRoute = routes.find(r => r.name === reverseName);
        if (!reverseRoute) {
          throw new Error(`Could not auto-detect reverse route '${reverseName}'. Create manually.`);
        }
        const returnPayload: CreateTripDTO = {
          routeId: reverseRoute.id,
          vehicleId: selectedVehicle.id,
          startTime: new Date(dates.returnDepart),
          endTime: dates.returnArrive ? new Date(dates.returnArrive) : null,
          price: reverseRoute.price || 0,
          status: TripStatus.SCHEDULED,
          isTemplate: false,
        };
        await axios.post(API_ENDPOINTS.TRIP.CREATE, returnPayload);
      }
      onCreated?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to create trip.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create Trip</DialogTitle>
      <DialogContent dividers>
        {isLoadingData ? (
          <Box p={3} display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value as "oneWay" | "roundTrip")}
                  >
                    <FormControlLabel value="oneWay" control={<Radio size="small" />} label="One Way" />
                    <FormControlLabel value="roundTrip" control={<Radio size="small" />} label="Round Trip" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  options={routes}
                  getOptionLabel={(r) => r.name || `Route #${r.id}`}
                  value={selectedOutboundRoute}
                  onChange={(_, val) => setSelectedOutboundRoute(val)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Route"
                      placeholder="Select Route..."
                      helperText={selectedOutboundRoute ? `Distance: ${selectedOutboundRoute.distance}km` : ""}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  options={vehicles}
                  getOptionLabel={(v) => {
                    if (!v) return "";
                    const parts = [v.manufacturer, v.model].filter(Boolean);
                    const name = parts.length ? parts.join(" ") : v.numberPlate;
                    return `${name} (${v.numberPlate})`;
                  }}
                  value={selectedVehicle}
                  onChange={(_, val) => setSelectedVehicle(val)}
                  renderInput={(params) => (
                    <TextField {...params} label="Vehicle" placeholder="Select Vehicle..." />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}><Divider textAlign="left">Outbound</Divider></Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Departure Time"
                  type="datetime-local"
                  value={dates.outboundDepart}
                  onChange={(e) => setDates({ ...dates, outboundDepart: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Arrival Time (Est.)"
                  type="datetime-local"
                  value={dates.outboundArrive}
                  onChange={(e) => setDates({ ...dates, outboundArrive: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              {tripType === "roundTrip" && (
                <>
                  <Grid size={{ xs: 12 }}><Divider textAlign="left">Return</Divider></Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Return Departure"
                      type="datetime-local"
                      value={dates.returnDepart}
                      onChange={(e) => setDates({ ...dates, returnDepart: e.target.value })}
                      slotProps={{ inputLabel: { shrink: true } }}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Return Arrival (Est.)"
                      type="datetime-local"
                      value={dates.returnArrive}
                      onChange={(e) => setDates({ ...dates, returnArrive: e.target.value })}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          variant="contained"
          disabled={
            isSubmitting ||
            !selectedOutboundRoute ||
            !selectedVehicle ||
            !dates.outboundDepart ||
            (tripType === "roundTrip" && !dates.returnDepart)
          }
          onClick={handleSubmit}
        >
          {isSubmitting ? "Creating..." : tripType === "roundTrip" ? "Create 2 Trips" : "Create Trip"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTripForm;
