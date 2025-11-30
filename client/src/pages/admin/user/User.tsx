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
} from "@mui/material";
import {
	Error as ErrorIcon,
	Search as SearchIcon,
	Visibility as VisibilityIcon,
} from "@mui/icons-material";

import {
	DataGrid,
	type GridColDef,
	type GridRenderCellParams,
} from "@mui/x-data-grid";
import { DataGridPageLayout } from "@components/admin";
import callApi from "@utils/apiCaller";
import type { Role, User } from "@my-types/user";
import buildAvatarUrl from "@utils/avatarImageHelper";
import { InfoDrawer } from "./components";

const UserPage: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	// UI States
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

	const handleCloseDrawer = () => {
		setDrawerOpen(false);
		setSelectedUser(null);
	};

	// DataGrid Columns
	const columns: GridColDef[] = [
		{
			field: "fullName",
			headerName: "Full Name",
			flex: 1,
			minWidth: 195,
			renderCell: (params: GridRenderCellParams<User>) => (
				<Stack direction={"row"} alignItems={"center"} paddingX={0.5}>
					<Avatar
						src={buildAvatarUrl(params.row.avatar) || undefined}
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
			width: 80,
			sortable: false,
			renderCell: (params: GridRenderCellParams<User>) => (
				<IconButton
					size="small"
					color="primary"
					onClick={(e) => {
						e.stopPropagation();
						handleViewDetails(params.row);
					}}
					title="View Details"
				>
					<VisibilityIcon fontSize="small" />
				</IconButton>
			),
		},
	];

	useEffect(() => {
		const fetchUsers = async () => {
			setLoading(true);
			try {
				// Matches GET /users in userRouter.ts
				const res = await callApi<{ users: User[] }>({
					method: "GET",
					url: "/users",
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
		};

		fetchUsers();
	}, []);

	return (
		<DataGridPageLayout
			title="User Management"
			actionBar={
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
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
				<InfoDrawer
					user={selectedUser}
					open={drawerOpen}
					handleClose={handleCloseDrawer}
				/>
			)}
		</DataGridPageLayout>
	);
};

export default UserPage;
