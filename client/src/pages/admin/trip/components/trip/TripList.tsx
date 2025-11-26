import React, { useEffect, useState, useMemo } from "react";
import {
	Box,
	Button,
	Paper,
	TextField,
	InputAdornment,
	IconButton,
	Chip,
	Typography,
} from "@mui/material";
import {
	Add as AddIcon,
	Search as SearchIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Visibility as ViewIcon,
} from "@mui/icons-material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";

import { DataGridPageLayout } from "@components/admin";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants";
import { TripStatus, type TripAttributes } from "@my-types/trip";

import CreateTrip from "./CreateTrip";
import EditTrip from "./EditTrip";
import DeleteTrip from "./DeleteTrip";
import TripDetailsDrawer from "./TripDetailsDrawer";
import { Stack } from "@mui/system";

const TripList: React.FC = () => {
	// --- State ---
	const [trips, setTrips] = useState<TripAttributes[]>([]);
	const [searchTerm, setSearchTerm] = useState("");

	// Selection & Dialogs
	const [selectedTrip, setSelectedTrip] = useState<TripAttributes | null>(
		null
	);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	// --- Actions ---
	const fetchTrips = async () => {
		try {
			const { status, data } = await callApi(
				{
					method: "GET",
					url: API_ENDPOINTS.TRIP.BASE,
					params: { limit: 1000 },
				},
				{ returnFullResponse: true }
			);

			if (status === 200 && data.success) {
				setTrips(data.data);
			}
		} catch (err) {
			console.error("Failed to fetch trips", err);
		}
	};

	useEffect(() => {
		fetchTrips();
	}, []);

	const handleViewDetails = (trip: TripAttributes) => {
		setSelectedTrip(trip);
		setDrawerOpen(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpen(false);
		setSelectedTrip(null);
	};

	const handleOpenEdit = (trip: TripAttributes) => {
		setSelectedTrip(trip);
		setEditOpen(true);
	};

	const handleOpenDelete = (trip: TripAttributes) => {
		setSelectedTrip(trip);
		setDeleteOpen(true);
	};

	// --- Filtering ---
	const filteredTrips = useMemo(() => {
		const query = searchTerm.trim().toLowerCase();
		if (!query) return trips;

		return trips.filter((t) => {
			// - Use route.name instead of non-existent fields
			const routeName = t.route?.name || "Unknown Route";

			// - Robust vehicle name generation
			const vehicleLabel = t.vehicle
				? `${t.vehicle.numberPlate} ${t.vehicle.manufacturer || ""} ${
						t.vehicle.model || ""
				  }`
				: "";

			return (
				routeName.toLowerCase().includes(query) ||
				vehicleLabel.toLowerCase().includes(query) ||
				t.status?.toLowerCase().includes(query) ||
				String(t.id).includes(query)
			);
		});
	}, [trips, searchTerm]);

	// --- Columns ---
	const columns: GridColDef[] = [
		{
			field: "id",
			headerName: "ID",
			width: 70,
		},
		{
			field: "route",
			headerName: "Route",
			flex: 2,
			minWidth: 200,
			renderCell: (params) => {
				const data: TripAttributes = params.row;

				const status = (data.status as string)?.toUpperCase() || "UNKNOWN";
				const isTemplate = data.isTemplate;
				const isRoundTrip = Boolean(data.returnTripId);

				let color:
					| "default"
					| "primary"
					| "secondary"
					| "error"
					| "info"
					| "success"
					| "warning" = "default";

				switch (status) {
					case TripStatus.SCHEDULED:
						color = "info";
						break;
					case TripStatus.COMPLETED:
						color = "success";
						break;
					case TripStatus.CANCELLED:
						color = "error";
						break;
					case TripStatus.DEPARTED:
						color = "warning";
						break;
					case TripStatus.DELAYED:
						color = "warning";
						break;
					default:
						color = "default";
						break;
				}

				return (
					<Box
						display={"flex"}
						height={"100%"}
						flexDirection={"column"}
						alignItems={"flex-start"}
						justifyContent={"center"}
					>
						<Typography
							maxWidth={"100%"}
							textOverflow={"ellipsis"}
							overflow={"hidden"}
							variant="body2"
							gutterBottom
						>
							{`${data.route?.name.toString()}` ||
								`Route #${data.routeId}`}
						</Typography>
						<Stack direction={"row"} gap={0.25}>
							<Chip
								label={status}
								color={color}
								size="small"
								variant="outlined"
							/>
							{isRoundTrip &&
							<Chip
								label={"Round Trip"}
								color="info"
								size="small"
								variant="outlined"
							/>}
							{isTemplate &&
							<Chip
								label={"Repeated"}
								color="success"
								size="small"
								variant="outlined"
							/>}
						</Stack>
					</Box>
				);
			},
		},
		{
			field: "vehicle",
			headerName: "Vehicle",
			flex: 1,
			minWidth: 180,
			valueGetter: (_value, row: TripAttributes) => {
				// - Handle optional manufacturer/model
				if (!row.vehicle) return `Vehicle #${row.vehicleId}`;
				const details = [row.vehicle.manufacturer, row.vehicle.model]
					.filter(Boolean)
					.join(" ");

				return details
					? `${row.vehicle.numberPlate} (${details})`
					: row.vehicle.numberPlate;
			},
		},
		{
			field: "startTime",
			headerName: "Departure",
			flex: 1,
			minWidth: 150,
			valueFormatter: (value) =>
				value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "-",
		},
		{
			field: "returnStartTime",
			headerName: "Departure (Return)",
			flex: 1,
			minWidth: 150,
			valueFormatter: (value: Date) =>
				value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "-",
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
					  }).format(value)
					: "N/A",
		},
		{
			field: "actions",
			headerName: "Actions",
			width: 120,
			sortable: false,
			renderCell: (params) => {
				const trip = params.row as TripAttributes;
				return (
					<Box onClick={(e) => e.stopPropagation()}>
						<IconButton
							size="small"
							onClick={(e) => {
								e.stopPropagation();
								handleViewDetails(trip);
							}}
							title="View Details"
						>
							<ViewIcon />
						</IconButton>
						<IconButton
							size="small"
							color="primary"
							onClick={(e) => {
								e.stopPropagation();
								handleOpenEdit(trip);
							}}
							title="Edit"
						>
							<EditIcon />
						</IconButton>
						<IconButton
							size="small"
							color="error"
							onClick={(e) => {
								e.stopPropagation();
								handleOpenDelete(trip);
							}}
							title="Delete"
						>
							<DeleteIcon />
						</IconButton>
					</Box>
				);
			},
		},
	];

	return (
		<DataGridPageLayout
			title="Trip Management"
			actionBar={
				<Box
					sx={{
						display: "flex",
						gap: 2,
						alignItems: "center",
						flexWrap: "wrap",
					}}
				>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => setCreateOpen(true)}
					>
						Add Trip
					</Button>
					<TextField
						size="small"
						placeholder="Search trips..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
							},
						}}
					/>
				</Box>
			}
		>
			<Paper elevation={3} sx={{ width: "100%" }}>
				<DataGrid
					rows={filteredTrips}
					columns={columns}
					rowHeight={62}
					pagination
					initialState={{
						pagination: {
							paginationModel: { pageSize: 10, page: 0 },
						},
					}}
					pageSizeOptions={[10, 25, 50]}
					onRowClick={(params) => handleViewDetails(params.row)}
					sx={{ border: "none" }}
				/>
			</Paper>

			<TripDetailsDrawer
				open={drawerOpen}
				onClose={handleCloseDrawer}
				trip={selectedTrip}
				onEdit={(trip) => {
					handleCloseDrawer();
					handleOpenEdit(trip);
				}}
			/>

			<CreateTrip
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				onCreated={fetchTrips}
			/>

			{selectedTrip && (
				<EditTrip
					open={editOpen}
					onClose={() => setEditOpen(false)}
					trip={selectedTrip}
					onEdited={() => {
						setEditOpen(false);
						fetchTrips();
					}}
				/>
			)}
			{selectedTrip && (
				<DeleteTrip
					open={deleteOpen}
					onClose={() => setDeleteOpen(false)}
					trip={selectedTrip}
					onDeleted={() => {
						setDeleteOpen(false);
						fetchTrips();
					}}
				/>
			)}
		</DataGridPageLayout>
	);
};

export default TripList;
