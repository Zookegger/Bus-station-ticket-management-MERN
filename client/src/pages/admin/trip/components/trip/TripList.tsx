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
	Tooltip,
} from "@mui/material";
import {
	Add as AddIcon,
	Search as SearchIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	AutoMode as AutoModeIcon,
	PersonAdd as PersonAddIcon,
	PersonRemove as PersonRemoveIcon,
	Cancel as CancelIcon,
} from "@mui/icons-material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import { Snackbar, Alert } from "@mui/material";

import { DataGridPageLayout } from "@components/admin";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { TripStatus, type Trip } from "@my-types/trip";
import TripForm from "./TripForm";
import DeleteTrip from "./DeleteTrip";
import TripDetailsDrawer from "./TripDetailsDrawer";
import { Stack } from "@mui/system";
import { useAdminRealtime } from "@hooks/useAdminRealtime";
import ManualAssignDialog from "./ManualAssignDialog";

const TripList: React.FC = () => {
	// --- State ---
	const [trips, setTrips] = useState<Trip[]>([]);
	const [searchTerm, setSearchTerm] = useState("");

	// Selection & Dialogs
	const [manualAssignOpen, setManualAssignOpen] = useState(false);
	const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [formOpen, setFormOpen] = useState(false);
	const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });

	const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

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

	useAdminRealtime({
		entity: "trip",
		onRefresh: fetchTrips,
		onNotify: (message, severity) =>
			setSnackbar({
				open: true,
				message,
				severity: severity || "info",
			}),
	});

	const handleAutoAssign = async (tripId: number) => {
		try {
			const url = API_ENDPOINTS.TRIP.AUTO_ASSIGN_DRIVER(tripId);
			const { status, data } = await callApi(
				{ method: "POST", url },
				{ returnFullResponse: true }
			);
			if (status === 200) {
				setSnackbar({
					open: true,
					message: "Auto-assignment triggered successfully",
					severity: "success",
				});
				fetchTrips();
			} else {
				setSnackbar({
					open: true,
					message: data.message || "Auto-assignment failed",
					severity: "error",
				});
			}
		} catch (error: any) {
			setSnackbar({
				open: true,
				message:
					error.response?.data?.message || "Auto-assignment failed",
				severity: "error",
			});
		}
	};

	const handleCancelTrip = async (tripId: number) => {
		if (
			!window.confirm(
				"Are you sure you want to cancel this trip? This will refund all booked tickets."
			)
		) {
			return;
		}
		try {
			const url = API_ENDPOINTS.TRIP.CANCEL(tripId);
			const { status, data } = await callApi(
				{ method: "PATCH", url },
				{ returnFullResponse: true }
			);
			if (status === 200) {
				setSnackbar({
					open: true,
					message: "Trip cancelled successfully",
					severity: "success",
				});
				fetchTrips();
			} else {
				setSnackbar({
					open: true,
					message: data.message || "Failed to cancel trip",
					severity: "error",
				});
			}
		} catch (err) {
			setSnackbar({
				open: true,
				message: "Error cancelling trip",
				severity: "error",
			});
		}
	};

	const handleUnassign = async (tripId: number) => {
		if (!window.confirm("Are you sure you want to unassign the driver?"))
			return;

		try {
			const url = API_ENDPOINTS.TRIP.UNASSIGN_DRIVER(tripId);
			const { status, data } = await callApi(
				{ method: "DELETE", url },
				{ returnFullResponse: true }
			);
			if (status === 200) {
				setSnackbar({
					open: true,
					message: "Driver unassigned successfully",
					severity: "success",
				});
				fetchTrips();
			} else {
				setSnackbar({
					open: true,
					message: data.message || "Unassignment failed",
					severity: "error",
				});
			}
		} catch (error: any) {
			setSnackbar({
				open: true,
				message: error.response?.data?.message || "Unassignment failed",
				severity: "error",
			});
		}
	};

	const handleSaved = (message?: string) => {
		fetchTrips();
		if (message) {
			setSnackbar({
				open: true,
				message,
				severity: "success",
			});
		}
	};

	const handleViewDetails = (trip: Trip) => {
		setSelectedTrip(trip);
		setDrawerOpen(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpen(false);
		setSelectedTrip(null);
	};

	const handleOpenEdit = (trip: Trip) => {
		setEditingTrip(trip);
		setFormOpen(true);
	};

	const handleOpenDelete = (trip: Trip) => {
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
				const data: Trip = params.row;

				const status =
					(data.status as string)?.toUpperCase() || "UNKNOWN";
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
							{isRoundTrip && (
								<Chip
									label={"Round Trip"}
									color="info"
									size="small"
									variant="outlined"
								/>
							)}
							{isTemplate && (
								<Chip
									label={"Repeated"}
									color="success"
									size="small"
									variant="outlined"
								/>
							)}
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
			valueGetter: (_value, row: Trip) => {
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
			width: 160,
			sortable: false,
			renderCell: (params) => {
				const trip = params.row as Trip;
				const status = (trip.status as string)?.toUpperCase();
				const isScheduled = status === TripStatus.SCHEDULED;
				const hasDriver = trip.drivers && trip.drivers.length > 0;

				return (
					<Box
						onClick={(e) => e.stopPropagation()}
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 0.5,
							width: "100%",
							height: "100%",
						}}
					>
						<Tooltip title={hasDriver ? "Re-assign Driver" : "Manual Assign"}>
							<IconButton
								size="small"
								onClick={(e) => {
									e.stopPropagation();
									setSelectedTrip(trip);
									setManualAssignOpen(true);
								}}
							>
								<PersonAddIcon color="primary" />
							</IconButton>
						</Tooltip>

						{!isScheduled && !hasDriver && (
							<Tooltip title="Auto Assign">
								<IconButton
									size="small"
									onClick={(e) => {
										e.stopPropagation();
										handleAutoAssign(trip.id);
									}}
								>
									<AutoModeIcon color="secondary" />
								</IconButton>
							</Tooltip>
						)}

						{isScheduled && hasDriver && (
							<Tooltip title="Unassign">
								<IconButton
									size="small"
									onClick={(e) => {
										e.stopPropagation();
										handleUnassign(trip.id);
									}}
								>
									<PersonRemoveIcon color="error" />
								</IconButton>
							</Tooltip>
						)}

						<Tooltip title="Edit">
							<IconButton
								size="small"
								color="primary"
								onClick={(e) => {
									e.stopPropagation();
									handleOpenEdit(trip);
								}}
							>
								<EditIcon />
							</IconButton>
						</Tooltip>

						{status !== TripStatus.CANCELLED &&
							status !== TripStatus.COMPLETED && (
								<Tooltip title="Cancel Trip">
									<IconButton
										size="small"
										color="warning"
										onClick={(e) => {
											e.stopPropagation();
											handleCancelTrip(trip.id);
										}}
									>
										<CancelIcon />
									</IconButton>
								</Tooltip>
							)}

						<Tooltip title="Delete">
							<IconButton
								size="small"
								color="error"
								onClick={(e) => {
									e.stopPropagation();
									handleOpenDelete(trip);
								}}
							>
								<DeleteIcon />
							</IconButton>
						</Tooltip>
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
						className="hvr-icon-pop"
						startIcon={<AddIcon className="hvr-icon" />}
						onClick={() => {
							setEditingTrip(null);
							setFormOpen(true);
						}}
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

			<TripForm
				open={formOpen}
				onClose={() => {
					setFormOpen(false);
					setEditingTrip(null);
				}}
				onSaved={handleSaved}
				initialData={editingTrip}
			/>

			{selectedTrip && (
				<>
					<TripDetailsDrawer
						open={drawerOpen}
						onClose={handleCloseDrawer}
						trip={selectedTrip}
						onEdit={(trip) => {
							handleCloseDrawer();
							handleOpenEdit(trip);
						}}
						onDelete={() => {
							handleOpenDelete(selectedTrip);
							handleCloseDrawer();
						}}
					/>
					<DeleteTrip
						open={deleteOpen}
						onClose={() => setDeleteOpen(false)}
						trip={selectedTrip}
						onDeleted={() => {
							setDeleteOpen(false);
							fetchTrips();
						}}
					/>
					<ManualAssignDialog
						open={manualAssignOpen}
						tripId={selectedTrip.id}
						onClose={() => setManualAssignOpen(false)}
						onAssignSuccess={() => {
							// fetchTrips();
							setManualAssignOpen(false);
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

export default TripList;
