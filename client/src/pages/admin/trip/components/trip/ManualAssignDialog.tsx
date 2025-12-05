import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	List,
	ListItem,
	ListItemButton,
	ListItemAvatar,
	Avatar,
	ListItemText,
	Typography,
	CircularProgress,
	InputAdornment,
	Box,
	Snackbar,
	Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/api";
import type { Driver } from "@my-types/driver";

interface ManualAssignDialogProps {
	open: boolean;
	tripId: number | null;
	onClose: () => void;
	onAssignSuccess: () => void;
}

const ManualAssignDialog: React.FC<ManualAssignDialogProps> = ({
	open,
	tripId,
	onClose,
	onAssignSuccess,
}) => {
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedDriverId, setSelectedDriverId] = useState<number | null>(
		null
	);
	const [assigning, setAssigning] = useState(false);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });

	const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

	useEffect(() => {
		if (open) {
			fetchDrivers();
			setSelectedDriverId(null);
			setSearch("");
		}
	}, [open]);

	const fetchDrivers = async () => {
		setLoading(true);
		try {
			const { data, status } = await callApi(
				{
					method: "GET",
					url: API_ENDPOINTS.DRIVER.BASE,
					params: { limit: 100, status: "ACTIVE" }, // Fetch active drivers
				},
				{ returnFullResponse: true }
			);

			if (status === 200) {
				if (data.rows) {
					setDrivers(data.rows);
				} else if (Array.isArray(data)) {
					setDrivers(data);
				} else if (data.data) {
					setDrivers(data.data);
				}
			}
		} catch (error) {
			console.error("Failed to fetch drivers", error);
			setSnackbar({
				open: true,
				message: "Failed to load drivers.",
				severity: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleAssign = async () => {
		if (!tripId || !selectedDriverId) return;

		setAssigning(true);
		try {
			const url = API_ENDPOINTS.TRIP.ASSIGN_DRIVER(tripId);
			const { status, data } = await callApi(
				{
					method: "POST",
					url: url,
					data: { driverId: selectedDriverId },
				},
				{ returnFullResponse: true }
			);

			if (status === 200) {
				setSnackbar({
					open: true,
					message: "Driver assigned successfully!",
					severity: "success",
				});
				onAssignSuccess();
				onClose();
			} else {
				setSnackbar({
					open: true,
					message: data.message || "Failed to assign driver.",
					severity: "error",
				});
			}
		} catch (error: any) {
			console.error("Assignment error", error);
			setSnackbar({
				open: true,
				message:
					error.response?.data?.message || "Failed to assign driver.",
				severity: "error",
			});
		} finally {
			setAssigning(false);
		}
	};

	const filteredDrivers = drivers.filter((d) =>
		(d.fullname || "").toLowerCase().includes(search.toLowerCase())
	);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Manual Driver Assignment</DialogTitle>
			<DialogContent dividers>
				<Box mb={2}>
					<TextField
						fullWidth
						placeholder="Search driver..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
							},
						}}
						size="small"
					/>
				</Box>

				{loading ? (
					<Box display="flex" justifyContent="center" p={3}>
						<CircularProgress />
					</Box>
				) : (
					<List sx={{ maxHeight: 300, overflow: "auto" }}>
						{filteredDrivers.length === 0 ? (
							<Typography
								align="center"
								color="textSecondary"
								py={2}
							>
								No active drivers found.
							</Typography>
						) : (
							filteredDrivers.map((driver) => (
								<ListItem key={driver.id} disablePadding>
									<ListItemButton
										selected={
											selectedDriverId === driver.id
										}
										onClick={() =>
											setSelectedDriverId(driver.id)
										}
									>
										<ListItemAvatar>
											<Avatar src={driver.avatar || ""}>
												<PersonIcon />
											</Avatar>
										</ListItemAvatar>
										<ListItemText
											primary={driver.fullname}
											secondary={
												driver.licenseNumber
													? `License: ${driver.licenseNumber}`
													: "No License Info"
											}
										/>
									</ListItemButton>
								</ListItem>
							))
						)}
					</List>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color="inherit">
					Cancel
				</Button>
				<Button
					onClick={handleAssign}
					variant="contained"
					disabled={!selectedDriverId || assigning}
				>
					{assigning ? "Assigning..." : "Assign"}
				</Button>
			</DialogActions>
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
		</Dialog>
	);
};

export default ManualAssignDialog;
