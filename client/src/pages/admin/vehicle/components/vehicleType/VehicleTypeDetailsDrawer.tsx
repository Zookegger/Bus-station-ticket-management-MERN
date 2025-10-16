import React from "react";
import {
	Drawer,
	Box,
	Typography,
	IconButton,
	Divider,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Button,
	Chip,
} from "@mui/material";
import {
	Close as CloseIcon,
	DirectionsBus as BusIcon,
	AttachMoney as MoneyIcon,
	EventSeat as SeatIcon,
	Layers as FloorIcon,
	ViewColumn as ColumnIcon,
	TableRows as RowIcon,
	Edit as EditIcon,
	ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import type { VehicleType } from "./types";

interface VehicleTypeDetailsDrawerProps {
	open: boolean;
	onClose: () => void;
	vehicleType: VehicleType | null;
	onEdit: (vehicleType: VehicleType) => void;
	onDelete: (vehicleType: VehicleType) => void;
}

const VehicleTypeDetailsDrawer: React.FC<VehicleTypeDetailsDrawerProps> = ({
	open,
	onClose,
	vehicleType,
	onEdit,
	onDelete,
}) => {
	if (!vehicleType) return null;

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: 400,
					bgcolor: "#f8f9fa",
				},
			}}
		>
			<Box sx={{ p: 3 }}>
				{/* Header */}
				<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
					<Typography
						variant="h5"
						sx={{ fontWeight: "bold", flexGrow: 1 }}
					>
						Vehicle Type Details
					</Typography>
					<IconButton onClick={onClose}>
						<CloseIcon />
					</IconButton>
				</Box>

				<Divider sx={{ mb: 3 }} />

				{/* Vehicle Information */}
				<Box sx={{ bgcolor: "white", p: 3, borderRadius: 2, mb: 3 }}>
					<Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
						Vehicle Information
					</Typography>

					<List dense>
						<ListItem sx={{ px: 0 }}>
							<ListItemIcon>
								<BusIcon color="primary" />
							</ListItemIcon>
							<ListItemText
								primary="Name"
								secondary={
									<Typography
										variant="body1"
										sx={{ fontWeight: "medium" }}
									>
										{vehicleType.name}
									</Typography>
								}
							/>
						</ListItem>

						<ListItem sx={{ px: 0 }}>
							<ListItemIcon>
								<MoneyIcon color="success" />
							</ListItemIcon>
							<ListItemText
								primary="Price"
								secondary={
									<Typography
										variant="body1"
										sx={{ fontWeight: "medium" }}
									>
										{formatCurrency(vehicleType.baseFare)}
									</Typography>
								}
							/>
						</ListItem>

						<ListItem sx={{ px: 0 }}>
							<ListItemIcon>
								<SeatIcon color="info" />
							</ListItemIcon>
							<ListItemText
								primary="Total Seats"
								secondary={
									<Chip
										label={vehicleType.totalSeats}
										color="info"
										size="small"
										sx={{ fontWeight: "bold" }}
									/>
								}
							/>
						</ListItem>

						<ListItem sx={{ px: 0 }}>
							<ListItemIcon>
								<ColumnIcon color="secondary" />
							</ListItemIcon>
							<ListItemText
								primary="Total Columns"
								secondary={
									<Typography
										variant="body1"
										sx={{ fontWeight: "medium" }}
									>
										{vehicleType.totalColumn}
									</Typography>
								}
							/>
						</ListItem>

						<ListItem sx={{ px: 0 }}>
							<ListItemIcon>
								<RowIcon color="warning" />
							</ListItemIcon>
							<ListItemText
								primary="Total Rows"
								secondary={
									<Typography
										variant="body1"
										sx={{ fontWeight: "medium" }}
									>
										{vehicleType.totalRow}
									</Typography>
								}
							/>
						</ListItem>

						<ListItem sx={{ px: 0 }}>
							<ListItemIcon>
								<FloorIcon color="error" />
							</ListItemIcon>
							<ListItemText
								primary="Total Flooring"
								secondary={
									<Typography
										variant="body1"
										sx={{ fontWeight: "medium" }}
									>
										{vehicleType.totalFlooring}
									</Typography>
								}
							/>
						</ListItem>

						{vehicleType.description && (
							<ListItem sx={{ px: 0 }}>
								<ListItemText
									primary="Description"
									secondary={
										<Typography
											variant="body2"
											color="text.secondary"
										>
											{vehicleType.description}
										</Typography>
									}
								/>
							</ListItem>
						)}
					</List>
				</Box>

				{/* Action Buttons */}
				<Box sx={{ display: "flex", gap: 2, flexDirection: "column" }}>
					<Button
						variant="contained"
						startIcon={<EditIcon />}
						onClick={() => onEdit(vehicleType)}
						sx={{ bgcolor: "#1976d2" }}
					>
						Edit
					</Button>
					<Button
						variant="contained"
						startIcon={<EditIcon />}
						onClick={() => onDelete(vehicleType)}
						sx={{ bgcolor: "#1976d2" }}
					>
						Delete
					</Button>
					<Button
						variant="outlined"
						startIcon={<ArrowBackIcon />}
						onClick={onClose}
						sx={{ color: "#666", borderColor: "#ddd" }}
					>
						Back to List
					</Button>
				</Box>
			</Box>
		</Drawer>
	);
};

export default VehicleTypeDetailsDrawer;
