import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Alert, Typography, Button, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SummaryCards } from "./components";
import { callApi } from "@utils/apiCaller";
import type { DashboardStats } from "@my-types/dashboard";
import { useSocket } from "@contexts/SocketContext";
import { ROOMS, RT_EVENTS } from "@constants/realtime";
import { ROUTES } from "@constants/routes";
import {
	DirectionsBus,
	People,
	Settings,
	ConfirmationNumber,
	Assessment,
} from "@mui/icons-material";

const Dashboard: React.FC = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<DashboardStats | null>(null);
	const navigate = useNavigate();

	const { socket, isConnected, joinRoom, leaveRoom } = useSocket();

	const fetchDashboardData = async (isBackground = false) => {
		if (!isBackground) setLoading(true);
		try {
			const response = await callApi<DashboardStats>({
				method: "GET",
				url: "/dashboard/stats",
			});
			setData(response as unknown as DashboardStats);
			setError(null);
		} catch (err: any) {
			console.error("Dashboard fetch error:", err);
			if (!isBackground)
				setError(err.message || "Failed to load dashboard statistics");
		} finally {
			if (!isBackground) setLoading(false);
		}
	};

	useEffect(() => {
		if (!socket || !isConnected) return;

		fetchDashboardData();
		joinRoom(ROOMS.dashboard);

		const handleMetricsUpdate = () => {
			fetchDashboardData(true);
		};

		socket?.on(RT_EVENTS.DASHBOARD_METRICS, handleMetricsUpdate);

		return () => {
			leaveRoom(ROOMS.dashboard);
			socket?.off(RT_EVENTS.DASHBOARD_METRICS, handleMetricsUpdate);
		};
	}, [socket, isConnected, joinRoom, leaveRoom]);

	if (loading && !data) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "50vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">{error}</Alert>
			</Box>
		);
	}

	const navItems = [
		{
			label: "Manage Vehicles",
			Icon: DirectionsBus,
			route: ROUTES.DASHBOARD_VEHICLE,
			color: "#1976d2",
		},
		{
			label: "Manage Trips",
			Icon: ConfirmationNumber,
			route: ROUTES.DASHBOARD_TRIP,
			color: "#ef6c00",
		},
		{
			label: "Manage Users",
			Icon: People,
			route: ROUTES.DASHBOARD_USER,
			color: "#5e35b1",
		},
		{
			label: "System Settings",
			Icon: Settings,
			route: ROUTES.DASHBOARD_SYSTEM,
			color: "#424242",
		},
	];

	return (
		<Box p={3}>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				mb={3}
			>
				<Typography variant="h4" fontWeight="bold">
					Dashboard Overview
				</Typography>
				<Button
					variant="contained"
					startIcon={<Assessment />}
					onClick={() => navigate(ROUTES.DASHBOARD_STATISTICS)}
				>
					View Detailed Statistics
				</Button>
			</Box>

			{data && (
				<SummaryCards
					stats={{
						totalRevenue: data.totalRevenue,
						totalTrips: data.totalTrips,
						totalUsers: data.totalUsers,
						avgTicketPrice: data.avgTicketPrice,
						ticketsSold: data.ticketsSold,
						cancelledTickets: data.cancelledTickets,
					}}
				/>
			)}

			<Typography variant="h5" fontWeight="bold" mt={4} mb={2}>
				Quick Navigation
			</Typography>
			<Grid container spacing={3}>
				{navItems.map((item) => (
					<Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.label}>
						<Paper
							elevation={3}
							sx={{
								p: 3,
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								cursor: "pointer",
								transition: "transform 0.2s",
								"&:hover": { transform: "scale(1.05)" },
							}}
							onClick={() => navigate(item.route)}
						>
							<Box sx={{ color: item.color, mb: 1 }}>
								{/* Render the icon component directly to allow proper typing for MUI props */}
								{item.Icon && <item.Icon fontSize="large" />}
							</Box>
							<Typography variant="h6">{item.label}</Typography>
						</Paper>
					</Grid>
				))}
			</Grid>
		</Box>
	);
};

export default Dashboard;
