import React, { useMemo } from "react";
import {
	Box,
	Button,
	Drawer,
	IconButton,
	Stack,
	Typography,
	Divider,
	Chip,
	Grid,
	Paper,
	CircularProgress,
	Avatar,
} from "@mui/material";
import {
	Close as CloseIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Place as PlaceIcon,
	AttachMoney as MoneyIcon,
	AccessTime as TimeIcon,
	Straighten as DistanceIcon,
	Flag as FlagIcon,
	DirectionsBus as BusIcon,
} from "@mui/icons-material";
import type { Route } from "@my-types";
import { RouteMap } from "@components/map";
import { formatDistance, formatDuration } from "@utils/map";
import { formatCurrency } from "@utils/formatting";

interface RouteDetailsDrawerProps {
	open: boolean;
	onClose: () => void;
	route: Route | null;
	onEdit?: (route: Route) => void;
	onDelete?: (route: Route) => void;
}

const RouteDetailsDrawer: React.FC<RouteDetailsDrawerProps> = ({
	open,
	onClose,
	route,
	onEdit,
	onDelete,
}) => {
	// Prepare stops for the map and timeline
	const stopsData = useMemo(() => {
		if (!route || !route.stops) return [];

		// Sort by order and map to flat structure
		return [...route.stops]
			.sort((a, b) => a.stopOrder - b.stopOrder)
			.map((s) => ({
				name: s.locations?.name || `Stop ${s.stopOrder + 1}`,
				address: s.locations?.address || "",
				latitude: Number(s.locations?.latitude),
				longitude: Number(s.locations?.longitude),
				id: s.id,
			}));
	}, [route]);

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: { width: { xs: "100%", sm: 450, md: 500 } },
			}}
		>
			{/* HEADER */}
			<Box
				sx={{
					p: 2,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderBottom: "1px solid",
					borderColor: "divider",
				}}
			>
				<Typography variant="h6" fontWeight="bold">
					Route Details
				</Typography>
				<IconButton onClick={onClose} size="small">
					<CloseIcon />
				</IconButton>
			</Box>

			{route ? (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
					}}
				>
					{/* MAP HERO SECTION */}
					<Box
						sx={{ height: 250, width: "100%", bgcolor: "#f5f5f5" }}
					>
						{/* Passing stops triggers "Load Mode" in RouteMap */}
						<RouteMap
							stops={stopsData}
							height="100%"
							zoom={10}
							showMarkers={true}
							showRoute={true}
						/>
					</Box>

					{/* SCROLLABLE CONTENT */}
					<Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
						{/* Header Info */}
						<Box mb={3}>
							<Typography
								variant="h5"
								fontWeight="bold"
								gutterBottom
							>
								{route.name}
							</Typography>
							<Stack
								direction="row"
								spacing={1}
								alignItems="center"
							>
								<Chip
									label={`ID: ${route.id}`}
									size="small"
									variant="outlined"
								/>
								<Chip
									label={`${stopsData.length} Stops`}
									size="small"
									color="primary"
									variant="outlined"
								/>
							</Stack>
						</Box>

						{/* Stats Grid */}
						<Paper
							variant="outlined"
							sx={{ p: 2, mb: 3, borderRadius: 2 }}
						>
							<Grid container spacing={2} wrap="nowrap">
								<Grid
									size={{ xs: 4 }}
									sx={{ textAlign: "center" }}
								>
									<Box color="success.main" mb={0.5}>
										<MoneyIcon />
									</Box>
									<Typography
										variant="caption"
										color="text.secondary"
										display="block"
									>
										Price
									</Typography>
									<Typography
										variant="subtitle2"
										fontWeight="bold"
									>
										{route.price ? formatCurrency(route.price, "VND", "vi-VN") : "N/A"}
									</Typography>
								</Grid>
								<Divider
									orientation="vertical"
									flexItem
									sx={{ mr: "-1px" }}
								/>
								<Grid
									size={{ xs: 4 }}
									sx={{ textAlign: "center" }}
								>
									<Box color="info.main" mb={0.5}>
										<DistanceIcon />
									</Box>
									<Typography
										variant="caption"
										color="text.secondary"
										display="block"
									>
										Distance
									</Typography>
									<Typography
										variant="subtitle2"
										fontWeight="bold"
									>
										{formatDistance(route.distance || 0)}
									</Typography>
								</Grid>
								<Divider
									orientation="vertical"
									flexItem
									sx={{ mr: "-1px" }}
								/>
								<Grid
									size={{ xs: 4 }}
									sx={{ textAlign: "center" }}
								>
									<Box color="warning.main" mb={0.5}>
										<TimeIcon />
									</Box>
									<Typography
										variant="caption"
										color="text.secondary"
										display="block"
									>
										Duration
									</Typography>
									<Typography
										variant="subtitle2"
										fontWeight="bold"
									>
										{formatDuration(route.duration || 0)}
									</Typography>
								</Grid>
							</Grid>
						</Paper>

						{/* Custom Itinerary List (Replaces Mui Lab Timeline) */}
						<Typography
							variant="subtitle1"
							fontWeight="bold"
							sx={{ mb: 2 }}
						>
							Itinerary
						</Typography>

						<Box sx={{ position: "relative", pl: 1 }}>
							{stopsData.map((stop, index) => {
								const isStart = index === 0;
								const isEnd = index === stopsData.length - 1;

								// Determine styling based on position
								const color = isStart
									? "success.main"
									: isEnd
									? "error.main"
									: "grey.500";
								const Icon = isStart
									? PlaceIcon
									: isEnd
									? FlagIcon
									: BusIcon;

								return (
									<Box
										key={stop.id || index}
										sx={{
											display: "flex",
											mb:
												index === stopsData.length - 1
													? 0
													: 2,
											position: "relative",
										}}
									>
										{/* Connecting Line */}
										{!isEnd && (
											<Box
												sx={{
													position: "absolute",
													top: 32,
													left: 15, // Center align with avatar
													bottom: -16,
													width: 2,
													bgcolor: "grey.300",
													zIndex: 0,
												}}
											/>
										)}

										{/* Icon Marker */}
										<Box sx={{ mr: 2, zIndex: 1 }}>
											<Avatar
												sx={{
													width: 32,
													height: 32,
													bgcolor: "white",
													border: "2px solid",
													borderColor: color,
													color: color,
												}}
											>
												<Icon sx={{ fontSize: 18 }} />
											</Avatar>
										</Box>

										{/* Info Card */}
										<Paper
											elevation={0}
											variant="outlined"
											sx={{
												flex: 1,
												p: 1.5,
												bgcolor: "background.paper",
												border: "1px solid",
												borderColor: "grey.200",
												"&:hover": {
													borderColor:
														"primary.light",
												},
											}}
										>
											<Typography
												variant="subtitle2"
												fontWeight="600"
											>
												{stop.name}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ fontSize: "0.85rem" }}
											>
												{stop.address}
											</Typography>
										</Paper>
									</Box>
								);
							})}
						</Box>
					</Box>

					{/* FOOTER ACTIONS */}
					<Box
						sx={{
							p: 2,
							borderTop: "1px solid",
							borderColor: "divider",
							bgcolor: "background.default",
						}}
					>
						<Stack direction="row" spacing={2}>
							<Button
								fullWidth
								variant="outlined"
								color="primary"
								startIcon={<EditIcon />}
								onClick={() => onEdit?.(route)}
							>
								Edit Route
							</Button>
							<Button
								fullWidth
								variant="outlined"
								color="error"
								startIcon={<DeleteIcon />}
								onClick={() => onDelete?.(route)}
							>
								Delete
							</Button>
						</Stack>
					</Box>
				</Box>
			) : (
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					height="100%"
				>
					<CircularProgress />
				</Box>
			)}
		</Drawer>
	);
};

export default RouteDetailsDrawer;
