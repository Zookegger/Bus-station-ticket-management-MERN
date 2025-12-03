import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import DriverList from "./components/driver/DriverList";
import { AssignmentList } from "../assignment";
import TabPanel from "@components/common/TabPanel";
import TripList from "./components/trip/TripList";
import RouteList from "./components/route/Routelist";

const Trip: React.FC = () => {
	const [activeTab, setActiveTab] = useState(0);

	const handleTabChange = (
		_event: React.SyntheticEvent,
		newValue: number
	) => {
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
				<TripList />
			</TabPanel>
			<TabPanel value={activeTab} index={1}>
				<RouteList />
			</TabPanel>

			<TabPanel value={activeTab} index={2}>
				<DriverList />
			</TabPanel>

			<TabPanel value={activeTab} index={3}>
				<AssignmentList />
			</TabPanel>
		</Box>
	);
};

export default Trip;
