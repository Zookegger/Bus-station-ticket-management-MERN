import React, { useState } from "react";
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
} from "@mui/material";
import {
	Add as AddIcon,
	Search as SearchIcon,
	Visibility as VisibilityIcon,
	Delete as DeleteIcon,
} from "@mui/icons-material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { DataGridPageLayout } from "@components/admin";
import type { VehicleWithType, VehicleDetail } from "@my-types/vehicleList";
import VehicleDetailsDrawer from "./VehicleDetailsDrawer";
import EditVehicleForm from "./EditVehicleForm";
import CreateVehicleForm from "./CreateVehicleForm";
import RemoveVehicleForm from "./RemoveVehicleForm";
import type { UpdateVehicleDTO } from "@my-types/vehicle";

const VehicleList: React.FC = () => {
	const [vehicles, setVehicles] = useState<VehicleWithType[]>([]);
	const [vehicleDetails, setVehicleDetails] = useState<VehicleDetail[]>([]);
	const [selectedVehicle, setSelectedVehicle] =
		useState<VehicleDetail | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [vehicleToDelete, setVehicleToDelete] =
		useState<VehicleDetail | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState("");

	// Filter vehicles based on search and type filter
	const filteredVehicles = vehicles.filter((v) => {
		const matchesType = !typeFilter || v.vehicleType.name === typeFilter;
		const displayName =
			v.manufacturer && v.model
				? `${v.manufacturer} ${v.model}`
				: v.numberPlate;
		const matchesSearch =
			!searchTerm ||
			displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			v.numberPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
			v.vehicleType.name.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesType && matchesSearch;
	});

	// Map to DataGrid rows with display name
	const rows = filteredVehicles.map((v) => ({
		...v,
		displayName:
			v.manufacturer && v.model
				? `${v.manufacturer} ${v.model}`
				: `Vehicle ${v.id}`,
	}));

	const handleViewDetails = (vehicle: VehicleWithType) => {
		const detail = vehicleDetails.find((v) => v.id === vehicle.id);
		if (detail) {
			setSelectedVehicle(detail);
			setDrawerOpen(true);
		}
	};

	const handleCloseDrawer = () => {
		setDrawerOpen(false);
		setSelectedVehicle(null);
	};

	const handleOpenEdit = (vehicle: VehicleDetail) => {
		setSelectedVehicle(vehicle);
		setEditOpen(true);
	};

	const handleSaveEdit = (updated: UpdateVehicleDTO) => {
		// For now, we'll update the mock data. In a real app, this would call an API
		setVehicleDetails((prev) =>
			prev.map((v) =>
				v.id === updated.id
					? {
							...v,
							numberPlate: updated.numberPlate || v.numberPlate,
							// Note: vehicleTypeId mapping would need proper vehicle type lookup
							// manufacturer and model would be added to VehicleDetail if needed
					  }
					: v
			)
		);
		setVehicles((prev) =>
			prev.map((v) =>
				v.id === updated.id
					? {
							...v,
							numberPlate: updated.numberPlate || v.numberPlate,
							// vehicleType would need to be looked up from vehicleTypeId
					  }
					: v
			)
		);
	};

	const handleOpenDelete = (vehicle: VehicleDetail) => {
		setVehicleToDelete(vehicle);
		setDeleteOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!vehicleToDelete) return;
		setVehicleDetails((prev) =>
			prev.filter((v) => v.id !== vehicleToDelete.id)
		);
		setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete.id));
		setVehicleToDelete(null);
		setDeleteOpen(false);
		setSelectedVehicle(null);
		setDrawerOpen(false);
	};

	// Define DataGrid columns
	const columns: GridColDef[] = [
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
			field: "actions",
			headerName: "Actions",
			width: 120,
			sortable: false,
			renderCell: (params) => {
				const vehicle = params.row as VehicleWithType & {
					displayName: string;
				};
				return (
					<Box>
						<IconButton
							size="small"
							onClick={(e) => {
								e.stopPropagation();
								handleViewDetails(vehicle);
							}}
							title="View Details"
						>
							<VisibilityIcon />
						</IconButton>
						<IconButton
							size="small"
							color="error"
							onClick={(e) => {
								e.stopPropagation();
								const detail = vehicleDetails.find(
									(v) => v.id === vehicle.id
								);
								if (detail) handleOpenDelete(detail);
							}}
							title="Delete Vehicle"
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
			title="Vehicle Management"
			actionBar={
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => setCreateOpen(true)}
					>
						Add Vehicle
					</Button>
					<FormControl size="small" sx={{ minWidth: 150 }}>
						<InputLabel>Type</InputLabel>
						<Select
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
						>
							<MenuItem value="">All</MenuItem>
							{/* TODO: Fetch vehicle type from API */}
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
					pagination
					initialState={{
						pagination: {
							paginationModel: { pageSize: 10, page: 0 },
						},
					}}
					pageSizeOptions={[5, 10, 20, 50]}
					sx={{ border: "none" }}
				/>
			</Paper>
			{/* TODO: Update VehicleDetailsDrawer to use VehicleDetail from vehicleList.ts */}
			<VehicleDetailsDrawer
				open={drawerOpen}
				onClose={handleCloseDrawer}
				vehicle={selectedVehicle}
				onEdit={handleOpenEdit}
			/>
			{/* TODO: Update EditVehicleForm to handle VehicleDetail type */}
			{editOpen && (
				<EditVehicleForm
					open={editOpen}
					vehicle={selectedVehicle}
					onClose={() => setEditOpen(false)}
					onSave={handleSaveEdit}
				/>
			)}
			{/* Delete Vehicle Form */}
			<RemoveVehicleForm
				open={deleteOpen}
				id={vehicleToDelete?.id}
				onConfirm={handleConfirmDelete}
				onClose={() => setDeleteOpen(false)}
			/>
			{/* Create Vehicle Dialog */}
			<CreateVehicleForm
				open={createOpen}
				onClose={() => setCreateOpen(false)}
			/>
		</DataGridPageLayout>
	);
};

export default VehicleList;
