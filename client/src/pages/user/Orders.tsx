import React, { useEffect, useState } from "react";
import {
	Box,
	Container,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	CircularProgress,
	Alert,
	Button,
} from "@mui/material";
import { useAuth } from "@hooks/useAuth";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/api";
import type { Order } from "@my-types/order";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const UserOrders: React.FC = () => {
	const { user } = useAuth();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchOrders = async () => {
			if (!user) return;
			try {
				const response = await callApi<Order[]>({
					method: "GET",
					url: API_ENDPOINTS.ORDER.BY_USER.replace(":id", user.id),
				});
				if (!Array.isArray(response)) {
					throw new Error("");
				}
				setOrders(response as Order[]);
			} catch (err: any) {
				setError(err.message || "Failed to fetch orders");
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, [user]);

	if (loading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="60vh"
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h4" gutterBottom>
				My Orders
			</Typography>

			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}

			{orders.length === 0 ? (
				<Paper sx={{ p: 3, textAlign: "center" }}>
					<Typography variant="body1" color="text.secondary">
						You haven't placed any orders yet.
					</Typography>
				</Paper>
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
										$
										{Number(order.totalFinalPrice).toFixed(
											2
										)}
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
												// navigate(`/orders/${order.id}`);
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
		</Container>
	);
};

export default UserOrders;
