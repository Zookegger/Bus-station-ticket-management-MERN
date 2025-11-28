import React, { useEffect, useState, useMemo } from "react";
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
	Edit as EditIcon,
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
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";;

interface VehicleTypeFilter {
	id: number;
	name: string;
}

const VehicleList: React.FC = () => {
	const [vehicles, setVehicles] = useState<VehicleWithType[]>([]);
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
	const [vehicleTypeFilter, SetVehicleTypeFilter] = useState<
		VehicleTypeFilter[] | null
	>(null);

	// Memoized filter to avoid recalculating on every render
	const filteredVehicles = useMemo(() => {
		return vehicles.filter((v) => {
			const matchesType = !typeFilter || v.vehicleType.name === typeFilter;
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

	const handleOpenEdit = (vehicle: VehicleDetail) => {
		setSelectedVehicle(vehicle);
		setEditOpen(true);
	};

	const handleSaveEdit = (updated: UpdateVehicleDTO) => {
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

	useEffect(() => {
		const fetchVehicles = async () => {
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
		};

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
	}, []);

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
