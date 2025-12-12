import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
	Box,
	Button,
	Paper,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	InputAdornment,
	IconButton,
	Snackbar,
	Alert,
} from "@mui/material";
import {
	Add as AddIcon,
	Search as SearchIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from "@mui/icons-material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { DataGridPageLayout } from "@components/admin";
import type { VehicleWithType, VehicleDetail } from "@my-types/vehicleList";
import VehicleDetailsDrawer from "./VehicleDetailsDrawer";
import VehicleForm from "./VehicleForm";
import RemoveVehicleForm from "./RemoveVehicleForm";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { useAdminRealtime } from "@hooks/useAdminRealtime";

interface VehicleTypeFilter {
	id: number;
	name: string;
}

const VehicleList: React.FC = () => {
	const [vehicles, setVehicles] = useState<VehicleWithType[]>([]);
	const [selectedVehicle, setSelectedVehicle] =
		useState<VehicleDetail | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [formOpen, setFormOpen] = useState(false);
	const [formMode, setFormMode] = useState<"create" | "edit">("create");
	const [vehicleToDelete, setVehicleToDelete] =
		useState<VehicleDetail | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("");
	const [vehicleTypeFilter, SetVehicleTypeFilter] = useState<
		VehicleTypeFilter[] | null
	>(null);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });

	const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

	// Memoized filter to avoid recalculating on every render
	const filteredVehicles = useMemo(() => {
		if (typeFilter === "All") return vehicles;

		return vehicles.filter((v) => {
			const matchesType =
				!typeFilter || v.vehicleType.name === typeFilter;
			const displayName =
				v.manufacturer && v.model
					? `${v.manufacturer} ${v.model}`
					: v.numberPlate;
			const lowerSearch = searchTerm.toLowerCase();
			const matchesSearch =
				!searchTerm ||
				displayName.toLowerCase().includes(lowerSearch) ||
				v.numberPlate.toLowerCase().includes(lowerSearch) ||
				v.vehicleType.name.toLowerCase().includes(lowerSearch);
			return matchesType && matchesSearch;
		});
	}, [vehicles, typeFilter, searchTerm]);

	// Memoized mapping for DataGrid rows
	const rows = useMemo(
		() =>
			filteredVehicles.map((v) => ({
				...v,
				displayName:
					v.manufacturer && v.model
						? `${v.manufacturer} ${v.model}`
						: `Vehicle ${v.id}`,
			})),
		[filteredVehicles]
	);

	const handleViewDetails = (vehicle: VehicleWithType) => {
		setSelectedVehicle(vehicle);
		setDrawerOpen(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpen(false);
		setSelectedVehicle(null);
	};

	const handleOpenCreate = () => {
		setFormMode("create");
		setFormOpen(true);
	};

	const handleOpenEdit = (vehicle: VehicleDetail) => {
		setDrawerOpen(false);
		setSelectedVehicle(vehicle);
		setFormMode("edit");
		setFormOpen(true);
	};

	const handleOpenDelete = (vehicle: VehicleDetail) => {
		setVehicleToDelete(vehicle);
		setDeleteOpen(true);
	};

	const handleConfirmDelete = (message?: string) => {
		if (!vehicleToDelete) return;
		setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete.id));
		setVehicleToDelete(null);
		setDeleteOpen(false);
		setSelectedVehicle(null);
		setDrawerOpen(false);
		if (message) {
			setSnackbar({
				open: true,
				message,
				severity: "success",
			});
		}
	};

	// Define DataGrid columns
	const columns: GridColDef[] = [
		{
			field: "id",
			headerName: "ID",
			flex: 1,
			minWidth: 30,
		},
		{
			field: "displayName",
			headerName: "Name",
			flex: 1,
			minWidth: 150,
		},
		{
			field: "numberPlate",
			headerName: "License Plate",
			flex: 1,
			minWidth: 150,
		},
		{
			field: "vehicleType",
			headerName: "Vehicle Type",
			flex: 1,
			minWidth: 150,
			valueGetter: (value: VehicleWithType["vehicleType"]) => value.name,
		},
		{
			field: "updatedAt",
			headerName: "Updated At",
			width: 190,
			valueFormatter: (value: Date) => {
				return value
					? `${new Date(value).toLocaleDateString()} - ${new Date(
							value
					  ).toLocaleTimeString()}`
					: "N/A";
			},
		},
		{
			field: "createdAt",
			headerName: "Created At",
			width: 190,
			valueFormatter: (value: Date) => {
				return value
					? `${new Date(value).toLocaleDateString()} - ${new Date(
							value
					  ).toLocaleTimeString()}`
					: "N/A";
			},
		},
		{
			field: "actions",
			headerName: "Actions",
			width: 120,
			sortable: false,
			renderCell: (params) => {
				const vehicle = params.row as VehicleWithType & {
					displayName: string;
				};
				return (
					<Box onClick={(e) => e.stopPropagation()}>
						<IconButton
							size="small"
							color="primary"
							onClick={(e) => {
								e.stopPropagation();
								handleOpenEdit(vehicle);
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
								handleOpenDelete(vehicle);
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

	const fetchVehicles = useCallback(async () => {
		try {
			const { status, data } = await callApi(
				{ method: "GET", url: API_ENDPOINTS.VEHICLE.BASE },
				{ returnFullResponse: true }
			);

			if (status === 304 || status === 200) {
				setVehicles(data.rows);
			}
		} catch (err) {
			console.error(err);
		}
	}, []);

	useEffect(() => {
		const fetchVehicleTypes = async () => {
			try {
				const { status, data } = await callApi(
					{
						method: "GET",
						url: `${API_ENDPOINTS.VEHICLE_TYPE.BASE}?items=id&items=name`,
					},
					{ returnFullResponse: true }
				);

				if (status === 304 || status === 200) {
					SetVehicleTypeFilter(data);
				}
			} catch (err) {
				console.error(err);
			}
		};

		fetchVehicleTypes();
		fetchVehicles();
	}, [fetchVehicles]);

	useAdminRealtime({
		entity: "vehicle",
		onRefresh: fetchVehicles,
		onNotify: (message, severity) =>
			setSnackbar({
				open: true,
				message,
				severity: severity || "info",
			}),
	});

	return (
		<DataGridPageLayout
			title="Vehicle Management"
			actionBar={
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
					<Button
						variant="contained"
						className="hvr-icon-pop"
						startIcon={<AddIcon className="hvr-icon" />}
						onClick={handleOpenCreate}
					>
						Add Vehicle
					</Button>
					<FormControl size="small" sx={{ minWidth: 150 }}>
						<InputLabel>Type</InputLabel>
						<Select
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
						>
							<MenuItem value="All">All</MenuItem>
							{vehicleTypeFilter &&
								vehicleTypeFilter.map((element) => (
									<MenuItem
										key={element.id}
										value={`${element.name}`}
									>
										{element.name}
									</MenuItem>
								))}
						</Select>
					</FormControl>
					<TextField
						size="small"
						placeholder="Search"
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
					rows={rows}
					columns={columns}
					rowHeight={35}
					pagination
					initialState={{
						pagination: {
							paginationModel: { pageSize: 10, page: 0 },
						},
					}}
					onRowClick={(params) => handleViewDetails(params.row)}
					pageSizeOptions={[5, 10, 20, 50]}
					sx={{ border: "none" }}
				/>
			</Paper>
			<VehicleDetailsDrawer
				open={drawerOpen}
				onClose={handleCloseDrawer}
				vehicle={selectedVehicle}
				onEdit={handleOpenEdit}
				onDelete={handleOpenDelete}
			/>
			{/* Vehicle Form (Create/Edit) */}
			<VehicleForm
				open={formOpen}
				initialData={formMode === "edit" ? selectedVehicle : null}
				onClose={() => setFormOpen(false)}
				onSuccess={(message) => {
					fetchVehicles();
					if (message) {
						setSnackbar({
							open: true,
							message,
							severity: "success",
						});
					}
				}}
			/>
			{/* Delete Vehicle Form */}
			<RemoveVehicleForm
				open={deleteOpen}
				id={vehicleToDelete?.id}
				onConfirm={handleConfirmDelete}
				onClose={() => setDeleteOpen(false)}
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

export default VehicleList;
