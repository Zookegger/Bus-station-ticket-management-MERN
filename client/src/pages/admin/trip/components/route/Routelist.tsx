import { API_ENDPOINTS } from "@constants/index";
import { Button, Paper, Box, CircularProgress, Snackbar, Alert, IconButton } from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import type { Route } from "@my-types";
import { handleAxiosError } from "@utils/handleError";
import axios from "axios";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { RouteForm, RouteDetailsDrawer, DeleteRouteForm } from "./index";
import { DataGridPageLayout } from "@components/admin";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { formatDistance } from "@utils/map";
import { useAdminRealtime } from "@hooks/useAdminRealtime";
import { formatCurrency } from "@utils/formatting";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

/**
 * Admin Route Management list.
 * Fetches routes, displays them in a DataGrid.
 */
const RouteList: React.FC = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [routes, setRoutes] = useState<Route[]>([]);
	const [formOpen, setFormOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [detailOpen, setDetailOpen] = useState(false);
	const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });

	const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

	const handleOpenDrawer = (id: number) => {
		const detail = routes.find((r) => r.id === id);
		if (detail) {
			setSelectedRoute(detail);
			setDetailOpen(true);
		}
	};

	const handleOpenEdit = (id: number) => {
		const detail = routes.find((r) => r.id === id);
		if (detail) {
			setSelectedRoute(detail);
			setDetailOpen(false);
			setFormOpen(true);
		}
	};

	const handleOpenDelete = (id: number) => {
		const detail = routes.find((r) => r.id === id);
		if (detail) {
			setSelectedRoute(detail);
			setDetailOpen(false);
			setDeleteOpen(true);
		}
	};

	const handleCloseDrawer = () => {
		setDetailOpen(false);
		setSelectedRoute(null);
	};

	const fetchData = async () => {
		try {
			const response = await axios.get(API_ENDPOINTS.ROUTE.BASE);
			if (response.status !== 200)
				throw new Error("Failed to fetch data");

			const data = response.data as any;
			const normalized: Route[] = Array.isArray(data)
				? data
				: Array.isArray(data.routes)
				? data.routes
				: Array.isArray(data.data)
				? data.data
				: [];

			console.log(normalized);

			setRoutes(normalized);
		} catch (err) {
			console.error(handleAxiosError(err));
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	useAdminRealtime({
		entity: "route",
		onRefresh: fetchData,
		onNotify: (message, severity) =>
			setSnackbar({
				open: true,
				message,
				severity: severity || "info",
			}),
	});

	const columns: GridColDef[] = [
		{ field: "id", headerName: "ID", width: 70 },
		{
			field: "startLocation",
			headerName: "Departure",
			flex: 1,
			minWidth: 150,
		},
		{
			field: "destination",
			headerName: "Destination",
			flex: 1,
			minWidth: 150,
		},
		{
			field: "price",
			headerName: "Price",
			width: 120,
			valueFormatter: (value: number) =>
				value ? formatCurrency(value, "VND", "vi-VN") : "N/A",
		},
		{ field: "distance", headerName: "Distance", width: 100 },
		{ field: "updatedAt", headerName: "Updated At", width: 160 },
		{ field: "createdAt", headerName: "Created At", width: 160 },
	];

	const rows = routes.map((r) => {
		// Sort stops by order to ensure correct start/end logic
		const start =
			r.stops.length > 0 ? r.stops[0].locations?.name : "Unknown";
		const end =
			r.stops.length > 1
				? r.stops[r.stops.length - 1].locations?.name
				: "Unknown";

		return {
			id: r.id,
			startLocation: start || "Unknown",
			destination: end || "Unknown",
			price: r.price || 0,
			distance: r.distance ? formatDistance(r.distance) : "N/A",
			updatedAt: r.updatedAt
				? format(new Date(r.updatedAt), "dd/MM/yyyy - HH:mm:ss")
				: "N/A",
			createdAt: r.createdAt
				? format(new Date(r.createdAt), "dd/MM/yyyy - HH:mm:ss")
				: "N/A",
		};
	});

	const actionBar = (
		<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
			<Button
				variant="contained"
				className="hvr-icon-pop"
				startIcon={<AddIcon className="hvr-icon" />}
				onClick={() => {
					setSelectedRoute(null);
					setFormOpen(true);
				}}
			>
				Add new route
			</Button>
			<IconButton
				color="primary"
				onClick={fetchData}
				title="Refresh"
			>
				<RefreshIcon />
			</IconButton>
		</Box>
	);

	return (
		<DataGridPageLayout title="Route Management" actionBar={actionBar}>
			{isLoading ? (
				<Box display="flex" justifyContent="center" py={8}>
					<CircularProgress />
				</Box>
			) : (
				<Paper elevation={3} sx={{ width: "100%" }}>
					<DataGrid
						rows={rows}
						columns={columns}
						pagination
						rowHeight={35}
						initialState={{
							pagination: { paginationModel: { pageSize: 10 } },
						}}
						pageSizeOptions={[5, 10, 20, 50]}
						sx={{ maxWidth: "100%", border: "none" }}
						onRowClick={(params) =>
							handleOpenDrawer(Number(params.id))
						}
					/>
				</Paper>
			)}

			<RouteForm
				open={formOpen}
				initialData={selectedRoute}
				onClose={() => {
					setFormOpen(false);
					setSelectedRoute(null);
				}}
				onSaved={(_route, message) => {
					setFormOpen(false);
					setSelectedRoute(null);
					setIsLoading(true);
					fetchData();
					if (message) {
						setSnackbar({
							open: true,
							message,
							severity: "success",
						});
					}
				}}
			/>
			{selectedRoute && (
				<>
					<RouteDetailsDrawer
						route={selectedRoute}
						open={detailOpen}
						onClose={handleCloseDrawer}
						onDelete={() => handleOpenDelete(selectedRoute.id)}
						onEdit={() => handleOpenEdit(selectedRoute.id)}
					/>
					<DeleteRouteForm
						id={selectedRoute.id}
						open={deleteOpen}
						onClose={() => setDeleteOpen(false)}
						onConfirm={(message) => {
							setDeleteOpen(false);
							setIsLoading(true);
							fetchData();
							if (message) {
								setSnackbar({
									open: true,
									message,
									severity: "success",
								});
							}
						}}
					/>
				</>
			)}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					sx={{ width: "100%" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</DataGridPageLayout>
	);
};

export default RouteList;
