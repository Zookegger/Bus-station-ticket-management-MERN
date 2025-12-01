import { API_ENDPOINTS } from "@constants/index";
import { Button, Paper, Box, CircularProgress } from "@mui/material";
import type { Route } from "@my-types";
import { handleAxiosError } from "@utils/handleError";
import axios from "axios";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CreateRouteForm, RouteDetailsDrawer, DeleteRouteForm } from "./index";
import EditRouteForm from "./EditRouteForm";
import { DataGridPageLayout } from "@components/admin";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { formatDistance } from "@utils/map";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

/**
 * Admin Route Management list.
 * Fetches routes, displays them in a DataGrid.
 */
const RouteList: React.FC = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [routes, setRoutes] = useState<Route[]>([]);
	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [detailOpen, setDetailOpen] = useState(false);
	const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

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
			setEditOpen(true);
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
				value
					? new Intl.NumberFormat("vi-VN", {
							style: "currency",
							currency: "VND",
					  }).format(Number.parseFloat(value.toString()))
					: "N/A",
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
			price: r.price ? `${r.price.toLocaleString("vi-VN")} VND` : "N/A",
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
		<Button variant="contained" onClick={() => setAddOpen(true)}>
			Add new route
		</Button>
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

			<EditRouteForm
				route={selectedRoute}
				routeId={selectedRoute ? selectedRoute.id : undefined}
				key={selectedRoute ? selectedRoute.id : "new"}
				open={editOpen}
				onClose={() => setEditOpen(false)}
				onEdited={() => {
					setEditOpen(false);
					setIsLoading(true);
					fetchData(); // Refresh list after edit
				}}
			/>
			<CreateRouteForm
				open={addOpen}
				onClose={() => setAddOpen(false)}
				onCreated={() => {
					setIsLoading(true);
					fetchData(); // Refresh list after create
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
						onConfirm={() => {
							setDeleteOpen(false);
							setIsLoading(true);
							fetchData();
						}}
					/>
				</>
			)}
		</DataGridPageLayout>
	);
};

export default RouteList;
