import React from "react";
import {
	Box,
	Typography,
	Avatar,
	Chip,
	Stack,
	Paper,
	Divider,
	Button,
	Card,
	Drawer,
	CardActions,
	CardHeader,
	IconButton,
	CardContent,
} from "@mui/material";
import {
	MailOutlineRounded,
	PhoneIphoneRounded,
	HomeRounded,
	EventRounded,
	BadgeRounded,
	CalendarTodayRounded,
	ArrowBack,
	Delete,
	Edit,
} from "@mui/icons-material";
import { DriverStatus, type Driver } from "@my-types/driver";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { formatDateDisplay, formatCurrency } from "@utils/formatting";

const currency = (v: number) => formatCurrency(v, "VND", "vi-VN");

const getInitials = (name: string) =>
	name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

interface DriverDetailsProps {
	driver: Driver;
	open: boolean;
	onClose: () => void;
	onEdit: (driver: Driver) => void;
}

const DriverDetails: React.FC<DriverDetailsProps> = ({
	open,
	driver,
	onClose,
	onEdit,
}) => {
	const statusLabel =
		driver.status === DriverStatus.SUSPENDED
			? "Suspended"
			: driver.status === DriverStatus.INACTIVE
			? "Inactive"
			: "Active";

	const statusChipColor: "error" | "success" | "warning" =
		driver.status === DriverStatus.SUSPENDED
			? "error"
			: driver.status === DriverStatus.ACTIVE
			? "success"
			: "warning";

	const handleDelete = async () => {
		if (
			!confirm(
				"Are you sure you want to delete this driver? This action cannot be undone."
			)
		)
			return;
		try {
			await callApi({
				method: "DELETE",
				url: API_ENDPOINTS.DRIVER.DELETE((driver as any).id),
			});
			onClose();
		} catch (err) {
			console.error("Delete driver failed", err);
			alert("Failed to delete driver");
		}
	};
	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={() => onClose}
			slotProps={{
				paper: {
					sx: { width: 450 },
				},
			}}
			sx={{
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Card
				sx={{
					display: "flex",
					flexDirection: "column",
					flex: 1,
				}}
			>
				<CardHeader
					title={
						<Typography
							variant="h5"
							fontWeight="bold"
							color="primary.main"
							alignSelf={"center"}
						>
							Driver Details
						</Typography>
					}
					action={
						<IconButton
							onClick={onClose}
							className="hvr-icon-back"
							size="large"
						>
							<ArrowBack className="hvr-icon" />
						</IconButton>
					}
					sx={{
						p: 2,
						borderBottom: "1px solid",
						borderColor: "divider",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						bgcolor: "background.paper",
					}}
				/>

				<CardContent
					sx={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
				>
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
						sx={{ mb: 2 }}
					>
						<Avatar
							sx={{
								width: 56,
								height: 56,
								fontSize: 20,
								fontWeight: 600,
								bgcolor: "#e3f2fd",
								color: "#1565c0",
							}}
						>
							{getInitials(driver.fullname ?? "")}
						</Avatar>
						<Box>
							<Typography
								sx={{ fontWeight: 700, fontSize: "1.1rem" }}
							>
								{driver.fullname}
							</Typography>
							<Stack
								direction="row"
								spacing={1}
								alignItems="center"
							>
								<Chip
									size="small"
									label={statusLabel}
									color={statusChipColor}
									slotProps={{
										label: {
											sx: {
												fontWeight: "bold",
											},
										},
									}}
								/>
							</Stack>
						</Box>
					</Stack>

					{/* Thông tin cá nhân */}
					<Paper variant="outlined" sx={{ mb: 2 }}>
						<Box sx={{ p: 1.5, background: "#e3f2fd" }}>
							<Typography sx={{ fontWeight: 700 }}>
								Personal information
							</Typography>
						</Box>
						<Box sx={{ p: 2 }}>
							<Stack spacing={1.5}>
								<Stack
									direction="row"
									spacing={1.5}
									alignItems="center"
								>
									<EventRounded fontSize="small" />
									<Typography variant="body2">
										Date of Birth:{" "}
										{formatDateDisplay(driver.dateOfBirth)}
									</Typography>
								</Stack>
								<Stack
									direction="row"
									spacing={1.5}
									alignItems="center"
								>
									<HomeRounded fontSize="small" />
									<Typography variant="body2">
										Address: {driver.address ?? "—"}
									</Typography>
								</Stack>
							</Stack>
						</Box>
					</Paper>

					{/* Liên hệ */}
					<Paper variant="outlined" sx={{ mb: 2 }}>
						<Box sx={{ p: 1.5, background: "#e3f2fd" }}>
							<Typography sx={{ fontWeight: 700 }}>
								Liên hệ
							</Typography>
						</Box>
						<Box sx={{ p: 2 }}>
							<Stack spacing={1.5}>
								<Stack
									direction="row"
									spacing={1.5}
									alignItems="center"
								>
									<PhoneIphoneRounded fontSize="small" />
									<Typography variant="body2">
										Phone: {driver.phoneNumber ?? "—"}
									</Typography>
								</Stack>
								<Stack
									direction="row"
									spacing={1.5}
									alignItems="center"
								>
									<MailOutlineRounded fontSize="small" />
									<Typography variant="body2">
										Email: {driver.email}
									</Typography>
								</Stack>
							</Stack>
						</Box>
					</Paper>

					{/* Bằng lái */}
					<Paper variant="outlined" sx={{ mb: 2 }}>
						<Box sx={{ p: 1.5, background: "#e3f2fd" }}>
							<Typography sx={{ fontWeight: 700 }}>
								Driver's License
							</Typography>
						</Box>
						<Box sx={{ p: 2 }}>
							<Stack spacing={1.5}>
								<Stack
									direction="row"
									spacing={1.5}
									alignItems="center"
								>
									<BadgeRounded fontSize="small" />
									<Typography variant="body2">
										License Number:{" "}
										{driver.licenseNumber ?? "—"}
									</Typography>
								</Stack>
								<Stack
									direction="row"
									spacing={1.5}
									alignItems="center"
								>
									<Typography variant="body2" sx={{ ml: 4 }}>
										License Category:{" "}
										{driver.licenseCategory ?? "—"}
									</Typography>
								</Stack>
								<Stack
									direction="row"
									spacing={1.5}
									alignItems="center"
								>
									<CalendarTodayRounded fontSize="small" />
									<Typography variant="body2">
										Issue Date:{" "}
										{formatDateDisplay(
											driver.licenseIssueDate
										)}{" "}
										- Expiry Date:{" "}
										{formatDateDisplay(
											driver.licenseExpiryDate
										)}
									</Typography>
								</Stack>
							</Stack>
						</Box>
					</Paper>

					{/* Thống kê */}
					<Paper variant="outlined" sx={{ mb: 2 }}>
						<Box sx={{ p: 1.5, background: "#e3f2fd" }}>
							<Typography sx={{ fontWeight: 700 }}>
								Activity Statistics
							</Typography>
						</Box>
						<Box sx={{ p: 2 }}>
							<Stack spacing={1.5}>
								<Typography variant="body2">
									Total Trips:{" "}
									{typeof (driver as any).totalTrips ===
									"number"
										? (driver as any).totalTrips
										: "—"}
								</Typography>
								<Typography variant="body2">
									Total Earnings:{" "}
									{typeof (driver as any).totalEarnings ===
									"number"
										? currency(
												(driver as any).totalEarnings
										  )
										: "—"}
								</Typography>
								<Typography variant="body2">
									Rating:{" "}
									{typeof (driver as any).rating === "number"
										? `⭐ ${(driver as any).rating.toFixed(
												1
										  )}`
										: "—"}
								</Typography>
							</Stack>
						</Box>
					</Paper>
				</CardContent>

				<Divider sx={{ my: 2 }} />

				<CardActions
					sx={{
						borderTop: "1px solid",
						borderColor: "divider",
					}}
				>
					<Button
						variant="contained"
						color="primary"
						className="hvr-icon-pop"
						fullWidth
						onClick={() => onEdit(driver)}
						startIcon={<Edit className="hvr-icon" />}
					>
						Edit
					</Button>
					<Button
						variant="contained"
						color="error"
						className="hvr-icon-pop"
						fullWidth
						onClick={handleDelete}
						startIcon={<Delete className="hvr-icon" />}
					>
						Delete
					</Button>
					<Button
						variant="outlined"
						fullWidth
						onClick={onClose}
						className="hvr-icon-back"
						startIcon={<ArrowBack className="hvr-icon" />}
					>
						Close
					</Button>
				</CardActions>
			</Card>
		</Drawer>
	);
};

export default DriverDetails;
