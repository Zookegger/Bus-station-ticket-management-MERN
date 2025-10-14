import React from "react";
import { Box, Button, Divider, Drawer, Stack, Typography } from "@mui/material";
import Map from "@components/common/Map";

type TripItem = {
  id: number;
  route: string;
  departure: string;
  arrival: string;
  price: string;
  status?: string;
};

interface TripDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  trip: TripItem | null;
}

const TripDetailsDrawer: React.FC<TripDetailsDrawerProps> = ({
  open,
  onClose,
  trip,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 480 } }}
    >
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "#2E7D32", mb: 2 }}
        >
          Trip Details
        </Typography>
        {trip && (
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Route
              </Typography>
              <Typography>{trip.route}</Typography>
            </Box>
            <Divider />
            <Stack direction="row" spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Departure
                </Typography>
                <Typography>{trip.departure}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Arrival
                </Typography>
                <Typography>{trip.arrival}</Typography>
              </Box>
            </Stack>
            <Divider />
            <Stack direction="row" spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Price
                </Typography>
                <Typography>{trip.price}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Typography>{trip.status}</Typography>
              </Box>
            </Stack>
            <Divider />
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Route Map
              </Typography>
              <Box
                sx={{
                  height: 220,
                  borderRadius: 1,
                  overflow: "hidden",
                  border: "1px solid #e0e0e0",
                }}
              >
                <Map height={220} />
              </Box>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={onClose}
                sx={{
                  textTransform: "none",
                  backgroundColor: "#2E7D32",
                  "&:hover": { backgroundColor: "#276a2b" },
                }}
              >
                Back to List
              </Button>
              <Button variant="outlined" sx={{ textTransform: "none" }}>
                Edit Trip
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
};

export default TripDetailsDrawer;
