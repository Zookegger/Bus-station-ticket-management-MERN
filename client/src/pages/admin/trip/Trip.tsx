import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import Driver from "../driver/Driver";
import { AssignmentList } from "../assignment";
import TabPanel from "@components/common/TabPanel";
import TripList from "./components/trip/TripList";
import RouteList from "./components/route/Routelist";
import TripDetailsDrawer from "./components/trip/TripDetailsDrawer";

const Trip: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Trips" />
        <Tab label="Routes" />
        <Tab label="Driver List" />
        <Tab label="Assignment List " />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <TripList
          onOpenDetails={(trip) => {
            setSelected(trip);
            setOpen(true);
          }}
        />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <RouteList />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Driver />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <AssignmentList />
      </TabPanel>

      {/* Drawer chi tiết chuyến đi */}
      <TripDetailsDrawer
        open={open}
        onClose={() => setOpen(false)}
        trip={selected}
      />
    </Box>
  );
};

export default Trip;
