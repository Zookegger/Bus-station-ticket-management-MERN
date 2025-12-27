import { API_ENDPOINTS, APP_CONFIG } from "@constants/index";
import { Box, CircularProgress, Paper, Typography, Divider, Grid, Chip, Container } from "@mui/material";
import type { Order } from "@my-types";
import callApi from "@utils/apiCaller";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { format } from "date-fns";

const BoardingPassPage: React.FC = () => {
	const [is_loading, setIsLoading] = useState(true);
	const [message, setMessage] = useState("");
	const [order, setOrder] = useState<Order | null>(null);

	const { orderId } = useParams<{ orderId: string }>();
	const location = useLocation();

	const token = new URLSearchParams(location.search).get("token");

	useEffect(() => {
		const fetchOrder = async () => {
			if (!token) {
				setMessage("Security token is missing.");
				setIsLoading(false);
				return;
			}

			if (!orderId) {
				setMessage("Order ID is missing.");
				setIsLoading(false);
				return;
			}

			try {
				const endpoint = `${
					APP_CONFIG.apiBaseUrl
				}${API_ENDPOINTS.CHECKIN.VERIFY.replace(":orderId", orderId)}?token=${token}`;

				// We use GET now
				const response = (await callApi<{ message: string; order: Order }>({
					method: "GET",
					url: endpoint,
				})) as { message: string; order: Order };

				if (!response || !response.order) {
					throw new Error("Failed to load boarding pass.");
				}

				setOrder(response.order);
			} catch (err: any) {
				setMessage(err.message || "Invalid or expired ticket.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrder();
	}, [orderId, token]);

    // Generate the check-in URL that the driver scans
    const checkInUrl = `${window.location.origin}/check-in/${orderId}?token=${token}`;

	if (is_loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
				<CircularProgress />
			</Box>
		);
	}

	if (message || !order) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" flexDirection="column">
				<Typography variant="h5" color="error" gutterBottom>
					Error
				</Typography>
				<Typography>{message}</Typography>
			</Box>
		);
	}

	return (
		<Container maxWidth="sm" sx={{ py: 4 }}>
			<Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
				<Box textAlign="center" mb={3}>
					<Typography variant="h4" fontWeight="bold" color="primary">
						Boarding Pass
					</Typography>
					<Typography variant="subtitle1" color="text.secondary">
						Order #{order.id.slice(0, 8)}
					</Typography>
				</Box>

				<Box display="flex" justifyContent="center" mb={4}>
					<Box p={2} border="1px solid #eee" borderRadius={2}>
						<QRCode value={checkInUrl} size={200} />
					</Box>
				</Box>
                <Typography align="center" variant="caption" display="block" gutterBottom>
                    Scan this QR code at the bus station
                </Typography>

				<Divider sx={{ my: 3 }} />

				<Box mb={3}>
					<Typography variant="h6" gutterBottom>
						Trip Details
					</Typography>
                    {order.tickets && order.tickets.length > 0 && (
                        <>
                            <Typography variant="body1">
                                <strong>Route:</strong> {order.tickets[0].seat?.trip?.route?.name || "N/A"}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Departure:</strong> {order.tickets[0].seat?.trip?.startTime ? format(new Date(order.tickets[0].seat.trip.startTime), "dd/MM/yyyy HH:mm") : "N/A"}
                            </Typography>
                             <Typography variant="body1">
                                <strong>Vehicle:</strong> {order.tickets[0].seat?.trip?.vehicle?.numberPlate || "N/A"}
                            </Typography>
                        </>
                    )}
				</Box>

                <Divider sx={{ my: 3 }} />

				<Box>
					<Typography variant="h6" gutterBottom>
						Passengers & Seats
					</Typography>
					<Grid container spacing={2}>
						{order.tickets?.map((ticket: any) => (
							<Grid size={{ xs: 12 }} key={ticket.id}>
								<Box display="flex" justifyContent="space-between" alignItems="center" p={1} bgcolor="#f9f9f9" borderRadius={1}>
									<Box>
										<Typography variant="body2" fontWeight="bold">
											Seat {ticket.seat?.number}
										</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {ticket.passengerName || "Guest"}
                                        </Typography>
									</Box>
                                    <Chip label={ticket.status} color={ticket.status === 'booked' ? 'success' : 'default'} size="small" />
								</Box>
							</Grid>
						))}
					</Grid>
				</Box>
			</Paper>
		</Container>
	);
};

export default BoardingPassPage;
