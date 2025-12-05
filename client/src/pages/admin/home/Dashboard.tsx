import React, { useEffect, useState, useRef } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import { Statistics } from "./components"; // Note: Ensure this import name matches your export (Statistic vs Statistics)
import { callApi } from "@utils/apiCaller";
import type { DashboardStats } from "@my-types/dashboard";
import { useSocket } from "@contexts/SocketContext";
import { ROOMS, RT_EVENTS } from "@constants/realtime";

const Dashboard: React.FC = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<DashboardStats | null>(null);
	const filterRef = useRef<{ from?: string; to?: string }>({});

	const { socket, joinRoom, leaveRoom } = useSocket();

	const fetchDashboardData = async (
		fromDate?: string,
		toDate?: string,
		isBackground = false
	) => {
		if (!isBackground) setLoading(true);
		try {
			const params: any = {};
			if (fromDate) params.from = fromDate;
			if (toDate) params.to = toDate;

			const response = await callApi<DashboardStats>({
				method: "GET",
				url: "/dashboard/stats",
				params,
			});

			// Assuming callApi returns the data object directly based on your utils
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
		fetchDashboardData();
		joinRoom(ROOMS.dashboard);

		const handleMetricsUpdate = () => {
			// Re-fetch data with current filters silently
			fetchDashboardData(filterRef.current.from, filterRef.current.to, true);
		};

		socket?.on(RT_EVENTS.DASHBOARD_METRICS, handleMetricsUpdate);

		return () => {
			leaveRoom(ROOMS.dashboard);
			socket?.off(RT_EVENTS.DASHBOARD_METRICS, handleMetricsUpdate);
		};
	}, [socket, joinRoom, leaveRoom]);

	const handleApplyFilter = (from: string, to: string) => {
		filterRef.current = { from, to };
		fetchDashboardData(from, to);
	};

	const handleClearFilter = () => {
		filterRef.current = {};
		fetchDashboardData(); // Reloads with default (last 30 days)
	};

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

	return (
		<Box>
			{data && (
				<Statistics
					stats={{
						totalRevenue: data.totalRevenue,
						totalTrips: data.totalTrips,
						totalUsers: data.totalUsers,
						avgTicketPrice: data.avgTicketPrice,
						ticketsSold: data.ticketsSold,
						cancelledTickets: data.cancelledTickets,
					}}
					daily_revenue={data.dailyRevenue}
					daily_comparison={data.dailyComparison}
					monthly_comparison={data.monthlyComparison}
					yearly_comparison={data.yearlyComparison}
					cancellation_records={data.cancellationRate}
					on_apply_date_range={handleApplyFilter}
					on_clear_date_range={handleClearFilter}
					on_export_excel={() => console.log("Export Excel")}
					on_export_pdf={() => console.log("Export PDF")}
				/>
			)}
		</Box>
	);
};

export default Dashboard;
