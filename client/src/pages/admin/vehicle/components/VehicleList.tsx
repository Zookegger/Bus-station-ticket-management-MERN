import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Typography,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	InputAdornment,
	IconButton,
	TablePagination,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import {
	Add as AddIcon,
	Search as SearchIcon,
	Visibility as VisibilityIcon,
	Delete as DeleteIcon,
} from "@mui/icons-material";
import type { Vehicle, VehicleDetail } from "./types";
import type { UpdateVehicleDTO } from "../../../../types/vehicle";
import vehiclesData from "@data/vehicles.json";
import vehicleDetailsData from "@data/vehicleDetails.json";
import VehicleDetailsDrawer from "./VehicleDetailsDrawer";
import EditVehicleForm from "./EditVehicleForm";

const VehicleList: React.FC = () => {
	const navigate = useNavigate();
	const [vehicles, setVehicles] = useState<Vehicle[]>(vehiclesData);
	const [vehicleDetails, setVehicleDetails] =
		useState<VehicleDetail[]>(vehicleDetailsData);
	const [selectedVehicle, setSelectedVehicle] =
		useState<VehicleDetail | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [vehicleToDelete, setVehicleToDelete] =
		useState<VehicleDetail | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [typeFilter, setTypeFilter] = useState("");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Active":
				return "success";
			case "Standby":
				return "warning";
			case "In Progress":
				return "info";
			default:
				return "default";
		}
	};

	const filteredVehicles = vehicles.filter((v) => {
		const matchesStatus = !statusFilter || v.status === statusFilter;
		const matchesType = !typeFilter || v.vehicleType === typeFilter;
		const matchesSearch =
			!searchTerm ||
			v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesStatus && matchesType && matchesSearch;
	});

	const handleViewDetails = (vehicle: Vehicle) => {
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
							licensePlate: updated.numberPlate || v.licensePlate,
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
							licensePlate: updated.numberPlate || v.licensePlate,
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

	return (
		<Box sx={{ p: 3 }}>
			<Typography
				variant="h4"
				sx={{ fontWeight: "bold", color: "#2E7D32", mb: 3 }}
			>
				Vehicle List
			</Typography>

			<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => navigate("/dashboard/vehicle/create")}
				>
					Add Vehicle
				</Button>
			</Box>

			<Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
				<FormControl size="small" sx={{ minWidth: 150 }}>
					<InputLabel>Status</InputLabel>
					<Select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
					>
						<MenuItem value="">All</MenuItem>
						<MenuItem value="Hoạt động">Active</MenuItem>
						<MenuItem value="Standby">Standby</MenuItem>
						<MenuItem value="In Progress">In Progress</MenuItem>
					</Select>
				</FormControl>
				<FormControl size="small" sx={{ minWidth: 150 }}>
					<InputLabel>Type</InputLabel>
					<Select
						value={typeFilter}
						onChange={(e) => setTypeFilter(e.target.value)}
					>
						<MenuItem value="">All</MenuItem>
						<MenuItem value="Limousine 9 chỗ">
							Limousine 9 chỗ
						</MenuItem>
						<MenuItem value="Ghế ngồi 16 chỗ">
							Ghế ngồi 16 chỗ
						</MenuItem>
						<MenuItem value="Ghế ngồi 29 chỗ">
							Ghế ngồi 29 chỗ
						</MenuItem>
						<MenuItem value="Giường nằm 44 chỗ (2 tầng)">
							Giường nằm 44 chỗ (2 tầng)
						</MenuItem>
						<MenuItem value="Giường nằm 34 chỗ (VIP)">
							Giường nằm 34 chỗ (VIP)
						</MenuItem>
					</Select>
				</FormControl>
				<TextField
					size="small"
					placeholder="Search"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
					}}
				/>
			</Box>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
							<TableCell>Name</TableCell>
							<TableCell>License Plate</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Vehicle Type</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredVehicles
							.slice(
								page * rowsPerPage,
								page * rowsPerPage + rowsPerPage
							)
							.map((vehicle) => (
								<TableRow key={vehicle.id} hover>
									<TableCell>{vehicle.name}</TableCell>
									<TableCell>
										{vehicle.licensePlate}
									</TableCell>
									<TableCell>
										<Chip
											label={vehicle.status}
											color={
												getStatusColor(
													vehicle.status
												) as
													| "success"
													| "warning"
													| "info"
													| "default"
											}
											size="small"
										/>
									</TableCell>
									<TableCell>{vehicle.vehicleType}</TableCell>
									<TableCell>
										<IconButton
											size="small"
											onClick={() =>
												handleViewDetails(vehicle)
											}
											title="View Details"
										>
											<VisibilityIcon />
										</IconButton>
										<IconButton
											size="small"
											color="error"
											onClick={() => {
												const detail =
													vehicleDetails.find(
														(v) =>
															v.id === vehicle.id
													);
												if (detail)
													handleOpenDelete(detail);
											}}
											title="Delete Vehicle"
										>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</TableContainer>

			<TablePagination
				component="div"
				count={filteredVehicles.length}
				page={page}
				onPageChange={(_e, newPage) => setPage(newPage)}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={(e) =>
					setRowsPerPage(Number(e.target.value))
				}
				rowsPerPageOptions={[5, 10, 20, 50]}
			/>

			<VehicleDetailsDrawer
				open={drawerOpen}
				onClose={handleCloseDrawer}
				vehicle={selectedVehicle}
				onEdit={handleOpenEdit}
			/>

			{editOpen && (
				<EditVehicleForm
					open={editOpen}
					vehicle={selectedVehicle}
					onClose={() => setEditOpen(false)}
					onSave={handleSaveEdit}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
				<DialogTitle>Delete Vehicle</DialogTitle>
				<DialogContent>
					Are you sure you want to delete{" "}
					<strong>{vehicleToDelete?.name}</strong>?
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
					<Button color="error" onClick={handleConfirmDelete}>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default VehicleList;
