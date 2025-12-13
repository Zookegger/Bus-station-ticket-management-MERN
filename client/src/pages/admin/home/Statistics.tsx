import React, { useEffect, useState, useRef } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import { Statistics } from "./components";
import { callApi } from "@utils/apiCaller";
import type { DashboardStats } from "@my-types/dashboard";
import type { Order } from "@my-types/order";
import { useSocket } from "@contexts/SocketContext";
import { ROOMS, RT_EVENTS } from "@constants/realtime";
import { API_ENDPOINTS } from "@constants/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

const StatisticsPage: React.FC = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<DashboardStats | null>(null);
	const [orders, setOrders] = useState<Order[]>([]);
	const filterRef = useRef<{ from?: string; to?: string }>({});

	const { socket, isConnected, joinRoom, leaveRoom } = useSocket();

	const fetchDashboardData = async (
		fromDate?: string,
		toDate?: string,
		isBackground = false
	) => {
		if (!isBackground) setLoading(true);
		try {
			const dashboardParams: any = {};
			if (fromDate) dashboardParams.from = fromDate;
			if (toDate) dashboardParams.to = toDate;

			const orderParams: any = { limit: 10 };
			if (fromDate) orderParams.dateFrom = fromDate;
			if (toDate) orderParams.dateTo = toDate;

			const [statsResponse, ordersResponse] = await Promise.all([
				callApi<DashboardStats>({
					method: "GET",
					url: "/dashboard/stats",
					params: dashboardParams,
				}),
				callApi<Order[]>({
					method: "GET",
					url: API_ENDPOINTS.ORDER.BASE,
					params: orderParams,
				}),
			]);

			setData(statsResponse as unknown as DashboardStats);
			setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
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
			fetchDashboardData(filterRef.current.from, filterRef.current.to, true);
		};

		socket?.on(RT_EVENTS.DASHBOARD_METRICS, handleMetricsUpdate);

		return () => {
			leaveRoom(ROOMS.dashboard);
			socket?.off(RT_EVENTS.DASHBOARD_METRICS, handleMetricsUpdate);
		};
	}, [socket, isConnected, joinRoom, leaveRoom]);

	const handleApplyFilter = (from: string, to: string) => {
		filterRef.current = { from, to };
		fetchDashboardData(from, to);
	};

	const handleClearFilter = () => {
		filterRef.current = {};
		fetchDashboardData();
	};

	const handleExportExcel = () => {
		if (!orders || orders.length === 0) return;

		const exportData = orders.map((order) => ({
			"Order ID": order.id,
			"Customer": order.user?.fullName || order.guestPurchaserName || "Guest",
			"Email": order.user?.email || order.guestPurchaserEmail || "N/A",
			"Status": order.status,
			"Total Price": order.totalFinalPrice,
			"Date": order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A",
		}));

		const ws = XLSX.utils.json_to_sheet(exportData);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Recent Orders");
		XLSX.writeFile(wb, `orders_export_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`);
	};

	const handleExportPDF = () => {
		if (!orders || orders.length === 0) return;

		const doc = new jsPDF();

		const tableColumn = ["Order ID", "Customer", "Email", "Status", "Total Price", "Date"];
		const tableRows: any[] = [];

		orders.forEach((order) => {
			const orderData = [
				order.id,
				order.user?.fullName || order.guestPurchaserName || "Guest",
				order.user?.email || order.guestPurchaserEmail || "N/A",
				order.status,
				order.totalFinalPrice,
				order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A",
			];
			tableRows.push(orderData);
		});

		autoTable(doc, {
			head: [tableColumn],
			body: tableRows,
			startY: 20,
		});

		doc.text("Recent Orders Report", 14, 15);
		doc.save(`orders_export_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`);
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
					orders={orders}
					loading={loading}
					on_apply_date_range={handleApplyFilter}
					on_clear_date_range={handleClearFilter}
					on_export_excel={handleExportExcel}
					on_export_pdf={handleExportPDF}
				/>
			)}
		</Box>
	);
};

export default StatisticsPage;
