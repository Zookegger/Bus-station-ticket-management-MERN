import React, { useState } from "react";
import { Box } from "@mui/material";
import TripList from "../components/TripList";
import TripDetailsDrawer from "../components/TripDetailsDrawer";

const Trip: React.FC = () => {
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selected, setSelected] = useState<any>(null);
  return (
    <Box sx={{ p: 3 }}>
      <TripList
        onOpenDetails={(trip) => {
          setSelected(trip);
          setOpen(true);
        }}
      />
      <TripDetailsDrawer
        open={open}
        onClose={() => setOpen(false)}
        trip={selected}
      />
    </Box>
  );
};

export default Trip;
