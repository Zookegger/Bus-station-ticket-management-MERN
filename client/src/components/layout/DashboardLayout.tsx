import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	const handleSidebarToggle = (collapsed: boolean) => {
		setSidebarCollapsed(collapsed);
	};

	return (
		<Box sx={{ display: "flex" }}>
			<Sidebar onToggle={handleSidebarToggle} />
			<Box
				sx={{
					flexGrow: 1,
					marginLeft: sidebarCollapsed ? "70px" : "250px",
					minHeight: "100vh",
					backgroundColor: "#fafafa",
					transition: "margin-left 0.3s ease",
				}}
			>
				{children}
			</Box>
		</Box>
	);
};

export default DashboardLayout;
