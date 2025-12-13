import React, { useState } from "react";
import {
	Box,
	Container,
	Typography,
	Paper,
	TextField,
	Button,
	Alert,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	CircularProgress,
} from "@mui/material";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/api";
import type { Order } from "@my-types/order";
import { format } from "date-fns";
import { formatCurrency } from "@utils/formatting";

const OrderLookup: React.FC = () => {
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [orders, setOrders] = useState<Order[] | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleLookup = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !phone) {
			setError("Please provide both email and phone number.");
			return;
		}

		setLoading(true);
		setError(null);
		setOrders(null);

		try {
			const response = await callApi<Order[]>({
				method: "GET",
				url: API_ENDPOINTS.ORDER.BY_GUEST,
				params: { email, phone },
			});
         if (!Array.isArray(response)) {
            throw new Error("");
         }
			setOrders(response as Order[]);
		} catch (err: any) {
			setError(err.message || "Failed to find orders.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="md" sx={{ py: 8 }}>
			<Paper sx={{ p: 4, mb: 4 }}>
				<Typography variant="h4" gutterBottom align="center">
					Find Your Order
				</Typography>
				<Typography
					variant="body1"
					color="text.secondary"
					align="center"
					sx={{ mb: 4 }}
				>
					Enter the email address and phone number used during booking to
					retrieve your order details.
				</Typography>

				<Box
					component="form"
					onSubmit={handleLookup}
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 2,
						maxWidth: 400,
						mx: "auto",
					}}
				>
					<TextField
						label="Email Address"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						fullWidth
					/>
					<TextField
						label="Phone Number"
						type="tel"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						required
						fullWidth
					/>
					<Button
						type="submit"
						variant="contained"
						size="large"
						disabled={loading}
						fullWidth
					>
						{loading ? <CircularProgress size={24} /> : "Find Orders"}
					</Button>
				</Box>

				{error && (
					<Alert severity="error" sx={{ mt: 3 }}>
						{error}
					</Alert>
				)}
			</Paper>

			{orders && (
				<Box>
					<Typography variant="h5" gutterBottom>
						Found {orders.length} Order(s)
					</Typography>
					{orders.length === 0 ? (
						<Alert severity="info">
							No orders found matching these details.
						</Alert>
					) : (
						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>Order ID</TableCell>
										<TableCell>Date</TableCell>
										<TableCell>Total</TableCell>
										<TableCell>Status</TableCell>
										<TableCell>Actions</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{orders.map((order) => (
										<TableRow key={order.id}>
											<TableCell>
												{order.id.substring(0, 8)}...
											</TableCell>
											<TableCell>
												{format(
													new Date(order.createdAt!.toString()),
													"MMM dd, yyyy HH:mm"
												)}
											</TableCell>
											<TableCell>
												{formatCurrency(order.totalFinalPrice,"VND","vi-VN")}
											</TableCell>
											<TableCell>
												<Chip
													label={order.status}
													color={
														order.status === "CONFIRMED"
															? "success"
															: order.status === "PENDING"
															? "warning"
															: "error"
													}
													size="small"
												/>
											</TableCell>
											<TableCell>
												<Button
													variant="outlined"
													size="small"
													onClick={() => {
														// TODO: Navigate to order details
													}}
												>
													View Details
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</Box>
			)}
		</Container>
	);
};

export default OrderLookup;
