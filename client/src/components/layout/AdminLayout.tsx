import React, { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import { useAuth } from "@hooks/useAuth";
import { redirect, useMatches } from "react-router-dom";

interface AdminLayoutProps {
	children: React.ReactNode;
}

const PageTitleUpdater = () => {
	const matches = useMatches();
	const default_title = "EasyRide - Bus Ticket Booking";

	const title = useMemo(() => {
		// find the deepest route with a handle.title
		const match = [...matches].reverse().find((match) => {
			return (match as any).handle;
		});

		if (match) {
			const h = (match as any).handle;

			return typeof h.title === "function"
				? h.title(match.data)
				: h.title;
		}

		return default_title;
	}, [matches]);

	useEffect(() => {
		document.title = title;
	}, [title]);

	return null;
};


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
					marginLeft: sidebarCollapsed ? "70px" : "220px",
					minHeight: "100vh",
					backgroundColor: "#fafafa",
					transition: "margin-left 0.3s ease",
					maxWidth: sidebarCollapsed ? "calc(100vw - 70px)" : "calc(100vw - 200px)",
					overflowX: "hidden"
				}}
			>
				<PageTitleUpdater/>
				{children}
			</Box>
		</Box>
	);
};

export default AdminLayout;
