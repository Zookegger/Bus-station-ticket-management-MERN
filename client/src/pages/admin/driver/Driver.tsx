import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
	Typography,
	Paper,
	TextField,
	Drawer,
	Stack,
	Chip,
	Avatar,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	InputAdornment,
	Alert,
} from "@mui/material";
import { type Driver, DriverStatus } from "@my-types/driver";
import { callApi } from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { DriverForm, DriverDetails } from "./components";
import { DataGridPageLayout } from "@components/admin";
import {
	DataGrid,
	type GridColDef,
	type GridRenderCellParams,
} from "@mui/x-data-grid";
import {
	Add as AddIcon,
	Error as ErrorIcon,
	Search as SearchIcon,
} from "@mui/icons-material";

const Driver: React.FC = () => {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | DriverStatus>(
		"all"
	);
	const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
	const [dataVersion, setDataVersion] = useState(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [fetchError, setFetchError] = useState<string | null>(null);

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();
		return drivers.filter((d) => {
			const matchesSearch =
				!term ||
				[
					d.fullname ?? "",
					d.phoneNumber ?? "",
					d.licenseNumber ?? "",
					d.licenseCategory ?? "",
					d.dateOfBirth ?? "",
				].some((f) => String(f).toLowerCase().includes(term));
			const rowStatus =
				d.status ??
				(d.isSuspended
					? DriverStatus.SUSPENDED
					: d.isActive
					? DriverStatus.ACTIVE
					: DriverStatus.INACTIVE);
			const matchesStatus =
				statusFilter === "all" || rowStatus === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [search, statusFilter, dataVersion, drivers]);

	const visibleRows = filtered;

	const getInitials = (name: string) =>
		name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);

	const columns: GridColDef[] = [
		{
			field: "id",
			headerName: "ID",
			width: 30,
		},
		{
			field: "fullName",
			headerName: "Driver",
			flex: 1.2,
			minWidth: 200,
			renderCell: (params: GridRenderCellParams<Driver>) => {
				return (
					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
						justifyContent={"flex-start"}
						height={"100%"}
					>
						<Avatar
							sx={{
								width: 32,
								height: 32,
								fontSize: 14,
								fontWeight: 600,
							}}
						>
							{getInitials(params.row.fullname ?? "")}
						</Avatar>
						<Box>
							<Typography
								variant="body2"
								sx={{ fontWeight: 500 }}
							>
								{params.row.fullname}
							</Typography>
							<Stack
								direction="row"
								spacing={0.5}
								sx={{ mt: 0.5 }}
							>
								<Chip
									label={params.row.licenseCategory ?? "—"}
									size="small"
									sx={{ height: 20, fontSize: 11 }}
								/>
								<Chip
									label={
										params.row.status ??
										(params.row.isSuspended
											? "Suspended"
											: params.row.isActive
											? "Active"
											: "Inactive")
									}
									size="small"
									color={
										params.row.status ===
										DriverStatus.SUSPENDED
											? "error"
											: params.row.status ===
											  DriverStatus.ACTIVE
											? "success"
											: "warning"
									}
									sx={{
										height: 20,
										fontSize: 11,
										fontWeight: "bold",
									}}
								/>
							</Stack>
						</Box>
					</Stack>
				);
			},
		},
		{
			field: "phoneNumber",
			headerName: "Phone",
			flex: 0.9,
			minWidth: 120,
			valueGetter: (value) => value ?? "N/A",
		},
		{
			field: "licenseNumber",
			headerName: "License #",
			flex: 1,
			minWidth: 120,
			valueGetter: (value) => value ?? "N/A",
		},
		{
			field: "hiredAt",
			headerName: "Hired",
			width: 120,
			valueFormatter: (value: string | Date) =>
				value ? new Date(value).toLocaleDateString() : "—",
		},
		{
			field: "dateOfBirth",
			headerName: "DOB",
			width: 120,
			valueFormatter: (value: string | Date) =>
				value ? new Date(value).toLocaleDateString() : "—",
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
	];

	const actionBar = (
		<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
			<Button
				onClick={() => {
					setEditingDriver(null);
					setDialogOpen(true);
				}}
				variant="contained"
				className="hvr-icon-pop"
				sx={{ textTransform: "none", fontWeight: "bold" }}
				startIcon={<AddIcon className="hvr-icon" />}
			>
				Add Driver
			</Button>
			<FormControl size="small" sx={{ minWidth: 140 }}>
				<InputLabel>Status</InputLabel>
				<Select
					value={statusFilter}
					label="Status"
					onChange={(e) => setStatusFilter(e.target.value as any)}
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
				value={search}
				onChange={(e) => setSearch(e.target.value)}
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

	const openDetails = (driver: Driver) => {
		setSelectedDriver(driver);
		setDrawerOpen(true);
	};

	// Fetch drivers from API
	useEffect(() => {
		let mounted = true;
		const fetchDrivers = async () => {
			setIsLoading(true);
			setFetchError(null);
			try {
				const data = await callApi<Driver[]>({
					method: "GET",
					url: API_ENDPOINTS.DRIVER.BASE,
				});
				if (mounted) setDrivers((data as Driver[]) ?? []);
			} catch (err: any) {
				setFetchError(err?.message || "Failed to load drivers");
			} finally {
				if (mounted) setIsLoading(false);
			}
		};

		fetchDrivers();

		return () => {
			mounted = false;
		};
	}, [dataVersion]);

	return (
		<DataGridPageLayout title={`Driver Management`} actionBar={actionBar}>
			{fetchError && (
				<Alert color="error" icon={<ErrorIcon />}>
					{fetchError}
				</Alert>
			)}

			<Paper elevation={3} sx={{ width: "100%" }}>
				<DataGrid
					rows={visibleRows}
					columns={columns}
					onRowClick={(e) => {
						const id = Number(e.id);
						const driver = visibleRows.find((d) => d.id === id);
						if (driver) openDetails(driver);
					}}
					rowHeight={56}
					loading={isLoading}
					pagination
					slotProps={{
						pagination: {
							labelRowsPerPage: "Rows per page:",
						},
					}}
					sx={{ maxWidth: "100%" }}
				/>
			</Paper>

			<Drawer
				anchor="right"
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				slotProps={{
					paper: { sx: { width: { xs: 360, sm: 420, md: 560 } } },
				}}
			>
				{selectedDriver && (
					<DriverDetails
						driver={selectedDriver}
						onClose={() => setDrawerOpen(false)}
						onEdit={(d) => {
							setEditingDriver(d);
							setDialogOpen(true);
							setDrawerOpen(false);
						}}
					/>
				)}
			</Drawer>

			<DriverForm
				open={dialogOpen}
				onClose={() => {
					setDialogOpen(false);
					setEditingDriver(null);
				}}
				initialData={editingDriver ?? undefined}
				onSaved={() => setDataVersion((v) => v + 1)}
			/>
		</DataGridPageLayout>
	);
};

export default Driver;
