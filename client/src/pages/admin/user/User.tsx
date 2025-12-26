import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
	Paper,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	InputAdornment,
	IconButton,
	Avatar,
	Chip,
	Typography,
	Stack,
	Alert,
	Button,
	Snackbar,
} from "@mui/material";
import {
	Error as ErrorIcon,
	Search as SearchIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	Add as AddIcon,
	Refresh as RefreshIcon,
} from "@mui/icons-material";

import {
	DataGrid,
	type GridColDef,
	type GridRenderCellParams,
} from "@mui/x-data-grid";
import { DataGridPageLayout } from "@components/admin";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import type { Role, User } from "@my-types/user";
import buildImgUrl from "@utils/imageHelper";
import {
	InfoDrawer,
	DeleteUserConfirm,
	UserForm,
} from "./components";
import { useAdminRealtime } from "@hooks/useAdminRealtime";

const UserPage: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	// UI States
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [formOpen, setFormOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });

	const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

	// Helper to get initials
	const getInitials = (name: string) => {
		return name
			? name
					.split(" ")
					.map((n) => n[0])
					.join("")
					.toUpperCase()
					.slice(0, 2)
			: "U";
	};

	// Filter users based on search and role
	const filteredUsers = useMemo(() => {
		return users.filter((u) => {
			const matchesRole = roleFilter === "all" || u.role === roleFilter;
			const term = searchTerm.toLowerCase();
			const matchesSearch =
				!term ||
				u.fullName.toLowerCase().includes(term) ||
				u.email.toLowerCase().includes(term) ||
				(u.phoneNumber && u.phoneNumber.includes(term)) ||
				u.userName.toLowerCase().includes(term);

			return matchesRole && matchesSearch;
		});
	}, [users, roleFilter, searchTerm]);

	// Handlers
	const handleViewDetails = (user: User) => {
		setSelectedUser(user);
		setDrawerOpen(true);
	};

	const handleOpenEdit = (user: User) => {
		setSelectedUser(user);
		setFormOpen(true);
	};

	const handleOpenAdd = () => {
		setSelectedUser(null);
		setFormOpen(true);
	};

	const handleCloseForm = () => {
		setFormOpen(false);
		setSelectedUser(null);
	};

	const handleOpenDelete = (user: User) => {
		setSelectedUser(user);
		setDeleteOpen(true);
	};

	const handleCloseDelete = () => {
		setDeleteOpen(false);
		setSelectedUser(null);
	};

	const handleCloseDrawer = () => {
		setDrawerOpen(false);
		setSelectedUser(null);
	};

	// DataGrid Columns
	const columns: GridColDef[] = [
		{ field: "id", headerName: "ID", width: 70 },
		{
			field: "fullName",
			headerName: "Full Name",
			flex: 1,
			minWidth: 195,
			renderCell: (params: GridRenderCellParams<User>) => (
				<Stack direction={"row"} alignItems={"center"} paddingX={0.5}>
					<Avatar
						src={buildImgUrl(params.row.avatar) || undefined}
						sx={{
							width: 48,
							height: 48,
							fontSize: 12,
							fontWeight: 600,
							bgcolor: "#e3f2fd",
							color: "#1565c0",
							marginRight: 1,
						}}
					>
						{getInitials(params.row.fullName)}
					</Avatar>
					<Box my={1}>
						<Typography variant="body2">{params.value}</Typography>
						<Stack
							direction="row"
							spacing={1}
							alignItems="center"
							my={0.5}
						>
							<Chip
								label={
									params.row.emailConfirmed
										? "Verified"
										: "Unverified"
								}
								size="small"
								color={
									params.row.emailConfirmed
										? "success"
										: "warning"
								}
								variant="outlined"
								sx={{ height: 24 }}
							/>

							<Chip
								label={params.row.role}
								size="small"
								sx={{
									bgcolor:
										params.value === "Admin"
											? "#f3e5f5"
											: "#e3f2fd",
									color:
										params.value === "Admin"
											? "#7b1fa2"
											: "#1565c0",
									fontWeight: 500,
								}}
							/>
						</Stack>
					</Box>
				</Stack>
			),
		},
		{
			field: "userName",
			headerName: "Username",
			flex: 1,
			minWidth: 120,
		},
		{
			field: "email",
			headerName: "Email",
			flex: 1.5,
			minWidth: 220,
		},
		{
			field: "phoneNumber",
			headerName: "Phone",
			flex: 1,
			minWidth: 90,
			width: 120,
			maxWidth: 140,
			valueFormatter: (value: string | null) => value || "N/A",
		},
		{
			field: "createdAt",
			headerName: "Joined",
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
			field: "updatedAt",
			headerName: "Last Updated",
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
				const user = params.row as User;
				return (
					<Box onClick={(e) => e.stopPropagation()}>
						<IconButton
							size="small"
							color="primary"
							onClick={(e) => {
								e.stopPropagation();
								handleOpenEdit(user);
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
								handleOpenDelete(user);
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

	const fetchUsers = React.useCallback(async () => {
		setLoading(true);
		try {
			// Matches admin GET /admin/users
			const res = await callApi<{ users: User[] }>({
				method: "GET",
				url: API_ENDPOINTS.ADMIN.BASE,
			});

			if (res) {
				// Normalize different possible response envelopes and extract users array
				const usersPayload =
					// direct shape: { users: User[] }
					(res as any).users ??
					// common envelope: { data: { users: User[] } }
					(res as any).data?.users ??
					// alternative envelope: { payload: { users: User[] } }
					(res as any).payload?.users ??
					// fallback if the response itself is the array
					(res as any);

				setUsers(Array.isArray(usersPayload) ? usersPayload : []);
			}
		} catch (err: any) {
			console.error("Failed to fetch users:", err);
			setErrorMessage(
				err.message ?? "Failed to load users. Please try again."
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	useAdminRealtime({
		entity: "user",
		onRefresh: fetchUsers,
		onNotify: (message, severity) =>
			setSnackbar({
				open: true,
				message,
				severity: severity || "info",
			}),
	});

	return (
		<DataGridPageLayout
			title="User Management"
			actionBar={
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
					<Button
						variant="contained"
						className="hvr-icon-pop"
						startIcon={<AddIcon className="hvr-icon" />}
						onClick={() => handleOpenAdd()}
						sx={{ textTransform: "none", fontWeight: "bold" }}
					>
						Add User
					</Button>
					<IconButton
						color="primary"
						onClick={fetchUsers}
						title="Refresh"
					>
						<RefreshIcon />
					</IconButton>
					{/* Role Filter */}
					<FormControl size="small" sx={{ minWidth: 150 }}>
						<InputLabel>Role</InputLabel>
						<Select
							value={roleFilter}
							label="Role"
							onChange={(e) =>
								setRoleFilter(e.target.value as any)
							}
						>
							<MenuItem value="all">All Roles</MenuItem>
							<MenuItem value="Admin">Admin</MenuItem>
							<MenuItem value="User">User</MenuItem>
						</Select>
					</FormControl>

					{/* Search Field */}
					<TextField
						size="small"
						placeholder="Search by name, email..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
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
			}
		>
			{errorMessage && <Alert icon={<ErrorIcon />}></Alert>}
			<Paper elevation={3} sx={{ width: "100%", overflow: "hidden" }}>
				<DataGrid
					rows={filteredUsers}
					columns={columns}
					loading={loading}
					rowHeight={68}
					pagination
					initialState={{
						pagination: {
							paginationModel: { pageSize: 10, page: 0 },
						},
						sorting: {
							sortModel: [{ field: "fullName", sort: "asc" }],
						},
					}}
					onRowClick={(params) => handleViewDetails(params.row)}
					pageSizeOptions={[5, 10, 20, 50]}
					sx={{
						border: "none",
						"& .MuiDataGrid-columnHeaders": {
							bgcolor: "#f5f5f5",
						},
					}}
					disableRowSelectionOnClick
				/>
			</Paper>

			{selectedUser && (
				<>
					<DeleteUserConfirm
						open={deleteOpen}
						user={selectedUser}
						onClose={handleCloseDelete}
						onDeleted={(id, message) => {
							setUsers((u) => u.filter((x) => x.id !== id));
							setDeleteOpen(false);
							if (message) {
								setSnackbar({
									open: true,
									message,
									severity: "success",
								});
							}
						}}
					/>
					<InfoDrawer
						user={selectedUser}
						open={drawerOpen}
						onClose={handleCloseDrawer}
						onDelete={(id, message) => {
							setUsers((u) => u.filter((x) => x.id !== id));
							setDeleteOpen(false);
							if (message) {
								setSnackbar({
									open: true,
									message,
									severity: "success",
								});
							}
						}}
						onEdit={(updated) => {
							setUsers((u) =>
								u.map((x) =>
									x.id === updated.id ? updated : x
								)
							);
							setFormOpen(false);
						}}
					/>
				</>
			)}

			<UserForm
				open={formOpen}
				initialData={selectedUser}
				onClose={handleCloseForm}
				onSaved={(saved, message) => {
					if (selectedUser) {
						setUsers((u) =>
							u.map((x) => (x.id === saved.id ? saved : x))
						);
					} else {
						setUsers((u) => [saved, ...u]);
					}
					setFormOpen(false);
					if (message) {
						setSnackbar({
							open: true,
							message,
							severity: "success",
						});
					}
				}}
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

export default UserPage;
