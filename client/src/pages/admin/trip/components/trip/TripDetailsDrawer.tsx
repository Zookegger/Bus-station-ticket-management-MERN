import React, { useMemo } from "react";
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Divider,
	Drawer,
	Stack,
	Typography,
	Chip,
} from "@mui/material";
import { addSeconds, format, isValid } from "date-fns";
import type { Trip } from "@my-types/trip";
import { ArrowBack, Edit as EditIcon } from "@mui/icons-material";

interface TripDetailsDrawerProps {
	open: boolean;
	onClose: () => void;
	trip: Trip | null;
	onEdit: (trip: Trip) => void;
}

const TripDetailsDrawer: React.FC<TripDetailsDrawerProps> = ({
	open,
	onClose,
	trip,
	onEdit,
}) => {
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
		if (
			!trip?.isRoundTrip ||
			!trip?.returnStartTime ||
			!trip.route?.duration
		) {
			return null;
		}
		const returnStartTime = new Date(trip.returnStartTime);
		return addSeconds(returnStartTime, trip.route.duration);
	}, [trip]);

	// Header chips: status, return, template, repeating
	const headerChips = useMemo<React.ReactNode | null>(() => {
		if (!trip) return null;
		const chips: React.ReactNode[] = [];

		if (trip.status) {
			const statusText = String(trip.status).toLowerCase();
			let color: any = "default";
			if (
				statusText.includes("cancel") ||
				statusText.includes("canceled")
			)
				color = "error";
			else if (statusText.includes("pending")) color = "warning";
			else if (
				statusText.includes("confirm") ||
				statusText.includes("active") ||
				statusText.includes("open")
			)
				color = "success";
			else color = "primary";
			chips.push(
				<Chip
					key="status"
					size="small"
					label={String(trip.status)}
					color={color}
					sx={{ fontWeight: 600 }}
				/>
			);
		}

		const isReturn = !!(
			(trip as any).isReturnTrip ||
			trip.returnTripId ||
			(trip as any).returnTrip
		);
		if (isReturn) {
			chips.push(
				<Chip
					key="return"
					size="small"
					label="Return"
					variant="outlined"
					color="default"
					sx={{ borderWidth: 1 }}
				/>
			);
		}

		// Round trip indicator (separate from return trip marker)
		if (trip.isRoundTrip || trip.returnStartTime || trip.returnTripId) {
			chips.push(
				<Chip
					key="round"
					size="small"
					label="Round Trip"
					variant="outlined"
					color="info"
					sx={{ borderWidth: 1 }}
				/>
			);
		}

		const isTemplate = !!((trip as any).isTemplate || trip.templateTripId);
		if (isTemplate) {
			chips.push(
				<Chip
					key="template"
					size="small"
					label="Template"
					variant="outlined"
					color="secondary"
					sx={{ borderWidth: 1 }}
				/>
			);
		}

		const isRepeating = !!(
			(trip as any).repeatFrequency &&
			String((trip as any).repeatFrequency).toLowerCase() !== "none"
		);
		if (isRepeating)
			chips.push(
				<Chip
					key="repeating"
					size="small"
					label="Repeating"
					variant="outlined"
					color="warning"
					sx={{ borderWidth: 1 }}
				/>
			);

		return (
			<Stack direction="row" spacing={1}>
				{chips}
			</Stack>
		);
	}, [trip]);

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			slotProps={{ paper: { sx: { width: 480 } } }}
		>
			<Card sx={{ p: 1 }}>
				{trip ? (
					<>
						<CardHeader
							title={
								<Stack>
									<Typography
										variant="h5"
										sx={{
											fontWeight: "bold",
											color: "#2E7D32",
											mb: 2,
										}}
									>
										Trip Details
									</Typography>
									{headerChips}
								</Stack>
							}
							action={
								<Button
									fullWidth
									variant="text"
									sx={{ textTransform: "none" }}
									onClick={onClose}
									className="hvr-icon-back"
								>
									<ArrowBack className="hvr-icon" />
								</Button>
							}
						/>
						<CardContent>
							<Stack spacing={2}>
								<Box>
									<Typography
										variant="subtitle2"
										color="text.secondary"
									>
										Route
									</Typography>
									<Typography>{trip.route?.name}</Typography>
								</Box>
								<Divider />
								<Stack direction="row" spacing={2}>
									<Box sx={{ flex: 1 }}>
										<Typography
											variant="subtitle2"
											color="text.secondary"
										>
											Departure
										</Typography>
										<Typography>
											{format(
												new Date(trip.startTime),
												"dd/MM/yyyy HH:mm"
											)}
										</Typography>
									</Box>
									<Box sx={{ flex: 1 }}>
										<Typography
											variant="subtitle2"
											color="text.secondary"
										>
											Est. Arrival
										</Typography>
										<Typography>
											{outboundArrival &&
											isValid(outboundArrival)
												? format(
														outboundArrival,
														"dd/MM/yyyy HH:mm"
												  )
												: "N/A"}
										</Typography>
									</Box>
								</Stack>

								{trip.isRoundTrip && trip.returnStartTime && (
									<>
										<Divider />
										<Stack direction="row" spacing={2}>
											<Box sx={{ flex: 1 }}>
												<Typography
													variant="subtitle2"
													color="text.secondary"
												>
													Return Departure
												</Typography>
												<Typography>
													{format(
														new Date(
															trip.returnStartTime
														),
														"dd/MM/yyyy HH:mm"
													)}
												</Typography>
											</Box>
											<Box sx={{ flex: 1 }}>
												<Typography
													variant="subtitle2"
													color="text.secondary"
												>
													Est. Return Arrival
												</Typography>
												<Typography>
													{returnArrival &&
													isValid(returnArrival)
														? format(
																returnArrival,
																"dd/MM/yyyy HH:mm"
														  )
														: "N/A"}
												</Typography>
											</Box>
										</Stack>
									</>
								)}

								<Divider />

								<Stack direction="row" spacing={2}>
									<Box sx={{ flex: 1 }}>
										<Typography
											variant="subtitle2"
											color="text.secondary"
										>
											Total Price
										</Typography>
										<Typography>
											{new Intl.NumberFormat("vi-VN", {
												style: "currency",
												currency: "VND",
											}).format(trip.price)}
										</Typography>
									</Box>
									<Box sx={{ flex: 1 }}>
										<Typography
											variant="subtitle2"
											color="text.secondary"
										>
											Status
										</Typography>
										<Typography>
											{trip.status ?? "N/A"}
										</Typography>
									</Box>
								</Stack>
							</Stack>
						</CardContent>

						<Divider />
						<CardActions>
							<Button
								fullWidth
								variant="contained"
								onClick={() => onEdit(trip)}
								sx={{
									textTransform: "none",
									backgroundColor: "#2E7D32",
									"&:hover": {
										backgroundColor: "#276a2b",
									},
								}}
								className="hvr-icon-grow"
								startIcon={<EditIcon className="hvr-icon" />}
							>
								Edit Trip
							</Button>
							<Button
								fullWidth
								variant="outlined"
								sx={{ textTransform: "none" }}
								onClick={onClose}
								className="hvr-icon-back"
								startIcon={<ArrowBack className="hvr-icon" />}
							>
								Back to List
							</Button>
						</CardActions>
					</>
				) : (
					<Typography>No trip selected</Typography>
				)}
			</Card>
		</Drawer>
	);
};

export default TripDetailsDrawer;
