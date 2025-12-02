import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { ROUTES } from "@constants/routes";

const PaymentResult: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState<"success" | "failure" | "error" | null>(null);

	useEffect(() => {
		const statusParam = searchParams.get("status");
		if (statusParam === "success") {
			setStatus("success");
		} else if (statusParam === "failure") {
			setStatus("failure");
		} else {
			setStatus("error");
		}
	}, [searchParams]);

	const handleGoHome = () => {
		navigate(ROUTES.HOME);
	};

	const handleGoToOrders = () => {
		navigate(ROUTES.PROFILE);
	};

	if (!status) {
		return null;
	}

	return (
		<Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
			<Paper elevation={3} sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
				<Box sx={{ mb: 2 }}>
					{status === "success" ? (
						<CheckCircleOutlineIcon color="success" sx={{ fontSize: 80 }} />
					) : (
						<ErrorOutlineIcon color="error" sx={{ fontSize: 80 }} />
					)}
				</Box>

				<Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
					{status === "success" ? "Payment Successful!" : "Payment Failed"}
				</Typography>

				<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
					{status === "success"
						? "Thank you for your purchase. Your booking has been confirmed."
						: "We were unable to process your payment. Please try again or contact support."}
				</Typography>

				<Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
					<Button variant="outlined" onClick={handleGoHome}>
						Back to Home
					</Button>
					{status === "success" && (
						<Button variant="contained" onClick={handleGoToOrders}>
							View My Orders
						</Button>
					)}
				</Box>
			</Paper>
		</Container>
	);
};

export default PaymentResult;
