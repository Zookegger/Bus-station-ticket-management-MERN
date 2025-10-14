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
// import type { UpdateVehicleDTO } from "@my-types/vehicle";
import type { VehicleWithType, VehicleDetail } from "@my-types/vehicleList";
import VehicleDetailsDrawer from "./VehicleDetailsDrawer";
import EditVehicleForm from "./EditVehicleForm";
import type { UpdateVehicleDTO } from "@my-types/vehicle";

const VehicleList: React.FC = () => {
	const navigate = useNavigate();
	const [vehicles, setVehicles] = useState<VehicleWithType[]>([]);
	const [vehicleDetails, setVehicleDetails] = useState<VehicleDetail[]>([]);
	const [selectedVehicle, setSelectedVehicle] = useState<VehicleDetail | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [vehicleToDelete, setVehicleToDelete] = useState<VehicleDetail | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState("");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const filteredVehicles = vehicles.filter((v) => {
		const matchesType = !typeFilter || v.vehicleType.name === typeFilter;
		const displayName = v.manufacturer && v.model 
			? `${v.manufacturer} ${v.model}` 
			: v.numberPlate;
		const matchesSearch =
			!searchTerm ||
			displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			v.numberPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
			v.vehicleType.name.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesType && matchesSearch;
	});

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
							.map((vehicle) => {
								const displayName = vehicle.manufacturer && vehicle.model 
									? `${vehicle.manufacturer} ${vehicle.model}` 
									: `Vehicle ${vehicle.id}`;
								return (
									<TableRow key={vehicle.id} hover>
										<TableCell>{displayName}</TableCell>
										<TableCell>{vehicle.numberPlate}</TableCell>
										<TableCell>{vehicle.vehicleType.name}</TableCell>
										<TableCell>
											<IconButton
												size="small"
												onClick={() => handleViewDetails(vehicle)}
												title="View Details"
											>
												<VisibilityIcon />
											</IconButton>
											<IconButton
												size="small"
												color="error"
												onClick={() => {
													const detail = vehicleDetails.find(
														(v) => v.id === vehicle.id
													);
													if (detail) handleOpenDelete(detail);
												}}
												title="Delete Vehicle"
											>
												<DeleteIcon />
											</IconButton>
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>			<TablePagination
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

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
				<DialogTitle>Delete Vehicle</DialogTitle>
				<DialogContent>
					Are you sure you want to delete{" "}
					<strong>
						{vehicleToDelete 
							? (vehicleToDelete.displayName || vehicleToDelete.numberPlate)
							: "this vehicle"
						}
					</strong>?
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
