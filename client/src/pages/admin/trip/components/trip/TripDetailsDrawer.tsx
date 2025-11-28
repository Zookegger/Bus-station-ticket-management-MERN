import React, { useMemo, useState } from "react";
import {
	Box,
	Button,
	Drawer,
	Stack,
	Typography,
	Chip,
	IconButton,
	Grid,
	Paper,
	Divider,
	Avatar,
	Tab,
	Tabs,
	Card,
	CardHeader,
	CardContent,
	CardActions,
} from "@mui/material";
import {
	Close as CloseIcon,
	Edit as EditIcon,
	CalendarToday as CalendarIcon,
	DirectionsBus as BusIcon,
	AttachMoney as MoneyIcon,
	AccessTime as TimeIcon,
	Place as PlaceIcon,
	Flag as FlagIcon,
	Person as DriverIcon,
	Map as MapIcon,
	Info as InfoIcon,
	Route as RouteIcon,
	ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { addSeconds, format, isValid } from "date-fns";
import { TripStatus, type Trip } from "@my-types/trip";
import { RouteMap } from "@components/map"; // Reusing your existing map component
import { formatDistance, formatDuration } from "@utils/map";

interface TripDetailsDrawerProps {
	open: boolean;
	onClose: () => void;
	trip: Trip | null;
	onEdit: (trip: Trip) => void;
}

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

const CustomTabPanel = (props: TabPanelProps) => {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`trip-tabpanel-${index}`}
			aria-labelledby={`trip-tab-${index}`}
			{...other}
			style={{
				height: "100%",
				overflow: "hidden",
				display: value === index ? "flex" : "none",
				flexDirection: "column",
			}}
		>
			{value === index && (
				<Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>{children}</Box>
			)}
		</div>
	);
};

const TripDetailsDrawer: React.FC<TripDetailsDrawerProps> = ({
	open,
	onClose,
	trip,
	onEdit,
}) => {
	const [tabValue, setTabValue] = useState(0);

	const handleTabChange = (
		_event: React.SyntheticEvent,
		newValue: number
	) => {
		setTabValue(newValue);
	};

	// --- Calculations ---

	const outboundArrival = useMemo(() => {
		if (!trip?.startTime || !trip.route?.duration) return null;
		return addSeconds(new Date(trip.startTime), trip.route.duration);
	}, [trip]);

	// Prepare stops for the map
	const stopsData = useMemo(() => {
		if (!trip?.route?.stops) return [];
		return [...trip.route.stops]
			.sort((a, b) => a.stopOrder - b.stopOrder)
			.map((s) => ({
				name: s.locations?.name,
				address: s.locations?.address,
				latitude: Number(s.locations?.latitude),
				longitude: Number(s.locations?.longitude),
			}));
	}, [trip]);

	// Status Chip Logic (use TripStatus enum values)
	const getStatusChip = (status?: TripStatus | string | null) => {
		if (!status) return null;
		// Ensure we work with the canonical TripStatus string
		const st = String(status) as TripStatus;

		let color:
			| "default"
			| "primary"
			| "secondary"
			| "error"
			| "info"
			| "success"
			| "warning" = "default";

		if (st === TripStatus.CANCELLED) color = "error";
		else if (st === TripStatus.PENDING) color = "warning";
		else if (
			st === TripStatus.SCHEDULED ||
			st === TripStatus.DEPARTED ||
			st === TripStatus.COMPLETED
		)
			color = "success";
		else if (st === TripStatus.DELAYED) color = "warning";
		else color = "primary";

		// Humanize label: Title case
		let label = st.toLowerCase().replace(/_/g, " ");
		label = label.charAt(0).toUpperCase() + label.slice(1);

		return (
			<Chip
				label={label}
				color={color}
				size="small"
				variant="filled"
				sx={{ fontWeight: "bold" }}
			/>
		);
	};

	if (!trip) return null;

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			slotProps={{
				paper: {
					sx: { width: { xs: "100%", sm: 400, md: 500 } },
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
				{/* --- Header --- */}
				<CardHeader
					sx={{
						p: 2,
						borderBottom: "1px solid",
						borderColor: "divider",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						bgcolor: "background.paper",
					}}
					title={
						<Stack spacing={1}>
							<Typography
								variant="h5"
								fontWeight="bold"
								color="primary.main"
							>
								Trip #{trip.id}
							</Typography>
							<Stack
								direction="row"
								spacing={1}
								flexWrap="wrap"
								useFlexGap
							>
								{getStatusChip(trip.status)}
								{trip.isRoundTrip && (
									<Chip
										label="Round Trip"
										size="small"
										color="info"
										variant="outlined"
									/>
								)}
								{trip.isTemplate && (
									<Chip
										label="Template"
										size="small"
										color="secondary"
										variant="outlined"
									/>
								)}
								{(trip.returnStartTime ||
									trip.returnTripId) && (
									<Chip
										label="Round Trip"
										size="small"
										color="default"
										variant="outlined"
									/>
								)}
							</Stack>
						</Stack>
					}
					action={
						<IconButton
							onClick={onClose}
							className="hvr-icon-grow"
							size="small"
						>
							<CloseIcon className="hvr-icon" />
						</IconButton>
					}
				></CardHeader>

				{/* --- Map Hero Section --- */}
				<Box
					sx={{
						height: "25vh",
						minHeight: 350,
						width: "100%",
						bgcolor: "#f5f5f5",
						position: "relative",
					}}
				>
					{trip.route ? (
						<RouteMap
							stops={stopsData}
							height="100%"
							zoom={10}
							showMarkers={true}
							showRoute={true}
						/>
					) : (
						<Box
							display="flex"
							alignItems="center"
							justifyContent="center"
							height="100%"
						>
							<Typography color="text.secondary">
								No Route Data Available
							</Typography>
						</Box>
					)}
					{/* Price Overlay */}
					<Paper
						sx={{
							position: "absolute",
							bottom: 16,
							right: 16,
							zIndex: 1000,
							py: 0.5,
							px: 1.5,
							borderRadius: 4,
							display: "flex",
							alignItems: "center",
							gap: 0.5,
							boxShadow: 3,
							opacity: .8,
						}}
					>
						<MoneyIcon color="success" fontSize="small" />
						<Typography fontWeight="bold" variant="subtitle1">
							{new Intl.NumberFormat("vi-VN", {
								style: "currency",
								currency: "VND",
							}).format(trip.price)}
						</Typography>
					</Paper>

					{/* Small Route Details overlay on the map */}
					{trip.route && (
						<Paper
							variant="outlined"
							sx={{
								position: "absolute",
								top: 12,
								right: 12,
								zIndex: 1000,
								py: 1,
								px: 1.25,
								borderRadius: 2,
								width: 150,
								boxShadow: 3,
								bgcolor: "background.paper",
								opacity: .95
							}}
						>
							<Stack direction={"row"} gap={2} alignItems={"center"}>
								<MapIcon fontSize="small" />
								<Box>
									<Typography
										variant="caption"
										color="text.secondary"
										fontWeight={600}
									>
										Distance
									</Typography>
									<Typography variant="body2">
										{trip.route?.distance
											? formatDistance(
													trip.route.distance
											  )
											: "N/A"}
									</Typography>
								</Box>
								<Box>
									<Typography
										variant="caption"
										color="text.secondary"
										fontWeight={600}
									>
										Duration
									</Typography>
									<Typography variant="body2">
										{trip.route?.duration
											? formatDuration(
													trip.route.duration
											  )
											: "N/A"}
									</Typography>
								</Box>
							</Stack>
						</Paper>
					)}
				</Box>

				{/* --- Body --- */}
				<CardContent
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						overflowY: "hidden",
						borderBottom: 1,
						borderColor: "divider",
					}}
				>
					{/* --- Tabs --- */}
					<Tabs
						value={tabValue}
						onChange={handleTabChange}
						variant="fullWidth"
						sx={{ minHeight: 36 }}
						slotProps={{
							indicator: {
								sx: { height: 3, borderRadius: 2 },
							},
						}}
					>
						<Tab
							sx={{
								minHeight: 32,
								py: 0.5,
								px: 1,
								minWidth: 0,
								fontSize: "0.8125rem",
								"&:hover": {
									backgroundColor: "#c0d8f727",
								},
							}}
							icon={<InfoIcon fontSize="small" />}
							iconPosition="start"
							label="Details"
						/>
						<Tab
							sx={{
								minHeight: 32,
								py: 0.5,
								px: 1,
								minWidth: 0,
								fontSize: "0.8125rem",
								"&:hover": {
									backgroundColor: "#c0d8f727",
								},
							}}
							icon={<RouteIcon fontSize="small" />}
							iconPosition="start"
							label="Itinerary"
						/>
					</Tabs>

					{/* --- Content: Overview --- */}
					<CustomTabPanel value={tabValue} index={0}>
						<Stack spacing={3}>
							{/* Key Metrics Grid */}
							<Grid container spacing={2}>
								<Grid size={{ xs: 6 }}>
									<Paper
										variant="outlined"
										sx={{
											p: 2,
											display: "flex",
											flexDirection: "column",
											gap: 1,
										}}
									>
										<Box
											display="flex"
											alignItems="center"
											gap={1}
											color="text.secondary"
										>
											<BusIcon fontSize="small" />
											<Typography
												variant="caption"
												fontWeight="bold"
											>
												VEHICLE
											</Typography>
										</Box>
										<Typography
											variant="body1"
											fontWeight="500"
										>
											{trip.vehicle
												? trip.vehicle.numberPlate
												: "Unassigned"}
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
											noWrap
										>
											{trip.vehicle?.manufacturer}{" "}
											{trip.vehicle?.model}
										</Typography>
									</Paper>
								</Grid>
								<Grid size={{ xs: 6 }}>
									<Paper
										variant="outlined"
										sx={{
											p: 2,
											display: "flex",
											flexDirection: "column",
											gap: 1,
										}}
									>
										<Box
											display="flex"
											alignItems="center"
											gap={1}
											color="text.secondary"
										>
											<DriverIcon fontSize="small" />
											<Typography
												variant="caption"
												fontWeight="bold"
											>
												DRIVER
											</Typography>
										</Box>
										<Typography
											variant="body1"
											fontWeight="500"
										>
											{/* Placeholder as Driver isn't in Trip type directly yet */}
											Unassigned
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
										>
											--
										</Typography>
									</Paper>
								</Grid>
							</Grid>

							{/* Time Info */}
							<Paper
								elevation={0}
								sx={{
									bgcolor: "grey.50",
									p: 2,
									borderRadius: 2,
								}}
							>
								<Stack spacing={2}>
									<Box
										display="flex"
										justifyContent="space-between"
										alignItems="center"
									>
										<Stack
											direction="row"
											spacing={1.5}
											alignItems="center"
										>
											<Avatar
												sx={{
													width: 32,
													height: 32,
													bgcolor: "primary.light",
												}}
											>
												<CalendarIcon
													sx={{ fontSize: 18 }}
												/>
											</Avatar>
											<Box>
												<Typography
													variant="caption"
													color="text.secondary"
												>
													Departure
												</Typography>
												<Typography
													variant="body2"
													fontWeight="bold"
												>
													{format(
														new Date(
															trip.startTime
														),
														"dd/MM/yyyy"
													)}
												</Typography>
											</Box>
										</Stack>
										<Typography
											variant="h6"
											fontWeight="bold"
											color="primary"
										>
											{format(
												new Date(trip.startTime),
												"HH:mm"
											)}
										</Typography>
									</Box>

									<Divider variant="middle" />

									<Box
										display="flex"
										justifyContent="space-between"
										alignItems="center"
									>
										<Stack
											direction="row"
											spacing={1.5}
											alignItems="center"
										>
											<Avatar
												sx={{
													width: 32,
													height: 32,
													bgcolor: "grey.300",
												}}
											>
												<TimeIcon
													sx={{
														fontSize: 18,
														color: "text.primary",
													}}
												/>
											</Avatar>
											<Box>
												<Typography
													variant="caption"
													color="text.secondary"
												>
													Est. Arrival
												</Typography>
												<Typography
													variant="body2"
													fontWeight="bold"
												>
													{outboundArrival &&
													isValid(outboundArrival)
														? format(
																outboundArrival,
																"dd/MM/yyyy"
														  )
														: "N/A"}
												</Typography>
											</Box>
										</Stack>
										<Typography
											variant="h6"
											fontWeight="bold"
											color="text.secondary"
										>
											{outboundArrival &&
											isValid(outboundArrival)
												? format(
														outboundArrival,
														"HH:mm"
												  )
												: "--:--"}
										</Typography>
									</Box>
								</Stack>
							</Paper>

							{/* Additional Route Info moved to the map overlay above */}
						</Stack>
					</CustomTabPanel>

					{/* --- Content: Itinerary --- */}
					<CustomTabPanel value={tabValue} index={1}>
						<Typography
							gutterBottom
							variant="h6"
							component={"h3"}
							fontWeight={600}
						>
							{trip.route?.name}
						</Typography>
						<Box sx={{ position: "relative", pl: 1, pt: 1 }}>
							{stopsData.map((stop, index) => {
								const isStart = index === 0;
								const isEnd = index === stopsData.length - 1;
								const color = isStart
									? "success.main"
									: isEnd
									? "error.main"
									: "grey.400";
								const Icon = isStart
									? PlaceIcon
									: isEnd
									? FlagIcon
									: BusIcon;

								return (
									<Box
										key={index}
										sx={{
											display: "flex",
											mb: 2,
											position: "relative",
										}}
									>
										{/* Connecting Line */}
										{!isEnd && (
											<Box
												sx={{
													position: "absolute",
													top: 32,
													left: 15,
													bottom: -16,
													width: 2,
													bgcolor: "grey.200",
													zIndex: 0,
												}}
											/>
										)}
										{/* Marker */}
										<Box sx={{ mr: 2, zIndex: 1 }}>
											<Avatar
												sx={{
													width: 32,
													height: 32,
													bgcolor: "background.paper",
													border: "2px solid",
													borderColor: color,
													color: color,
												}}
											>
												<Icon sx={{ fontSize: 16 }} />
											</Avatar>
										</Box>
										{/* Text */}
										<Paper
											elevation={0}
											sx={{
												flex: 1,
												p: 1.5,
												bgcolor: "grey.50",
												borderRadius: 2,
											}}
										>
											<Typography
												variant="subtitle2"
												fontWeight="600"
											>
												{stop.name ||
													`Stop #${index + 1}`}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
											>
												{stop.address ||
													"No address provided"}
											</Typography>
										</Paper>
									</Box>
								);
							})}
						</Box>
					</CustomTabPanel>
				</CardContent>

				{/* --- Footer --- */}
				<CardActions
					sx={{
						p: 2,
						borderTop: "1px solid",
						borderColor: "divider",
					}}
				>
					<Button
						fullWidth
						variant="contained"
						onClick={() => onEdit(trip)}
						startIcon={<EditIcon className="hvr-icon" />}
						className="hvr-icon-pop"
					>
						Edit
					</Button>
					<Button
						fullWidth
						variant="outlined"
						color="inherit"
						startIcon={<ArrowBackIcon className="hvr-icon" />}
						className="hvr-icon-back"
						onClick={onClose}
					>
						Back to list
					</Button>
				</CardActions>
			</Card>
		</Drawer>
	);
};

export default TripDetailsDrawer;
