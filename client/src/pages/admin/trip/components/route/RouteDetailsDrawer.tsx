import {
	Button,
	Card,
	CardContent,
	CardHeader,
	Drawer,
	IconButton,
	Stack,
	Typography,
	Grid,
	CardActions,
	Alert,
	CircularProgress,
} from "@mui/material";
import { Box } from "@mui/system";
import { GridCloseIcon } from "@mui/x-data-grid";
import type { Route } from "@my-types/route";
import { RouteMap } from "@components/map";
import { useAutoRoute } from "@hooks/map";
import { formatDistance, formatDuration } from "@utils/map";

/**
 * Mock Route type for current implementation (temporary).
 * TODO: Replace with proper Route type from @my-types/route once API integration is complete.
 */
interface MockRoute {
	id: number;
	departure: string;
	destination: string;
	price: string;
}

/**
 * Props interface for RouteDetailsDrawer component.
 * @interface RouteDetailsDrawerProps
 * @property {boolean} open - Controls drawer visibility
 * @property {() => void} onClose - Callback when drawer closes
 * @property {Route | MockRoute | null} route - The route object to display
 * @property {(route: Route | MockRoute) => void} [onEdit] - Optional callback for edit action
 * @property {(route: Route | MockRoute) => void} [onDelete] - Optional callback for delete action
 */
interface RouteDetailsDrawerProps {
	open: boolean;
	onClose: () => void;
	route: Route | MockRoute | null;
	onEdit?: (route: Route | MockRoute) => void;
	onDelete?: (route: Route | MockRoute) => void;
}

/**
 * Type guard to check if route is a proper Route type (not mock).
 */
const isProperRoute = (route: Route | MockRoute): route is Route => {
	return "startLocation" in route || "destination" in route;
};

/**
 * Renders a drawer that shows a read-only summary of the selected route.
 * Follows the same pattern as CouponDetailsDrawer for consistency.
 *
 * @param {RouteDetailsDrawerProps} props - Component props injected from the route grid interactions.
 * @returns {JSX.Element} React node containing route information.
 */
const RouteDetailsDrawer: React.FC<RouteDetailsDrawerProps> = ({
	open,
	onClose,
	route,
	onEdit,
	onDelete,
}) => {
	// Auto-calculate route if we have valid coordinates (only for proper Route types)
	const isProper = route && isProperRoute(route);
	const startLat = isProper ? route.startLocation?.latitude : null;
	const startLon = isProper ? route.startLocation?.longitude : null;
	const endLat = isProper ? route.destination?.latitude : null;
	const endLon = isProper ? route.destination?.longitude : null;

	const {
		route: calculatedRoute,
		isLoading: routeLoading,
		error: routeError,
	} = useAutoRoute(
		startLat ?? null,
		startLon ?? null,
		endLat ?? null,
		endLon ?? null
	);

	/**
	 * Invokes the upstream edit handler with the currently selected route.
	 * @returns {void}
	 */
	const handleEditClick = (): void => {
		if (!route || !onEdit) {
			return;
		}

		onEdit(route);
	};

	/**
	 * Invokes the upstream delete handler with the currently selected route.
	 * @returns {void}
	 */
	const handleDeleteClick = (): void => {
		if (!route || !onDelete) {
			return;
		}

		onDelete(route);
	};

	/**
	 * Check if route has valid coordinates.
	 */
	const hasValidCoordinates =
		startLat != null && startLon != null && endLat != null && endLon != null;

	/**
	 * Get display name for departure location.
	 */
	const getDepartureDisplay = (): string => {
		if (!route) return "Unknown";
		if (isProperRoute(route)) {
			return route.startLocation?.name || "Unknown";
		}
		return (route as MockRoute).departure;
	};

	/**
	 * Get display name for destination location.
	 */
	const getDestinationDisplay = (): string => {
		if (!route) return "Unknown";
		if (isProperRoute(route)) {
			return route.destination?.name || "Unknown";
		}
		return (route as MockRoute).destination;
	};

	/**
	 * Get formatted price.
	 */
	const getPriceDisplay = (): string => {
		if (!route) return "N/A";
		if (isProperRoute(route)) {
			return route.price ? `${route.price.toLocaleString("vi-VN")} VND` : "N/A";
		}
		return (route as MockRoute).price;
	};

	return (
		<Drawer anchor="right" open={open} onClose={onClose}>
			<Box
				sx={{
					p: 3,
					height: "100%",
					display: "flex",
					flexDirection: "column",
					width: 400,
					maxWidth: "100vw",
				}}
			>
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
						Route Details
					</Typography>
					<IconButton onClick={onClose} size="small">
						<GridCloseIcon />
					</IconButton>
				</Box>

				<Box p={0}>
					{route ? (
						<Grid container spacing={2}>
							<Grid size={12}>
								<Card>
									<CardHeader
										title={`${getDepartureDisplay()} → ${getDestinationDisplay()}`}
										subheader={`Route ID: ${route.id}`}
									/>
									<CardContent>
										<Stack spacing={2}>
											<Grid container spacing={2}>
												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Route ID
													</Typography>
													<Typography variant="body1">
														{route.id}
													</Typography>
												</Grid>
												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Price
													</Typography>
													<Typography
														variant="body1"
														sx={{
															fontWeight: "medium",
															color: "#2e7d32",
														}}
													>
														{getPriceDisplay()}
													</Typography>
												</Grid>
												<Grid size={12}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Departure Location
													</Typography>
													<Typography variant="body1">
														{getDepartureDisplay()}
													</Typography>
													{isProper && route.startLocation?.address && (
														<Typography
															variant="body2"
															color="text.secondary"
														>
															{route.startLocation.address}
														</Typography>
													)}
												</Grid>
												<Grid size={12}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Destination Location
													</Typography>
													<Typography variant="body1">
														{getDestinationDisplay()}
													</Typography>
													{isProper && route.destination?.address && (
														<Typography
															variant="body2"
															color="text.secondary"
														>
															{route.destination.address}
														</Typography>
													)}
												</Grid>

												{/* Route Information */}
												{hasValidCoordinates && (
													<>
														{routeLoading && (
															<Grid size={12}>
																<Box
																	sx={{
																		display: "flex",
																		alignItems: "center",
																		gap: 1,
																	}}
																>
																	<CircularProgress size={16} />
																	<Typography variant="body2">
																		Loading route...
																	</Typography>
																</Box>
															</Grid>
														)}
														{routeError && (
															<Grid size={12}>
																<Alert severity="warning">
																	Could not calculate route
																	path
																</Alert>
															</Grid>
														)}
														{calculatedRoute && (
															<>
																<Grid size={{ xs: 12, sm: 6 }}>
																	<Typography
																		variant="subtitle2"
																		color="text.secondary"
																	>
																		Distance
																	</Typography>
																	<Typography variant="body1">
																		{formatDistance(
																			calculatedRoute.route
																				.distance
																		)}
																	</Typography>
																</Grid>
																<Grid size={{ xs: 12, sm: 6 }}>
																	<Typography
																		variant="subtitle2"
																		color="text.secondary"
																	>
																		Duration
																	</Typography>
																	<Typography variant="body1">
																		{formatDuration(
																			calculatedRoute.route
																				.duration
																		)}
																	</Typography>
																</Grid>
															</>
														)}
													</>
												)}

												{/* Map Display */}
												{hasValidCoordinates ? (
													<Grid size={12}>
														<Typography
															variant="subtitle2"
															color="text.secondary"
															sx={{ mb: 1 }}
														>
															Route Map
														</Typography>
														<RouteMap
															route={calculatedRoute}
															height={300}
														/>
													</Grid>
												) : (
													<Grid size={12}>
														<Alert severity="info">
															No map data available. Location
															coordinates are missing.
														</Alert>
													</Grid>
												)}
											</Grid>
										</Stack>
									</CardContent>
									<CardActions>
										<Stack direction="row" spacing={1}>
											{onEdit ? (
												<Button
													size="small"
													variant="outlined"
													onClick={handleEditClick}
												>
													Edit
												</Button>
											) : null}
											{onDelete ? (
												<Button
													color="error"
													size="small"
													variant="outlined"
													onClick={handleDeleteClick}
												>
													Delete
												</Button>
											) : null}
										</Stack>
									</CardActions>
								</Card>
							</Grid>
						</Grid>
					) : (
						<Typography color="text.secondary">
							Select a route from the table to view its details.
						</Typography>
					)}
				</Box>
			</Box>
		</Drawer>
	);
};

export default RouteDetailsDrawer;
