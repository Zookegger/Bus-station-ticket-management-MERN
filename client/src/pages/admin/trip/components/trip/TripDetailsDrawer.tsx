import React, { useEffect, useState } from "react";
import { Box, Button, Divider, Drawer, Stack, Typography, CircularProgress, Alert } from "@mui/material";
import RouteMap from "@components/map/RouteMap";
import { getRoute, formatDistance, formatDuration, type RouteWithLocations } from "@utils/map";

type TripItem = {
	id: number;
	route: string;
	departure: string;
	arrival: string;
	price: string;
	status?: string;
};

interface TripDetailsDrawerProps {
	open: boolean;
	onClose: () => void;
	trip: TripItem | null;
}

const TripDetailsDrawer: React.FC<TripDetailsDrawerProps> = ({ open, onClose, trip }) => {
	const [routeData, setRouteData] = useState<RouteWithLocations | null>(null);
	const [loadingRoute, setLoadingRoute] = useState(false);
	const [routeError, setRouteError] = useState<string | null>(null);

	// Try to derive numeric coordinates from the trip object in several possible shapes
	const deriveCoords = () => {
		if (!trip) return null;
		const t = trip as any;
		// Common field names: start_lat/start_lon or startLatitude/startLongitude, same for end
		const startLat = t.start_lat ?? t.startLatitude ?? t.startLat ?? t.origin_lat;
		const startLon = t.start_lon ?? t.startLongitude ?? t.startLon ?? t.origin_lon;
		const endLat = t.end_lat ?? t.endLatitude ?? t.endLat ?? t.destination_lat;
		const endLon = t.end_lon ?? t.endLongitude ?? t.endLon ?? t.destination_lon;

		if (
			startLat != null &&
			startLon != null &&
			endLat != null &&
			endLon != null &&
			!isNaN(Number(startLat)) &&
			!isNaN(Number(startLon)) &&
			!isNaN(Number(endLat)) &&
			!isNaN(Number(endLon))
		) {
			return {
				startLat: Number(startLat),
				startLon: Number(startLon),
				endLat: Number(endLat),
				endLon: Number(endLon),
			};
		}

		return null;
	};

	useEffect(() => {
		const coords = deriveCoords();
		if (!coords || !open) {
			setRouteData(null);
			return;
		}

		let mounted = true;
		setLoadingRoute(true);
		setRouteError(null);
		(async () => {
			try {
				const data = await getRoute(coords.startLat, coords.startLon, coords.endLat, coords.endLon);
				if (mounted) setRouteData(data);
			} catch (err) {
				console.error(err);
				if (mounted) setRouteError("Failed to load route data");
			} finally {
				if (mounted) setLoadingRoute(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, [trip, open]);

	return (
		<Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: 480 } } }}>
			<Box sx={{ p: 3 }}>
				<Typography variant="h5" sx={{ fontWeight: "bold", color: "#2E7D32", mb: 2 }}>
					Trip Details
				</Typography>
				{trip ? (
					<Stack spacing={2}>
						<Box>
							<Typography variant="subtitle2" color="text.secondary">
								Route
							</Typography>
							<Typography>{trip.route}</Typography>
						</Box>
						<Divider />
						<Stack direction="row" spacing={2}>
							<Box sx={{ flex: 1 }}>
								<Typography variant="subtitle2" color="text.secondary">
									Departure
								</Typography>
								<Typography>{trip.departure}</Typography>
							</Box>
							<Box sx={{ flex: 1 }}>
								<Typography variant="subtitle2" color="text.secondary">
									Arrival
								</Typography>
								<Typography>{trip.arrival}</Typography>
							</Box>
						</Stack>
						<Divider />
						<Stack direction="row" spacing={2}>
							<Box sx={{ flex: 1 }}>
								<Typography variant="subtitle2" color="text.secondary">
									Total Price
								</Typography>
								<Typography>{trip.price}</Typography>
							</Box>
							<Box sx={{ flex: 1 }}>
								<Typography variant="subtitle2" color="text.secondary">
									Status
								</Typography>
								<Typography>{trip.status}</Typography>
							</Box>
						</Stack>
						<Divider />
						<Box>
							<Typography variant="subtitle2" color="text.secondary" gutterBottom>
								Route Map
							</Typography>
							<Box sx={{ height: 220, borderRadius: 1, overflow: "hidden", border: "1px solid #e0e0e0" }}>
								{loadingRoute ? (
									<Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
										<CircularProgress />
									</Box>
								) : routeError ? (
									<Box sx={{ p: 2 }}>
										<Alert severity="warning">{routeError}</Alert>
									</Box>
								) : (
									<RouteMap route={routeData} height={220} />
								)}
							</Box>
							{routeData && (
								<Box sx={{ mt: 1 }}>
									<Typography variant="body2" color="text.secondary">
										<strong>Distance:</strong> {formatDistance(routeData.route.distance)} | <strong>Duration:</strong> {formatDuration(routeData.route.duration)}
									</Typography>
								</Box>
							)}
						</Box>
						<Stack direction="row" spacing={1}>
							<Button variant="contained" onClick={onClose} sx={{ textTransform: "none", backgroundColor: "#2E7D32", "&:hover": { backgroundColor: "#276a2b" } }}>
								Back to List
							</Button>
							<Button variant="outlined" sx={{ textTransform: "none" }}>
								Edit Trip
							</Button>
						</Stack>
					</Stack>
				) : (
					<Typography>No trip selected</Typography>
				)}
			</Box>
		</Drawer>
	);
};

export default TripDetailsDrawer;
