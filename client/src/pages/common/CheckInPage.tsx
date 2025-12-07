import { API_ENDPOINTS, APP_CONFIG } from "@constants/index";
import { Check } from "@mui/icons-material";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import type {
	Order,
	OrderCheckInRequest,
	OrderCheckInResponse,
} from "@my-types";
import callApi from "@utils/apiCaller";
import { Activity, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

const CheckInPage: React.FC = () => {
	const [is_loading, setIsLoading] = useState(true);
	const [is_checked_in, setIsCheckedIn] = useState(false);
	const [message, setMessage] = useState("");
	const [order, setOrder] = useState<Order | null>(null);

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

				const verify_endpoint = `${
					APP_CONFIG.apiBaseUrl
				}${API_ENDPOINTS.CHECKIN.VERIFY.replace(":orderId", orderId)}`;

				// callApi returns OrderCheckInResponse when returnFullResponse is not set
				const response = (await callApi<OrderCheckInResponse>({
					method: "POST",
					url: verify_endpoint,
					data: request,
				})) as OrderCheckInResponse;

				// Validate the response
				if (!response || !response.order) {
					throw new Error(
						response?.message || "Check-in verification failed."
					);
				}

				setOrder(response.order);
				setIsCheckedIn(true);
			} catch (err: any) {
				setMessage(err.message || "Invalid or expired ticket.");
			} finally {
				setIsLoading(false);
			}
		};

		verifyCheckIn();
	}, [orderId, token, location]);

	return (
		<Paper
			elevation={4}
			sx={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				p: 4,
				flex: 1,
			}}
		>
			<Activity
				mode={is_loading ? "visible" : "hidden"}
				children={<CircularProgress size={"6rem"} />}
			/>
			{is_checked_in ? (
				<>
					<Activity
						mode={!is_loading ? "visible" : "hidden"}
						children={
							<>
								<Check
									color="success"
									sx={{ fontSize: 64, mb: 2 }}
								/>
								<Typography
									variant="h4"
									color="success.main"
									gutterBottom
								>
									Check-in Successful!
								</Typography>
								<Typography
									variant="body1"
									color="text.secondary"
									gutterBottom
								>
									Your ticket has been verified.
								</Typography>
								{order && (
									<Box
										sx={{
											mt: 3,
											textAlign: "left",
											width: "100%",
											maxWidth: 400,
										}}
									>
										<Typography variant="h6" gutterBottom>
											Order Details
										</Typography>
										<Typography>
											<strong>Order ID:</strong>{" "}
											{order.id}
										</Typography>
										<Typography>
											<strong>Status:</strong>{" "}
											{order.status}
										</Typography>
										<Typography
											variant="h6"
											sx={{ mt: 2, mb: 1 }}
										>
											Tickets
										</Typography>
										{order.tickets?.map((ticket) => (
											<Typography key={ticket.id}>
												<strong>Seat:</strong>{" "}
												{ticket.seat?.number}
											</Typography>
										))}
									</Box>
								)}
							</>
						}
					/>
				</>
			) : (
				<>
					<Activity
						mode={!is_loading ? "visible" : "hidden"}
						children={
							<>
								<Typography
									variant="h4"
									color="error"
									gutterBottom
								>
									Check-in Failed
								</Typography>
								<Typography
									variant="body1"
									color="text.secondary"
								>
									{message}
								</Typography>
							</>
						}
					/>
				</>
			)}
		</Paper>
	);
};

export default CheckInPage;
