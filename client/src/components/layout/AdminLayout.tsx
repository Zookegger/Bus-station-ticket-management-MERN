import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import { useAuth } from "@hooks/useAuth";
import { redirect } from "react-router-dom";

interface AdminLayoutProps {
	children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const { isAuthenticated, isAdmin } = useAuth();

	const handleSidebarToggle = (collapsed: boolean) => {
		setSidebarCollapsed(collapsed);
	};

	useEffect(() => {
		if (!isAdmin || !isAuthenticated) {
			redirect("/login");
		} 
	},[isAdmin, isAuthenticated]);

	return (
		<Box sx={{ display: "flex" }}>
			<Sidebar onToggle={handleSidebarToggle} />
			<Box
				sx={{
					flexGrow: 1,
					marginLeft: sidebarCollapsed ? "70px" : "200px",
					minHeight: "100vh",
					backgroundColor: "#fafafa",
					transition: "margin-left 0.3s ease",
					maxWidth: sidebarCollapsed ? "calc(100vw - 70px)" : "calc(100vw - 200px)"
				}}
			>
				{children}
			</Box>
		</Box>
	);
};

export default AdminLayout;
