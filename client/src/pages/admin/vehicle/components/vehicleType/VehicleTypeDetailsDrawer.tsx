import React from "react";
import {
	Drawer,
	Box,
	Typography,
	IconButton,
	Button,
	Chip,
	Grid,
	Paper,
	type ChipPropsColorOverrides,
	Card,
	CardHeader,
	CardContent,
	CardActions,
} from "@mui/material";
import type { OverridableStringUnion } from "@mui/types";
import {
	Close as CloseIcon,
	DirectionsBus as BusIcon,
	AttachMoney as MoneyIcon,
	EventSeat as SeatIcon,
	Layers as FloorIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from "@mui/icons-material";
import type { VehicleType } from "@my-types/vehicleType";
import SeatLayoutPreview from "./SeatLayoutPreview";

interface VehicleTypeDetailsDrawerProps {
	open: boolean;
	onClose: () => void;
	vehicleType: VehicleType | null;
	onEdit: (vehicleType: VehicleType) => void;
	onDelete: (vehicleType: VehicleType) => void;
}

interface ItemPanelProps {
	labelName: string;
	iconItem: React.ReactNode;
	content: any;
	chipColor?: OverridableStringUnion<
		| "primary"
		| "secondary"
		| "error"
		| "info"
		| "success"
		| "warning"
		| "default",
		ChipPropsColorOverrides
	>;
}

const ItemPanel: React.FC<ItemPanelProps> = ({
	labelName,
	iconItem,
	content,
	chipColor,
}) => {
	return (
		<Grid size={{ xs: 4 }} flexGrow={1}>
			<Paper sx={{ height: "100%", display: "flex" }}>
				<Box
					display={"flex"}
					flexDirection={"column"}
					alignItems={"center"}
					justifyContent={"center"}
					flexGrow={1}
					paddingY={3}
				>
					{iconItem}
					<Typography>{labelName}</Typography>
					<Chip
						label={content ?? "N/A"}
						color={chipColor}
						size="small"
						sx={{ fontWeight: "bold", mt: 1 }}
					/>
				</Box>
			</Paper>
		</Grid>
	);
};

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
			slotProps={{
				paper: {
					sx: {
						width: 400,
						bgcolor: "#f8f9fa",
					},
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
					sx={{ display: "flex", alignItems: "center" }}
					title={
						<Typography
							variant="h5"
							sx={{ fontWeight: "bold", flexGrow: 1 }}
						>
							Vehicle Type Details
						</Typography>
					}
					action={
						<IconButton onClick={onClose}>
							<CloseIcon />
						</IconButton>
					}
				/>

				<CardContent sx={{ flex: 1, overflow: "auto" }}>
					{/* Vehicle Information */}
					<Paper sx={{ p: 0, borderRadius: 2, mb: 3 }} elevation={0}>
						<Grid container gap={1}>
							<ItemPanel
								content={vehicleType.name ?? "N/A"}
								chipColor="info"
								labelName={"Name"}
								iconItem={
									<BusIcon
										fontSize={"large"}
										color="primary"
									/>
								}
							/>
							<ItemPanel
								content={
									formatCurrency(vehicleType.price) ?? "N/A"
								}
								chipColor="success"
								labelName={"Price"}
								iconItem={
									<MoneyIcon
										fontSize={"large"}
										color="success"
									/>
								}
							/>
							<ItemPanel
								content={vehicleType.totalSeats ?? "N/A"}
								chipColor="secondary"
								labelName={"Total Seats"}
								iconItem={
									<SeatIcon
										fontSize={"large"}
										color="secondary"
									/>
								}
							/>
							<ItemPanel
								content={vehicleType.totalFloors ?? "N/A"}
								chipColor="error"
								labelName={"Total Floors"}
								iconItem={
									<FloorIcon
										fontSize={"large"}
										color="error"
									/>
								}
							/>
						</Grid>
					</Paper>

					{/* Seat Layout Preview */}
					<Paper sx={{ p: 0, borderRadius: 2, pb: 3 }}>
						<SeatLayoutPreview
							seatLayout={vehicleType?.seatLayout}
						/>
					</Paper>
				</CardContent>
				{/* Action Buttons */}
				<CardActions sx={{ gap: 1 }}>
					<Button
						variant="contained"
						startIcon={<EditIcon />}
						onClick={() => onEdit(vehicleType)}
						sx={{ bgcolor: "#1976d2", flex: 1 }}
					>
						Edit
					</Button>
					<Button
						variant="contained"
						startIcon={<DeleteIcon />}
						onClick={() => onDelete(vehicleType)}
						sx={{ bgcolor: "#d32f2f", flex: 1 }}
					>
						Delete
					</Button>
				</CardActions>
			</Card>
		</Drawer>
	);
};

export default VehicleTypeDetailsDrawer;
