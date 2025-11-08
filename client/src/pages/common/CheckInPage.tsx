import { API_ENDPOINTS, APP_CONFIG } from "@constants";
import { Check, Close } from "@mui/icons-material";
import { Box, Chip, Paper, Typography } from "@mui/material";
import type {
	Order,
	OrderCheckInRequest,
	OrderCheckInResponse,
} from "@my-types";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

const CheckInPage: React.FC = () => {
	const [is_loading, setIsLoading] = useState(true);
	const [is_checked_in, setIsCheckedIn] = useState(false);
	const [message, setMessage] = useState("");
	const [order, setorder] = useState<Order | null>(null);

	const { orderId } = useParams<{ orderId: string }>(); // Grabs "/:orderId"
	const location = useLocation();

	const token = new URLSearchParams(location.search).get("token");

	useEffect(() => {
		const verifyCheckIn = async () => {
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
				const request: OrderCheckInRequest = {
					orderId: orderId,
					token: token,
				};

				const response: OrderCheckInResponse = await axios.post(
					`${APP_CONFIG.apiBaseUrl}${API_ENDPOINTS.CHECKIN.BASE}`,
					request
				);

				setMessage(response.message);
				setorder(response.order);
				setIsCheckedIn(true);
			} catch (err) {
				if (axios.isAxiosError(err) && err.response) {
					setMessage(
						err.response.data.message ||
							"Invalid or expired ticket."
					);
				} else {
					setMessage("An unknown error occurred.");
				}
			} finally {
				setIsLoading(false);
			}
		};

		verifyCheckIn();
	}, [orderId, token, location]);

	if (is_loading) {
		return (
			<Box>
				<Typography variant="h3">Verifying your ticket...</Typography>
			</Box>
		);
	}

	if (is_checked_in) {
		return (
			<Box>
				<Check color="success" />
				<Typography>{message}</Typography>
				{order && (
                    <>
                        <Typography>{order.id}</Typography>
                        <Typography>{order.status}</Typography>

                        {order.tickets?.map(ticket => {
                            <Typography key={ticket.id}>Seat: {ticket.seat?.number}</Typography>
                        })}
                    </>
                )}
			</Box>
		);
	}
	return (
		// {/* <Box>
        //     <Close color="error" />
		// 	<Typography>{message}</Typography>
		// </Box> */}

        <Paper elevation={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <Typography variant="h4">Verifying your ticket...</Typography>
        </Paper>
	);
};

export default CheckInPage;
