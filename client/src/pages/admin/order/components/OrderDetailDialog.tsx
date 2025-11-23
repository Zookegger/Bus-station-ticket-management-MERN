import {
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Grid,
	Paper,
	Typography,
	Stack,
	Divider,
	Button,
	Chip,
	Box,
} from "@mui/material";
import {
	Close as CloseIcon,
	KeyboardReturn as RefundIcon,
	DirectionsBus as BusIcon,
} from "@mui/icons-material";
import type { Order } from "@my-types/order";
import type { Ticket } from "@my-types/ticket";
import TicketCard from "./TicketCard";

interface OrderDetailDialogProps {
	order: Order | null;
	open: boolean;
	onClose: () => void;
	onRefundOrder: () => void;
	onCancelTicket: (ticket: Ticket) => void;
}

export default function OrderDetailDialog({
	order,
	open,
	onClose,
	onRefundOrder,
	onCancelTicket,
}: OrderDetailDialogProps) {
	if (!order) return null;

	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					pr: 7,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<BusIcon color="primary" />
					<Box>
						<Typography variant="h6" component="span">
							Order details: <strong>{order.id}</strong>
						</Typography>
						<Chip
							label={
								order.status === "CONFIRMED"
									? "Paid"
									: order.status === "PENDING"
									? "Awaiting Payment"
									: order.status === "PARTIALLY_REFUNDED"
									? "Partially Refunded"
									: order.status === "REFUNDED"
									? "Refunded"
									: order.status === "EXPIRED"
									? "Expired"
									: "Cancelled"
							}
							color={
								order.status === "CONFIRMED"
									? "success"
									: order.status === "PENDING"
									? "warning"
									: order.status === "PARTIALLY_REFUNDED" ||
									  order.status === "REFUNDED"
									? "info"
									: order.status === "CANCELLED"
									? "error"
									: "default"
							}
							size="small"
							sx={{ ml: 1 }}
						/>
					</Box>
				</Box>
				<IconButton
					onClick={onClose}
					sx={{ position: "absolute", right: 8, top: 8 }}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent dividers>
				<Grid container spacing={3}>
					{/* CỘT TRÁI: Thông tin chung */}
					<Grid size={{ xs: 12, md: 5 }}>
						<Paper sx={{ p: 2, height: "100%" }}>
							<Typography variant="h6" gutterBottom>
								Order Information
							</Typography>
							<Stack spacing={1.5}>
								<Box>
									<strong>Order ID:</strong> {order.id}
								</Box>
								<Box>
									<strong>Created At:</strong>{" "}
									{new Date(order.createdAt).toLocaleString(
										"en-US"
									)}
								</Box>
								{order.tickets?.[0]?.seat?.trip
									?.departureTime && (
									<Box>
										<strong>Departure Time:</strong>{" "}
										<Typography
											component="span"
											fontWeight="bold"
											color="primary"
										>
											{new Date(
												(
													order.tickets[0].seat!
														.trip as any
												).departureTime
											).toLocaleString("en-US")}
										</Typography>
									</Box>
								)}
							</Stack>

							<Divider sx={{ my: 2 }} />

							<Typography variant="h6" gutterBottom>
								Trip
							</Typography>
							<Stack spacing={1}>
								{(() => {
									const t = order.tickets?.[0];
									const trip = t?.seat?.trip as any;
									const origin = trip?.origin || "-";
									const destination =
										trip?.destination || "-";
									return (
										<>
											<Box>
												<strong>Origin:</strong>{" "}
												<strong>{origin}</strong>
											</Box>
											<Box>
												<strong>Destination:</strong>{" "}
												<strong>{destination}</strong>
											</Box>
										</>
									);
								})()}
							</Stack>

							<Divider sx={{ my: 2 }} />

							<Typography variant="h6" gutterBottom>
								Customer
							</Typography>
							<Stack spacing={1}>
								<Box>
									<strong>Name:</strong>{" "}
									{order.guestPurchaserName ||
										(order.userId
											? "Registered User"
											: "-")}
								</Box>
								<Box>
									<strong>Email:</strong>{" "}
									{order.guestPurchaserEmail || "-"}
								</Box>
								<Box>
									<strong>Phone:</strong>{" "}
									{order.guestPurchaserPhone || "-"}
								</Box>
							</Stack>

							<Divider sx={{ my: 2 }} />

							<Typography variant="h6" gutterBottom>
								Amounts
							</Typography>
							<Stack spacing={1}>
								<Box>
									<strong>Total:</strong>{" "}
									<Typography
										component="span"
										fontWeight="bold"
										color="error"
									>
										{order.totalFinalPrice.toLocaleString(
											"vi-VN"
										)}{" "}
										₫
									</Typography>
								</Box>
								<Box>
									<strong>Base Price:</strong>{" "}
									{order.totalBasePrice.toLocaleString(
										"vi-VN"
									)}{" "}
									₫
								</Box>
								<Box>
									<strong>Discount:</strong>{" "}
									{order.totalDiscount.toLocaleString(
										"vi-VN"
									)}{" "}
									₫
								</Box>
							</Stack>

							{order.status === "CONFIRMED" && (
								<Button
									variant="outlined"
									color="error"
									fullWidth
									startIcon={<RefundIcon />}
									sx={{ mt: 3 }}
									onClick={onRefundOrder}
								>
									Full refund of order
								</Button>
							)}
						</Paper>
					</Grid>

					{/* CỘT PHẢI: Danh sách vé */}
					<Grid size={{ xs: 12, md: 7 }}>
						<Typography variant="h6" gutterBottom>
							Ticket List ({order.tickets?.length ?? 0} tickets)
						</Typography>
						<Stack spacing={2}>
							{(order.tickets ?? []).map((ticket) => {
								const trip = ticket.seat?.trip as any;
								return (
									<TicketCard
										key={ticket.id}
										ticket={ticket}
										tripInfo={{
											departure: trip?.origin || "-",
											destination:
												trip?.destination || "-",
											tripCode: "",
											departureDate:
												trip?.departureTime ||
												new Date().toISOString(),
										}}
										onCancel={onCancelTicket}
									/>
								);
							})}
						</Stack>
					</Grid>
				</Grid>
			</DialogContent>
		</Dialog>
	);
}
