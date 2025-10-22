import React from "react";
import {
	Drawer,
	Box,
	Typography,
	IconButton,
	Card,
	CardContent,
	Grid,
	Chip,
	Button,
} from "@mui/material";
import {
	Close as CloseIcon,
	Edit as EditIcon,
	ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import type { ChipColor } from "@my-types/ChipColor";
import type { VehicleDetail } from "@my-types/vehicleList";

interface VehicleDetailsDrawerProps {
	open: boolean;
	onClose: () => void;
	vehicle: VehicleDetail | null;
	onEdit?: (vehicle: VehicleDetail) => void;
	onDelete?: (vehicle: VehicleDetail) => void;
}
const VehicleDetailsDrawer: React.FC<VehicleDetailsDrawerProps> = ({
	open,
	onClose,
	vehicle,
	onEdit,
}) => {
	const getStatusColor = (status?: string): ChipColor => {
		if (!status) return "default";
		switch (status) {
			case "Ready":
				return "warning";
			case "Active":
				return "success";
			case "In-Progress":
				return "info";
			default:
				return "default";
		}
	};
	if (!vehicle) return null;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function onDelete(_vehicle: VehicleDetail) {
		throw new Error("Function not implemented.");
	}
	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			sx={{
				"& .MuiDrawer-paper": {
					width: 400,
					boxShadow: "-4px 0 8px rgba(0, 0, 0, 0.1)",
				},
			}}
		>
			<Box
				sx={{
					p: 3,
					height: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* Header */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3,
					}}
				>
					<Typography
						variant="h5"
						sx={{
							fontWeight: "bold",
							color: "#1976d2",
						}}
					>
						Vehicle Details
					</Typography>
					<IconButton onClick={onClose} size="small">
						<CloseIcon />
					</IconButton>
				</Box>
				{/* Content */}
				<Box sx={{ flex: 1, overflow: "auto" }}>
					<Grid container spacing={3}>
						{/* Vehicle Information Card */}
						<Grid size={{ xs: 12 }}>
							<Card sx={{ boxShadow: 2 }}>
								<CardContent>
									<Typography
										variant="h6"
										sx={{
											fontWeight: "bold",
											color: "#333",
											mb: 2,
										}}
									>
										Vehicle Information
									</Typography>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											gap: 1.5,
										}}
									>
										<Box>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												Name
											</Typography>
											<Typography
												variant="body1"
												fontWeight="medium"
											>
												{vehicle.displayName || 
												 (vehicle.manufacturer && vehicle.model 
													? `${vehicle.manufacturer} ${vehicle.model}` 
													: `Vehicle ${vehicle.id}`)}
											</Typography>
										</Box>
										<Box>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												Vehicle Type
											</Typography>
											<Typography
												variant="body1"
												fontWeight="medium"
											>
												{vehicle.vehicleType.name}
											</Typography>
										</Box>
										<Box>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												License Plate
											</Typography>
											<Typography
												variant="body1"
												fontWeight="medium"
											>
												{vehicle.numberPlate}
											</Typography>
										</Box>
										{vehicle.manufacturer && (
											<Box>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													Manufacturer
												</Typography>
												<Typography
													variant="body1"
													fontWeight="medium"
												>
													{vehicle.manufacturer}
												</Typography>
											</Box>
										)}
										{vehicle.model && (
											<Box>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													Model
												</Typography>
												<Typography
													variant="body1"
													fontWeight="medium"
												>
													{vehicle.model}
												</Typography>
											</Box>
										)}
										{vehicle.vehicleType.totalSeats && (
											<Box>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													Total Seats
												</Typography>
												<Typography
													variant="body1"
													fontWeight="medium"
												>
													{vehicle.vehicleType.totalSeats}
												</Typography>
											</Box>
										)}
									</Box>
								</CardContent>
							</Card>
						</Grid>
						{/* Status Information Card */}
						<Grid size={{ xs: 12 }}>
							<Card sx={{ boxShadow: 2 }}>
								<CardContent>
									<Typography
										variant="h6"
										sx={{
											fontWeight: "bold",
											color: "#333",
											mb: 2,
										}}
									>
										Status Information
									</Typography>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											gap: 1.5,
										}}
									>
										{vehicle.status && (
											<Box>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													Status
												</Typography>
												<Chip
													label={vehicle.status}
													color={getStatusColor(vehicle.status) as ChipColor}
													size="small"
													sx={{ mt: 0.5 }}
												/>
											</Box>
										)}
										{vehicle.createdAt && (
											<Box>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													Created Date
												</Typography>
												<Typography
													variant="body1"
													fontWeight="medium"
												>
													{new Date(vehicle.createdAt).toLocaleDateString()}
												</Typography>
											</Box>
										)}
										{vehicle.updatedAt && (
											<Box>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													Last Updated
												</Typography>
												<Typography
													variant="body1"
													fontWeight="medium"
												>
													{new Date(vehicle.updatedAt).toLocaleDateString()}
												</Typography>
											</Box>
										)}
									</Box>
								</CardContent>
							</Card>
						</Grid>
					</Grid>
				</Box>
				{/* Action Buttons */}
				<Box
					sx={{
						display: "flex",
						gap: 1, // khoảng cách nhỏ giữa các nút
						pt: 2,
						borderTop: "1px solid #e0e0e0",
						mt: 2,
					}}
				>
					<Button
						variant="contained"
						startIcon={<EditIcon />}
						onClick={() => onEdit && onEdit(vehicle)}
						sx={{
							flex: 1,
							backgroundColor: "#1976d2",
							"&:hover": { backgroundColor: "#1565c0" },
						}}
					>
						Edit
					</Button>
					<Button
						variant="outlined"
						startIcon={<ArrowBackIcon />}
						onClick={onClose}
						sx={{ flex: 1 }}
					>
						Back
					</Button>
					<Button
						variant="contained"
						color="error"
						sx={{ flex: 1 }}
						onClick={() => {
							if (vehicle && onDelete) {
								onDelete(vehicle); // gọi hàm xóa từ parent
								onClose(); // đóng Drawer sau khi xóa
							}
						}}
					>
						Delete
					</Button>
					<Button variant="outlined" sx={{ flex: 1 }}>
						Info
					</Button>
				</Box>
			</Box>
		</Drawer>
	);
};
export default VehicleDetailsDrawer;