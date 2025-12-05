import React, { useEffect, useState, useCallback } from "react";
import {
	Box,
	Button,
	Paper,
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
import type { VehicleType } from "@my-types/vehicleType";
import VehicleTypeDetailsDrawer from "./VehicleTypeDetailsDrawer";
import DeleteVehicleTypeDialog from "./DeleteVehicleTypeDialog";
import VehicleTypeForm from "./VehicleTypeForm";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { useAdminRealtime } from "@hooks/useAdminRealtime";

const VehicleTypeList: React.FC = () => {
	const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
	const [selectedVehicleType, setSelectedVehicleType] =
		useState<VehicleType | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [formOpen, setFormOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [vehicleTypeToDelete, setVehicleTypeToDelete] =
		useState<VehicleType | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });

	const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	const fetchVehicleTypes = useCallback(async () => {
		try {
			// const response = await axios.get(API_ENDPOINTS.VEHICLE_TYPE.BASE);
			const response = await callApi(
				{ method: "GET", url: API_ENDPOINTS.VEHICLE_TYPE.BASE },
				{ returnFullResponse: true }
			);

			// Broaden check or handle errors
			if (
				(response.status >= 200 && response.status < 300) ||
				response.status === 304
			) {
				setVehicleTypes(response.data);
			} else {
				console.warn("API returned non-success status:", status);
			}
		} catch (error) {
			console.error("3. API Crash:", error);
		}
	}, []);

	useEffect(() => {
		fetchVehicleTypes();
	}, [fetchVehicleTypes]);

	useAdminRealtime({
		entity: "vehicleType",
		onRefresh: fetchVehicleTypes,
		onNotify: (message, severity) =>
			setSnackbar({
				open: true,
				message,
				severity: severity || "info",
			}),
	});

	// Filter vehicle types based on search term
	const filteredVehicleTypes = vehicleTypes.filter((vt) =>
		vt.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleViewDetails = (vehicleType: VehicleType) => {
		setSelectedVehicleType(vehicleType);
		setDrawerOpen(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpen(false);
		setSelectedVehicleType(null);
	};

	const handleOpenCreate = () => {
		setSelectedVehicleType(null);
		setFormOpen(true);
	};

	const handleOpenEdit = (vehicleType: VehicleType) => {
		setSelectedVehicleType(vehicleType);
		setFormOpen(true);
	};

	const handleSaved = (savedData: any) => {
		if (selectedVehicleType) {
			setVehicleTypes((prev) =>
				prev.map((vt) =>
					vt.id === savedData.id ? { ...vt, ...savedData } : vt
				)
			);
		} else {
			setVehicleTypes((prev) => [...prev, savedData]);
		}
		setFormOpen(false);
		setSelectedVehicleType(null);
	};

	const handleOpenDelete = (vehicleType: VehicleType) => {
		setVehicleTypeToDelete(vehicleType);
		setDeleteOpen(true);
	};

	const handleCloseDelete = () => {
		setDeleteOpen(false);
		setVehicleTypeToDelete(null);
	};

	const handleConfirmDelete = () => {
		if (!vehicleTypeToDelete) return;
		setVehicleTypes((prev) =>
			prev.filter((vt) => vt.id !== vehicleTypeToDelete.id)
		);
		setDeleteOpen(false);
		setVehicleTypeToDelete(null);
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
			field: "name",
			headerName: "Name",
			flex: 1,
			minWidth: 150,
		},
		{
			field: "price",
			headerName: "Base Fare",
			width: 150,
			renderCell: (params) => formatCurrency(params.value as number),
		},
		{
			field: "totalSeats",
			headerName: "Total Seats",
			width: 120,
		},
		{
			field: "totalFloors",
			headerName: "Total Flooring",
			width: 130,
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
			width: 150,
			sortable: false,
			renderCell: (params) => {
				const vehicleType = params.row as VehicleType;
				return (
					<Box onClick={(e) => e.stopPropagation()}>
						<IconButton
							size="small"
							color="primary"
							onClick={(e) => {
								e.stopPropagation();
								handleOpenEdit(vehicleType);
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
								handleOpenDelete(vehicleType);
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
			title="Vehicle Type Management"
			actionBar={
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleOpenCreate}
					>
						Add New Type
					</Button>
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
						sx={{ minWidth: 200 }}
					/>
				</Box>
			}
		>
			<Paper elevation={3} sx={{ width: "100%" }}>
				<DataGrid
					rows={filteredVehicleTypes}
					columns={columns}
					rowHeight={35}
					pagination
					initialState={{
						pagination: {
							paginationModel: { pageSize: 10, page: 0 },
						},
					}}
					pageSizeOptions={[5, 10, 25, 50]}
					sx={{ border: "none" }}
					onRowClick={(params) =>
						handleViewDetails(params.row as VehicleType)
					}
				/>
			</Paper>

			{/* Dialogs and Drawers */}
			<VehicleTypeDetailsDrawer
				open={drawerOpen}
				onClose={handleCloseDrawer}
				vehicleType={selectedVehicleType}
				onEdit={handleOpenEdit}
				onDelete={handleOpenDelete}
			/>

			<DeleteVehicleTypeDialog
				open={deleteOpen}
				onClose={handleCloseDelete}
				onConfirm={handleConfirmDelete}
				id={vehicleTypeToDelete?.id}
			/>

			<VehicleTypeForm
				open={formOpen}
				onClose={() => {
					setFormOpen(false);
					setSelectedVehicleType(null);
				}}
				onSaved={handleSaved}
				initialData={selectedVehicleType}
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

export default VehicleTypeList;
