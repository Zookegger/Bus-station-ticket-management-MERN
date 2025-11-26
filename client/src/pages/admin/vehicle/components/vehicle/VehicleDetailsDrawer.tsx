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
	CardHeader,
	CardActions,
	Paper,
	Divider,
} from "@mui/material";
import {
	Edit as EditIcon,
	ArrowBack as ArrowBackIcon,
	Delete as DeleteIcon,
	DirectionsBus as BusIcon,
	Factory as FactoryIcon,
	Category as CategoryIcon,
	AccessTime as CreatedAtIcon,
	AccessTimeFilled as UpdatedAtIcon,
} from "@mui/icons-material";
import type { ChipColor } from "@my-types/ChipColor";
import type { VehicleDetail } from "@my-types/vehicleList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard } from "@fortawesome/free-solid-svg-icons";
import { SeatLayoutPreview } from "@components/seatmap";

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
			case "ACTIVE":
				return "success";
			case "INACTIVE":
				return "error";
			case "BUSY":
				return "warning";
			case "MAINTENANCE":
				return "info";
			default:
				return "default";
		}
	};
	if (!vehicle) return null;
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
			<Card
				sx={{
					p: 1,
					height: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* Header */}
				<CardHeader
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
					title={
						<Box
							display={"flex"}
							alignItems={"center"}
							justifyContent={"flex-start"}
						>
							<Typography
								variant="h5"
								sx={{
									fontWeight: "bold",
									color: "#1976d2",
								}}
							>
								{vehicle.displayName ||
									(vehicle.manufacturer && vehicle.model
										? `${vehicle.manufacturer} ${vehicle.model}`
										: `Vehicle ${vehicle.id}`)}
							</Typography>

							<Chip
								label={
									vehicle.status
										? vehicle.status
												.charAt(0)
												.toUpperCase() +
										  vehicle.status.slice(1).toLowerCase()
										: "Unknown"
								}
								color={
									getStatusColor(vehicle.status) as ChipColor
								}
								size="small"
								sx={{ marginLeft: 1 }}
								slotProps={{
									label: {
										sx: {
											fontWeight: "bold",
										},
									},
								}}
							/>
							<Chip
								label={
									vehicle.vehicleType.totalSeats
										? `${vehicle.vehicleType.totalSeats} Seats`
										: "N/A"
								}
								color={"default"}
								size="small"
								sx={{ marginLeft: 1 }}
								slotProps={{
									label: {
										sx: {
											fontWeight: "bold",
										},
									},
								}}
							/>
						</Box>
					}
					action={
						<IconButton
							className="hvr-icon-back"
							onClick={onClose}
							size="medium"
						>
							<ArrowBackIcon className="hvr-icon" />
						</IconButton>
					}
				/>

				{/* Content */}
				<CardContent sx={{ flex: 1, overflow: "auto" }}>
					<Grid container flexDirection={"column"} gap={1}>
						<Grid container spacing={4}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<Paper
									elevation={3}
									sx={{
										p: 2,
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<CategoryIcon fontSize="large" />
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
								</Paper>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<Paper
									elevation={3}
									sx={{
										p: 2,
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<FontAwesomeIcon
										icon={faIdCard}
										size="2x"
									/>
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
								</Paper>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<Paper
									elevation={3}
									sx={{
										p: 2,
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<FactoryIcon fontSize="large" />
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
										{vehicle.manufacturer ?? "N/A"}
									</Typography>
								</Paper>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<Paper
									elevation={3}
									sx={{
										p: 2,
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<BusIcon fontSize="large" />
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
										{vehicle.model ?? "N/A"}
									</Typography>
								</Paper>
							</Grid>
						</Grid>
						<Divider sx={{ my: 2 }} />
						<Paper elevation={3}>
							<Grid container spacing={2}>
								<Grid size={{ xs: 6 }} p={1}>
									<Box display={"flex"} alignItems={"center"}>
										<CreatedAtIcon fontSize="small" sx={{ marginRight: 0.5}}/>
										<Typography
											variant="body1"
											color="text.secondary"
										>
											Created At
										</Typography>
									</Box>
									<Typography
										variant="body2"
										fontWeight="medium"
									>
										{vehicle.createdAt
											? `${new Date(
													vehicle.createdAt
											  ).toLocaleDateString()} - ${new Date(
													vehicle.createdAt
											  ).toLocaleTimeString()}`
											: "N/A"}
									</Typography>
								</Grid>
								<Grid size={{ xs: 6 }} p={1}>
									<Box display={"flex"} alignItems={"center"}>
										<UpdatedAtIcon fontSize="small" sx={{ marginRight: 0.5}}/>
										<Typography
											variant="body1"
											color="text.secondary"
										>
											Last Updated
										</Typography>
									</Box>
									<Typography
										variant="body2"
										fontWeight="medium"
									>
										{vehicle.updatedAt
											? `${new Date(
													vehicle.updatedAt
											  ).toLocaleDateString()} - ${new Date(
													vehicle.updatedAt
											  ).toLocaleTimeString()}`
											: "N/A"}
									</Typography>
								</Grid>
							</Grid>
						</Paper>
						<Divider sx={{ my: 2 }} />
						<SeatLayoutPreview
							seatLayout={vehicle.vehicleType.seatLayout}
						/>
					</Grid>
				</CardContent>
				{/* Action Buttons */}
				<CardActions
					sx={{
						display: "flex",
						gap: 1,
						pt: 2,
						borderTop: "1px solid #e0e0e0",
						mt: 2,
					}}
				>
					<Button
						variant="contained"
						className="hvr-icon-float"
						startIcon={<EditIcon className="hvr-icon" />}
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
						variant="contained"
						color="error"
						className="hvr-icon-shrink"
						sx={{ flex: 1 }}
						startIcon={<DeleteIcon className="hvr-icon" />}
						onClick={() => {
							if (vehicle && onDelete) {
								onDelete(vehicle); // gọi hàm xóa từ parent
								onClose(); // đóng Drawer sau khi xóa
							}
						}}
					>
						Delete
					</Button>
				</CardActions>
			</Card>
		</Drawer>
	);
};
export default VehicleDetailsDrawer;
