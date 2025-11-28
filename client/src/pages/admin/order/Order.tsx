import { useEffect, useMemo, useState } from "react";
import {
	Paper,
	Typography,
	Box,
	TextField,
	InputAdornment,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	IconButton,
	Alert,
} from "@mui/material";
import {
	Search as SearchIcon,
	Clear as ClearIcon,
	ErrorOutline as ErrorIcon,
} from "@mui/icons-material";
import { DataGridPageLayout } from "@components/admin";
import {
	OrderConfirmCancelDialog,
	OrderDetailDialog,
	OrderTable,
} from "./components";
import type { Order } from "@my-types/order";
import type { Ticket } from "@my-types/ticket";
import { OrderStatus } from "@my-types/order";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";

export default function OrderManagement() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">(
		"all"
	);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [ticketToCancel, setTicketToCancel] = useState<Ticket | null>(null);
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchOrders = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await callApi<Order[]>({
					method: "GET",
					url: API_ENDPOINTS.ORDER.BASE,
				});
				setOrders(Array.isArray(data) ? data : []);
			} catch (e: any) {
				setError(e?.message || "Failed to load orders");
				setOrders([]);
			} finally {
				setLoading(false);
			}
		};
		fetchOrders();
	}, []);

	const statusOptions = [
		{ value: "all", label: "All" },
		...Object.values(OrderStatus).map((status) => ({
			value: status,
			label:
				status === OrderStatus.CONFIRMED
					? "Paid"
					: status === OrderStatus.PENDING
					? "Awaiting Payment"
					: status === OrderStatus.CANCELLED
					? "Cancelled"
					: status === OrderStatus.PARTIALLY_REFUNDED
					? "Partially Refunded"
					: status === OrderStatus.REFUNDED
					? "Refunded"
					: status === OrderStatus.EXPIRED
					? "Expired"
					: status,
		})),
	];

	const filteredOrders = useMemo(() => {
		const q = search.trim().toLowerCase();
		return orders.filter((order) => {
			const matchesSearch =
				!q ||
				order.id.toLowerCase().includes(q) ||
				(order.user?.userName || "").toLowerCase().includes(q) ||
				(order.user?.email || "").toLowerCase().includes(q) ||
				(order.user?.phoneNumber || "").toLowerCase().includes(q) ||
				(order.guestPurchaserName || "").toLowerCase().includes(q) ||
				(order.guestPurchaserEmail || "").toLowerCase().includes(q) ||
				(order.guestPurchaserPhone || "").toLowerCase().includes(q);

			const matchesStatus =
				statusFilter === "all" || order.status === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [orders, search, statusFilter]);

	const handleRefundOrder = () => {
		alert(`Full refund of order ${selectedOrder?.id}`);
		setSelectedOrder(null);
	};

	return (
		<DataGridPageLayout
			title="Order & Ticket Management"
			actionBar={
				<Box
					sx={{
						display: "flex",
						gap: 2,
						alignItems: "center",
						flexWrap: "wrap",
					}}
				>
					<TextField
						size="small"
						placeholder="Search orders..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						sx={{ minWidth: 300 }}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
								endAdornment: search && (
									<InputAdornment position="end">
										<IconButton
											size="small"
											onClick={() => setSearch("")}
										>
											<ClearIcon fontSize="small" />
										</IconButton>
									</InputAdornment>
								),
							},
						}}
					/>
					<FormControl size="small" sx={{ minWidth: 200 }}>
						<InputLabel>Status</InputLabel>
						<Select
							value={statusFilter}
							label="Status"
							onChange={(e) =>
								setStatusFilter(
									e.target.value as OrderStatus | "all"
								)
							}
						>
							{statusOptions.map((option) => (
								<MenuItem
									key={option.value}
									value={option.value}
								>
									{option.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>
			}
		>
			{error && (
				<Alert
					color="error"
					icon={<ErrorIcon />}
					sx={{ marginBottom: 2 }}
				>
					<Typography>{error}</Typography>
				</Alert>
			)}

			<Paper elevation={3} sx={{ width: "100%" }}>
				<OrderTable
					orders={filteredOrders}
					loading={loading}
					onViewDetail={setSelectedOrder}
				/>
			</Paper>

			<OrderDetailDialog
				order={selectedOrder}
				open={!!selectedOrder}
				onClose={() => setSelectedOrder(null)}
				onRefundOrder={handleRefundOrder}
				onCancelTicket={setTicketToCancel}
			/>

			{/* Confirm Cancel Ticket */}
			{ticketToCancel && (
				<OrderConfirmCancelDialog
					ticketToCancel={ticketToCancel}
					onClose={() => {
						setTicketToCancel(null);
					}}
				/>
			)}
		</DataGridPageLayout>
	);
}
