import React, { useEffect, useState } from "react";
import { Box, Button, Divider, Drawer, Stack, Typography, CircularProgress, Alert } from "@mui/material";
import RouteMap from "@components/map/RouteMap";
import { getRoute, formatDistance, formatDuration, type RouteWithLocations } from "@utils/map";
import type { TripItemDTO } from "@my-types/TripDTOs";

interface TripDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  trip: TripItemDTO | null;
}

const TripDetailsDrawer: React.FC<TripDetailsDrawerProps> = ({ open, onClose, trip }) => {
	const [routeData, setRouteData] = useState<RouteWithLocations | null>(null);
	const [loadingRoute, setLoadingRoute] = useState(false);
	const [routeError, setRouteError] = useState<string | null>(null);

	// Try to derive numeric coordinates from the trip object in several possible shapes
  const deriveCoords = () => {
    // TripItemDTO does not carry coordinate info; return null so map remains placeholder.
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
						<Typography variant="subtitle2" color="text.secondary">Route</Typography>
						<Typography>{trip.route}</Typography>
					</Box>
					<Divider />
					<Stack direction="row" spacing={2}>
						<Box sx={{ flex: 1 }}>
							<Typography variant="subtitle2" color="text.secondary">Departure</Typography>
							<Typography>{trip.departure}</Typography>
						</Box>
						<Box sx={{ flex: 1 }}>
							<Typography variant="subtitle2" color="text.secondary">Arrival</Typography>
							<Typography>{trip.arrival}</Typography>
						</Box>
					</Stack>
					<Divider />
					<Stack direction="row" spacing={2}>
						<Box sx={{ flex: 1 }}>
							<Typography variant="subtitle2" color="text.secondary">Total Price</Typography>
							<Typography>{trip.price}</Typography>
						</Box>
						<Box sx={{ flex: 1 }}>
							<Typography variant="subtitle2" color="text.secondary">Status</Typography>
							<Typography>{trip.status}</Typography>
						</Box>
					</Stack>
					<Divider />
					<Box>
						<Typography variant="subtitle2" color="text.secondary" gutterBottom>Route Map</Typography>
						<Box sx={{ height: 220, borderRadius: 1, overflow: "hidden", border: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
							<Typography variant="caption" color="text.secondary">Route map unavailable for this trip item</Typography>
						</Box>
					</Box>
					<Stack direction="row" spacing={1}>
						<Button variant="contained" onClick={onClose} sx={{ textTransform: "none", backgroundColor: "#2E7D32", "&:hover": { backgroundColor: "#276a2b" } }}>
							Back to List
						</Button>
						<Button variant="outlined" sx={{ textTransform: "none" }}>Edit Trip</Button>
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
