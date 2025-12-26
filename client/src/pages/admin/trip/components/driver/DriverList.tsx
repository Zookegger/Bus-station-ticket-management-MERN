import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	Alert,
	Avatar,
	Box,
	Button,
	Chip,
	FormControl,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
	TextField,
	Typography,
	Snackbar,
} from "@mui/material";
import {
	DataGrid,
	type GridColDef,
	type GridRenderCellParams,
	type GridRowParams,
} from "@mui/x-data-grid";
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	Error as ErrorIcon,
	Search as SearchIcon,
	Refresh as RefreshIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { DataGridPageLayout } from "@components/admin";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import ConfirmDeleteDialog from "@components/common/ConfirmDeleteDialog";
import DriverDetails from "./DriverDetails";
import DriverForm from "./DriverForm";
import { DriverStatus, type Driver } from "@my-types/driver";
import { useAdminRealtime } from "@hooks/useAdminRealtime";
import { formatDateDisplay } from "@utils/formatting";

/**
 * Generates uppercase initials for a driver's name so we always have an avatar fallback.
 *
 * @param name - Full name provided for the driver.
 * @returns First two uppercase characters of the provided name or `NA` when empty.
 */
const getInitials = (name: string): string => {
	// Split the incoming name and keep the first characters to build the initials.
	const trimmedName = name.trim();
	if (!trimmedName) {
		return "NA";
	}
	return trimmedName
		.split(/\s+/)
		.map((segment) => segment[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
};

/**
 * Maps a `DriverStatus` value to a human readable label for UI display.
 *
 * @param status - Current driver status value stored in the database.
 * @returns Friendly status label that can be shown inside the chip.
 */
const getStatusLabel = (status: DriverStatus): string => {
	// Keep the mapping explicit so future enum additions are easy to audit.
	switch (status) {
		case DriverStatus.SUSPENDED:
			return "Suspended";
		case DriverStatus.INACTIVE:
			return "Inactive";
		default:
			return "Active";
	}
};

/**
 * Resolves the correct color token for a status chip based on the driver's status.
 *
 * @param status - Driver status that needs to be visualised.
 * @returns The MUI palette color key we should use on the chip.
 */
const getStatusChipColor = (
	status: DriverStatus
): "error" | "success" | "warning" => {
	// Provide a consistent color scheme across the entire admin dashboard.
	switch (status) {
		case DriverStatus.SUSPENDED:
			return "error";
		case DriverStatus.INACTIVE:
			return "warning";
		default:
			return "success";
	}
};

/**
 * Renders the composite driver cell that contains avatar, name, license, and status.
 *
 * @param params - Cell rendering parameters provided by the MUI Grid component.
 * @returns React node that should be mounted inside the cell.
 */
const renderDriverCell = (
	params: GridRenderCellParams<Driver>
): React.ReactNode => {
	// Prepare all derived display values before rendering any JSX.
	const fullname = params.row.fullname ?? "";
	const initials = getInitials(fullname);
	const status = params.row.status ?? DriverStatus.ACTIVE;
	const statusLabel = getStatusLabel(status);
	const statusColor = getStatusChipColor(status);

	return (
		<Stack
			direction="row"
			spacing={1}
			alignItems="center"
			justifyContent="flex-start"
			height="100%"
		>
			<Avatar
				sx={{
					width: 32,
					height: 32,
					fontSize: 14,
					fontWeight: 600,
				}}
			>
				{initials}
			</Avatar>
			<Box>
				<Typography variant="body2" sx={{ fontWeight: 500 }}>
					{fullname || "Unnamed driver"}
				</Typography>
				<Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
					<Chip
						label={params.row.licenseCategory ?? "—"}
						size="small"
						sx={{ height: 20, fontSize: 11 }}
					/>
					<Chip
						label={statusLabel}
						size="small"
						color={statusColor}
						sx={{ height: 20, fontSize: 11, fontWeight: "bold" }}
					/>
				</Stack>
			</Box>
		</Stack>
	);
};

/**
 * Builds the column configuration for the admin driver grid.
 *
 * @param onEdit - Callback fired when the edit button is clicked.
 * @param onDelete - Callback fired when the delete button is clicked.
 * @returns Array of column definitions consumed by MUI Grid.
 */
const createDriverColumns = (
	onEdit: (driver: Driver) => void,
	onDelete: (driver: Driver) => void
): GridColDef<Driver>[] => [
	{
		field: "id",
		headerName: "ID",
		width: 70,
	},
	{
		field: "fullname",
		headerName: "Driver",
		flex: 1.3,
		minWidth: 240,
		sortable: false,
		renderCell: renderDriverCell,
	},
	{
		field: "phoneNumber",
		headerName: "Phone",
		flex: 0.9,
		minWidth: 150,
		valueGetter: (value) => value ?? "N/A",
	},
	{
		field: "licenseNumber",
		headerName: "License #",
		flex: 0.8,
		minWidth: 150,
		valueGetter: (value) => value ?? "N/A",
	},
	{
		field: "hiredAt",
		headerName: "Hired",
		width: 140,
		valueFormatter: (value: Date | string) => formatDateDisplay(value),
	},
	{
		field: "dateOfBirth",
		headerName: "DOB",
		width: 140,
		valueFormatter: (value: Date | string) => formatDateDisplay(value),
	},
	{
		field: "updatedAt",
		headerName: "Updated At",
		width: 190,
		valueFormatter: (value: Date) =>
			value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "-",
	},
	{
		field: "createdAt",
		headerName: "Created At",
		width: 190,
		valueFormatter: (value: Date) =>
			value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "-",
	},
	{
		field: "actions",
		headerName: "Actions",
		width: 100,
		sortable: false,
		renderCell: (params) => (
			<Box onClick={(e) => e.stopPropagation()}>
				<IconButton
					size="small"
					color="primary"
					onClick={(e) => {
						e.stopPropagation();
						onEdit(params.row);
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
						onDelete(params.row);
					}}
					title="Delete"
				>
					<DeleteIcon />
				</IconButton>
			</Box>
		),
	},
];

/**
 * Admin facing driver management page that supports filtering, quick lookups, and inline actions.
 *
 * @returns React component rendering the driver list view.
 */
const DriverList: React.FC = () => {
	// Store all fetched drivers so we can derive filtered lists without reloading.
	const [drivers, setDrivers] = useState<Driver[]>([]);
	// Control booleans for the primary dialogs and detail drawer.
	const [dialogOpen, setDialogOpen] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	// Track the driver currently selected for viewing or editing.
	const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
	const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
	const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);
	// Support filters and text search across the dataset.
	const [statusFilter, setStatusFilter] = useState<DriverStatus | "all">(
		"all"
	);
	const [searchTerm, setSearchTerm] = useState("");
	// Keep fetch lifecycle state for UX feedback.
	const [isLoading, setIsLoading] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null);
	// Bump this value whenever we need to refresh the dataset after a mutation.
	const [dataVersion, setDataVersion] = useState(0);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });

	const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

	const handleEdit = useCallback((driver: Driver) => {
		setEditingDriver(driver);
		setDialogOpen(true);
	}, []);

	const handleDelete = useCallback((driver: Driver) => {
		setDeletingDriver(driver);
		setDeleteDialogOpen(true);
	}, []);

	const confirmDelete = useCallback(async () => {
		if (!deletingDriver) return;
		await callApi({
			method: "DELETE",
			url: API_ENDPOINTS.DRIVER.DELETE(deletingDriver.id),
		});
		setDataVersion((v) => v + 1);
		setSnackbar({
			open: true,
			message: "Driver deleted successfully",
			severity: "success",
		});
	}, [deletingDriver]);

	// Column definitions stay memoised to avoid re-renders of the grid component.
	const columns = useMemo(
		() => createDriverColumns(handleEdit, handleDelete),
		[handleEdit, handleDelete]
	);

	/**
	 * Filters the full driver list by the current search term and status selection.
	 */
	const visibleRows = useMemo(() => {
		// Normalise search term once to keep the predicate lean.
		const loweredSearch = searchTerm.trim().toLowerCase();
		return drivers.filter((driver) => {
			if (statusFilter !== "all" && driver.status !== statusFilter) {
				return false;
			}
			if (!loweredSearch) {
				return true;
			}
			const haystack = [
				driver.fullname ?? "",
				driver.email ?? "",
				driver.phoneNumber ?? "",
				driver.licenseNumber ?? "",
			]
				.join(" ")
				.toLowerCase();
			return haystack.includes(loweredSearch);
		});
	}, [drivers, searchTerm, statusFilter]);

	/**
	 * Fetches the driver list from the server API and stores it locally.
	 */
	const fetchDrivers = useCallback(async () => {
		// Start each fetch cycle by resetting the error and toggling the loading spinner.
		setIsLoading(true);
		setFetchError(null);
		try {
			const { status, data } = await callApi(
				{
					method: "GET",
					url: API_ENDPOINTS.DRIVER.BASE,
					params: { limit: 250 },
				},
				{ returnFullResponse: true }
			);

			if (status === 200 && Array.isArray(data)) {
				setDrivers(data);
				return;
			}
			setFetchError(data.message ?? "Failed to load drivers.");
		} catch (error) {
			// Convert unknown errors into a friendly string for the alert component.
			const message =
				error instanceof Error
					? error.message
					: "Failed to load drivers.";
			setFetchError(message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useAdminRealtime({
		entity: "driver",
		onRefresh: fetchDrivers,
		onNotify: (message, severity) =>
			setSnackbar({
				open: true,
				message,
				severity: severity || "info",
			}),
	});

	/**
	 * Opens the detail drawer for the provided driver instance.
	 */
	const openDetails = useCallback((driver: Driver) => {
		// Save the driver and toggle the drawer in one atomic update.
		setSelectedDriver(driver);
		setDrawerOpen(true);
	}, []);

	// Load the driver list on mount and whenever the dataVersion changes after mutations.
	useEffect(() => {
		fetchDrivers();
	}, [fetchDrivers, dataVersion]);

	// Build the action bar once per render so button handlers capture fresh state.
	const actionBar = (
		<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
			<Button
				variant="contained"
				className="hvr-icon-pop"
				sx={{ textTransform: "none", fontWeight: "bold" }}
				startIcon={<AddIcon className="hvr-icon" />}
				onClick={() => {
					setEditingDriver(null);
					setDialogOpen(true);
				}}
			>
				Add Driver
			</Button>
			<IconButton
				color="primary"
				onClick={fetchDrivers}
				title="Refresh"
			>
				<RefreshIcon />
			</IconButton>
			<FormControl size="small" sx={{ minWidth: 140 }}>
				<InputLabel>Status</InputLabel>
				<Select
					label="Status"
					value={statusFilter}
					onChange={(event) =>
						setStatusFilter(
							event.target.value as DriverStatus | "all"
						)
					}
				>
					<MenuItem value="all">All</MenuItem>
					<MenuItem value={DriverStatus.ACTIVE}>Active</MenuItem>
					<MenuItem value={DriverStatus.INACTIVE}>Inactive</MenuItem>
					<MenuItem value={DriverStatus.SUSPENDED}>
						Suspended
					</MenuItem>
				</Select>
			</FormControl>
			<TextField
				size="small"
				placeholder="Search by name, email..."
				value={searchTerm}
				onChange={(event) => setSearchTerm(event.target.value)}
				slotProps={{
					input: {
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon color="action" />
							</InputAdornment>
						),
					},
				}}
				sx={{ minWidth: 250 }}
			/>
		</Box>
	);

	return (
		<DataGridPageLayout title="Driver Management" actionBar={actionBar}>
			{fetchError && (
				<Alert color="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
					{fetchError}
				</Alert>
			)}

			<Paper elevation={3} sx={{ width: "100%" }}>
				<DataGrid
					rows={visibleRows}
					columns={columns}
					loading={isLoading}
					rowHeight={56}
					disableRowSelectionOnClick
					onRowClick={(params: GridRowParams<Driver>) =>
						openDetails(params.row as Driver)
					}
					pagination
					slotProps={{
						pagination: {
							labelRowsPerPage: "Rows per page:",
						},
					}}
					sx={{ maxWidth: "100%" }}
				/>
			</Paper>

			{selectedDriver && (
				<DriverDetails
					driver={selectedDriver}
					open={drawerOpen}
					onClose={() => setDrawerOpen(false)}
					onEdit={(driver) => {
						setEditingDriver(driver);
						setDialogOpen(true);
						setDrawerOpen(false);
					}}
				/>
			)}

			<DriverForm
				open={dialogOpen}
				onClose={() => {
					setDialogOpen(false);
					setEditingDriver(null);
				}}
				initialData={editingDriver ?? undefined}
				onSaved={(message) => {
					setDataVersion((previous) => previous + 1);
					if (message) {
						setSnackbar({
							open: true,
							message,
							severity: "success",
						});
					}
				}}
			/>

			<ConfirmDeleteDialog
				open={deleteDialogOpen}
				title="Delete Driver"
				description={
					<>
						Are you sure you want to delete{" "}
						<strong>{deletingDriver?.fullname}</strong>? This action
						cannot be undone.
					</>
				}
				onClose={() => {
					setDeleteDialogOpen(false);
					setDeletingDriver(null);
				}}
				deleteAction={confirmDelete}
				confirmLabel="Delete Driver"
			/>

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

export default DriverList;
