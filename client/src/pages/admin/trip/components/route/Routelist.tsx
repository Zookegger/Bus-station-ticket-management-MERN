import { API_ENDPOINTS } from "@constants";
import { Button, Paper, Box, CircularProgress } from "@mui/material";
import type { Route } from "@my-types";
import { handleAxiosError } from "@utils/handleError";
import axios from "axios";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { RouteMapDialog, type LocationData } from "@components/map";
import { CreateRouteForm, RouteDetailsDrawer, DeleteRouteForm } from "./index";
import EditRouteForm from "./EditRouteForm";
import { DataGridPageLayout } from "@components/admin";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

/**
 * Admin Route Management list.
 * Fetches routes, displays them in a Grid (v7), supports view/edit/delete dialogs.
 */
const RouteList: React.FC = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [routes, setRoutes] = useState<Route[]>([]);
	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [detailOpen, setDetailOpen] = useState(false);
	const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
	// Map dialog state
	const [mapOpen, setMapOpen] = useState(false);
	const [mapStart, setMapStart] = useState<LocationData | null>(null);
	const [mapEnd, setMapEnd] = useState<LocationData | null>(null);

	const handleOpenDrawer = (id: number) => {
		if (routes === null) {
			return;
		}

		const detail = routes.find((r) => r.id === id);
		if (detail) {
			setSelectedRoute(detail);
			setDetailOpen(true);
		}
	};

	const handleOpenEdit = (id: number) => {
		if (routes === null) {
			return;
		}

		const detail = routes.find((r) => r.id === id);
		if (detail) {
			setSelectedRoute(detail);
			setDetailOpen(false);
			setEditOpen(true);
		}
	};

	const handleOpenDelete = (id: number) => {
		if (routes === null) {
			return;
		}

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

	useEffect(() => {
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
				setRoutes(normalized);
			} catch (err) {
				console.error(handleAxiosError(err));
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, [isLoading]);

	// Columns definition outside JSX for clarity
	const columns: GridColDef[] = [
		{ field: "startLocation", headerName: "Departure", flex: 1 },
		{ field: "destination", headerName: "Destination", flex: 1 },
		{ field: "price", headerName: "Price", width: 150 },
		{ field: "distance", headerName: "Distance", width: 120 },
		{ field: "updatedAt", headerName: "Updated At", width: 190 },
		{ field: "createdAt", headerName: "Created At", width: 190 },
		{
			field: "map",
			headerName: "Map",
			width: 100,
			sortable: false,
			renderCell: (params) => {
				const raw = routes.find((r) => r.id === params.id);
				const hasCoords = !!(
					raw?.startLocation?.latitude &&
					raw?.startLocation?.longitude &&
					raw?.destination?.latitude &&
					raw?.destination?.longitude
				);
				return (
					<Button
						size="small"
						variant="outlined"
						disabled={!raw || !hasCoords}
						onClick={(e) => {	
							e.stopPropagation();
							if (!raw) return;
							if (
								raw.startLocation?.latitude &&
								raw.startLocation?.longitude
							) {
								setMapStart({
									latitude: raw.startLocation.latitude,
									longitude: raw.startLocation.longitude,
									name: raw.startLocation.name ?? "Start",
								});
							}
							if (
								raw.destination?.latitude &&
								raw.destination?.longitude
							) {
								setMapEnd({
									latitude: raw.destination.latitude,
									longitude: raw.destination.longitude,
									name: raw.destination.name ?? "End",
								});
							}
							setMapOpen(true);
						}}
					>
						Map
					</Button>
				);
			},
		},
	];

	const rows = routes.map((r) => ({
		id: r.id,
		startLocation: r.startLocation?.name ?? "Unknown",
		destination: r.destination?.name ?? "Unknown",
		price: r.price ? `${r.price.toLocaleString("vi-VN")} VND` : "N/A",
		distance: r.distance ? `${r.distance.toFixed(2)} km` : "N/A",
		updatedAt: format(new Date(r.updatedAt), "dd/MM/yyyy - HH:mm:ss"),
		createdAt: format(new Date(r.createdAt), "dd/MM/yyyy - HH:mm:ss"),
	}));

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
				}}
			/>
			<CreateRouteForm
				open={addOpen}
				onClose={() => setAddOpen(false)}
				onCreated={() => setIsLoading(true)}
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
						onConfirm={() => setIsLoading(true)}
					/>
				</>
			)}
			{/* Map dialog for viewing/editing route coordinates */}
			<RouteMapDialog
				open={mapOpen}
				onClose={() => setMapOpen(false)}
				initialStart={mapStart ?? undefined}
				initialEnd={mapEnd ?? undefined}
				onConfirm={(start, end) => {
					// Currently just close; persistence can be added when API supports coordinate updates
					setMapStart(start);
					setMapEnd(end);
					setMapOpen(false);
				}}
				title="Route Map"
			/>
		</DataGridPageLayout>
	);
};

export default RouteList;
