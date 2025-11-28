import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
	Box,
	Typography,
	CircularProgress,
	Button,
	Paper,
} from "@mui/material";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants";

const PaymentResult: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	// State
	const [verifying, setVerifying] = useState(true);
	const [success, setSuccess] = useState(false);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const verifyPayment = async () => {
			// 1. Get query params returned by the gateway (e.g., ?vnp_ResponseCode=00&orderId=...)
			// The params depend heavily on your specific gateway (Momo, VNPay, Stripe, etc.)
			const params = Object.fromEntries(searchParams.entries());

			if (Object.keys(params).length === 0) {
				setVerifying(false);
				setSuccess(false);
				setMessage("No payment information found.");
				return;
			}

			try {
				// 2. Send these params to YOUR backend.
				// NEVER trust the URL params alone. Let the backend validate the signature.
				const res = await callApi({
					method: "GET", // or POST depending on your backend implementation
					url: API_ENDPOINTS.ORDER.VERIFY_PAYMENT,
					params: params, // Send the gateway params to backend
				});

				if (res.status === "success" || res.isPaid) {
					setSuccess(true);
					setMessage("Payment successful! Your seats are booked.");
				} else {
					setSuccess(false);
					setMessage("Payment failed or was cancelled.");
				}
			} catch (err: any) {
				setSuccess(false);
				setMessage(
					err.message || "An error occurred while verifying payment."
				);
			} finally {
				setVerifying(false);
			}
		};

		verifyPayment();
	}, [searchParams]);

	return (
		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			minHeight="60vh"
			p={3}
		>
			<Paper
				elevation={3}
				sx={{ p: 5, textAlign: "center", maxWidth: 500 }}
			>
				{verifying ? (
					<>
						<CircularProgress size={60} sx={{ mb: 3 }} />
						<Typography variant="h6">
							Verifying your transaction...
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Please do not close this window.
						</Typography>
					</>
				) : (
					<>
						{success ? (
							<CheckCircle
								color="success"
								sx={{ fontSize: 80, mb: 2 }}
							/>
						) : (
							<ErrorIcon
								color="error"
								sx={{ fontSize: 80, mb: 2 }}
							/>
						)}

						<Typography variant="h5" fontWeight="bold" gutterBottom>
							{success ? "Booking Confirmed!" : "Payment Failed"}
						</Typography>

						<Typography color="text.secondary" paragraph>
							{message}
						</Typography>

						<Button
							variant="contained"
							onClick={() =>
								navigate(success ? "/my-tickets" : "/")
							}
							sx={{ mt: 2 }}
						>
							{success ? "View My Tickets" : "Return Home"}
						</Button>
					</>
				)}
			</Paper>
		</Box>
	);
};

export default PaymentResult;
