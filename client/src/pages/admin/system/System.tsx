import React, { useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { ApiTest } from "./components";
import SystemSettingsManager from "./components/SystemSettingsManager";
import TabPanel from "@components/common/TabPanel";

const System: React.FC = () => {
	const [activeTab, setActiveTab] = useState(0); // 0 for Vehicles, 1 for Vehicle Types

	const handleTabChange = (
		_event: React.SyntheticEvent,
		newValue: number
	) => {
		setActiveTab(newValue);
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography
				variant="h4"
				sx={{
					fontWeight: "bold",
					color: "#2E7D32",
					mb: 3,
				}}
			>
				System Settings
			</Typography>

			<Typography variant="body1" color="text.secondary" gutterBottom>
				Configure system settings and preferences
			</Typography>

			<Tabs
				value={activeTab}
				onChange={handleTabChange}
				sx={{
					borderBottom: 3,
					borderColor: "divider",
					marginBottom: 3
				}}
			>
				<Tab label="Api Test" />
				<Tab label="System Settings" />
			</Tabs>

			<TabPanel value={activeTab} index={0}>
				<ApiTest key={activeTab} />
			</TabPanel>
			<TabPanel value={activeTab} index={1}>
				<SystemSettingsManager key={activeTab} />
			</TabPanel>
		</Box>
	);
};

export default System;
