import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import VehicleList from "./components/vehicle/VehicleList";
import VehicleTypeList from "./components/vehicleType/VehicleTypeList";
import TabPanel from "@components/common/TabPanel";

const Vehicle: React.FC = () => {
	const [activeTab, setActiveTab] = useState(0); // 0 for Vehicles, 1 for Vehicle Types

	const handleTabChange = (
		_event: React.SyntheticEvent,
		newValue: number
	) => {
		setActiveTab(newValue);
	};

	return (
		<Box>
			{/* Tabs for Switching Views */}
			<Tabs
				value={activeTab}
				onChange={handleTabChange}
				sx={{
					borderBottom: 1,
					borderColor: "divider",
				}}
			>
				<Tab label="Vehicles" />
				<Tab label="Vehicle Types" />
			</Tabs>

			<TabPanel value={activeTab} index={0}>
				<VehicleList key={activeTab}/>
			</TabPanel>
			<TabPanel value={activeTab} index={1}>
				<VehicleTypeList key={activeTab}/>
			</TabPanel>
		</Box>
	);
};

export default Vehicle;
