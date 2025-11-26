import React, { useMemo } from "react";
import { Box, Button, Divider, Drawer, Stack, Typography } from "@mui/material";
import { addSeconds, format, isValid } from "date-fns";
import type { TripAttributes } from "@my-types/trip";

interface TripDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  trip: TripAttributes | null;
  onEdit: (trip: TripAttributes) => void;
}

const TripDetailsDrawer: React.FC<TripDetailsDrawerProps> = ({ open, onClose, trip, onEdit }) => {
	// Calculate outbound arrival time based on start time and route duration
	const outboundArrival = useMemo(() => {
		if (!trip?.startTime || !trip.route?.duration) {
			return null;
		}
		const startTime = new Date(trip.startTime);
		return addSeconds(startTime, trip.route.duration);
	}, [trip]);

	// Calculate return arrival time for round trips
	const returnArrival = useMemo(() => {
		if (!trip?.isRoundTrip || !trip?.returnStartTime || !trip.route?.duration) {
			return null;
		}
		const returnStartTime = new Date(trip.returnStartTime);
		return addSeconds(returnStartTime, trip.route.duration);
	}, [trip]);

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
							<Typography>{trip.route?.name}</Typography>
						</Box>
						<Divider />
						<Stack direction="row" spacing={2}>
							<Box sx={{ flex: 1 }}>
								<Typography variant="subtitle2" color="text.secondary">
									Departure
								</Typography>
								<Typography>{format(new Date(trip.startTime), "dd/MM/yyyy HH:mm")}</Typography>
							</Box>
							<Box sx={{ flex: 1 }}>
								<Typography variant="subtitle2" color="text.secondary">
									Est. Arrival
								</Typography>
								<Typography>
									{outboundArrival && isValid(outboundArrival)
										? format(outboundArrival, "dd/MM/yyyy HH:mm")
										: "N/A"}
								</Typography>
							</Box>
						</Stack>

						{trip.isRoundTrip && trip.returnStartTime && (
							<>
								<Divider />
								<Stack direction="row" spacing={2}>
									<Box sx={{ flex: 1 }}>
										<Typography variant="subtitle2" color="text.secondary">
											Return Departure
										</Typography>
										<Typography>
											{format(new Date(trip.returnStartTime), "dd/MM/yyyy HH:mm")}
										</Typography>
									</Box>
									<Box sx={{ flex: 1 }}>
										<Typography variant="subtitle2" color="text.secondary">
											Est. Return Arrival
										</Typography>
										<Typography>
											{returnArrival && isValid(returnArrival)
												? format(returnArrival, "dd/MM/yyyy HH:mm")
												: "N/A"}
										</Typography>
									</Box>
								</Stack>
							</>
						)}

						<Divider />
						<Stack direction="row" spacing={2}>
							<Box sx={{ flex: 1 }}>
								<Typography variant="subtitle2" color="text.secondary">
									Total Price
								</Typography>
								<Typography>
									{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
										trip.price,
									)}
								</Typography>
							</Box>
							<Box sx={{ flex: 1 }}>
								<Typography variant="subtitle2" color="text.secondary">
									Status
								</Typography>
								<Typography>{trip.status}</Typography>
							</Box>
						</Stack>
						<Divider />
						<Stack direction="row" spacing={1}>
							<Button
								variant="contained"
								onClick={onClose}
								sx={{
									textTransform: "none",
									backgroundColor: "#2E7D32",
									"&:hover": { backgroundColor: "#276a2b" },
								}}
							>
								Back to List
							</Button>
							<Button variant="outlined" sx={{ textTransform: "none" }} onClick={() => onEdit(trip)}>
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
