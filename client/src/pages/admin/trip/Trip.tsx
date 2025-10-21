import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import TripList from "./components/TripList";
import RouteList from "./route/Routelist";
import TripDetailsDrawer from "./components/TripDetailsDrawer";

const Vehicle: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Trip List" />
        <Tab label="Route List" />
      </Tabs>

      {activeTab === 0 && (
        <TripList
          onOpenDetails={(trip) => {
            setSelected(trip);
            setOpen(true);
          }}
        />
      )}

      {activeTab === 1 && <RouteList />}

      {/* Drawer chi tiết chuyến đi */}
      <TripDetailsDrawer
        open={open}
        onClose={() => setOpen(false)}
        trip={selected}
      />
    </Box>
  );
};

export default Vehicle;
