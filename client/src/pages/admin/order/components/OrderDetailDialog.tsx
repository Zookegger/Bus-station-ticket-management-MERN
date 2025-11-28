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
	Avatar,
} from "@mui/material";
import {
	Close as CloseIcon,
	KeyboardReturn as RefundIcon,
	DirectionsBus as BusIcon,
	Person as PersonIcon,
	Receipt as ReceiptIcon,
	Info as InfoIcon,
	CreditCard as CreditCardIcon,
	LocalOffer as CouponIcon,
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

const DetailRow = ({
	label,
	value,
	valueColor = "text.primary",
	boldValue = false,
}: {
	label: string;
	value: React.ReactNode;
	valueColor?: string;
	boldValue?: boolean;
}) => (
	<Box
		sx={{
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			py: 0.5,
		}}
	>
		<Typography variant="body2" color="text.secondary">
			{label}
		</Typography>
		<Typography
			variant="body2"
			fontWeight={boldValue ? "bold" : "medium"}
			color={valueColor}
			sx={{ textAlign: "right" }}
		>
			{value}
		</Typography>
	</Box>
);

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
					borderBottom: 1,
					borderColor: "divider",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
					<Box
						sx={{
							bgcolor: "primary.light",
							color: "primary.main",
							p: 1,
							borderRadius: 1,
							display: "flex",
						}}
					>
						<ReceiptIcon />
					</Box>
					<Box>
						<Typography variant="h6" lineHeight={1.2}>
							Order #{order.id}
						</Typography>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
							<Typography variant="caption" color="text.secondary">
								{order.createdAt ? new Date(order.createdAt).toLocaleString("en-US") : "N/A"}
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
								variant="outlined"
							/>
						</Box>
					</Box>
				</Box>
				<IconButton
					onClick={onClose}
					sx={{ position: "absolute", right: 8, top: 8 }}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: 3, bgcolor: "grey.50" }}>
				<Grid container spacing={3}>
					{/* LEFT COLUMN: General Info */}
					<Grid size={{ xs: 12, md: 4 }}>
						<Stack spacing={3}>
							{/* Customer Info */}
							<Paper sx={{ p: 2, elevation: 2 }} variant="outlined">
								<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
									<PersonIcon color="action" fontSize="small" />
									<Typography variant="subtitle1" fontWeight="bold">
										Customer Details
									</Typography>
								</Box>
								<Stack spacing={1}>
									{order.user ? (
										<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
											<Avatar
												src={order.user.avatar || undefined}
												alt={order.user.fullName}
												sx={{ width: 48, height: 48 }}
											/>
											<Box>
												<Typography variant="body1" fontWeight="medium">
													{order.user.fullName}
												</Typography>
												<Typography variant="body2" color="text.secondary">
													{order.user.email}
												</Typography>
												<Typography variant="body2" color="text.secondary">
													{order.user.phoneNumber}
												</Typography>
											</Box>
										</Box>
									) : (
										<>
											<DetailRow
												label="Name"
												value={order.guestPurchaserName || "-"}
											/>
											<DetailRow
												label="Email"
												value={order.guestPurchaserEmail || "-"}
											/>
											<DetailRow
												label="Phone"
												value={order.guestPurchaserPhone || "-"}
											/>
										</>
									)}
								</Stack>
							</Paper>

							{/* Trip Info */}
							<Paper sx={{ p: 2, elevation: 2 }} variant="outlined">
								<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
									<BusIcon color="action" fontSize="small" />
									<Typography variant="subtitle1" fontWeight="bold">
										Trip Information
									</Typography>
								</Box>
								<Stack spacing={0.5}>
									{(() => {
										const t = order.tickets?.[0];
										const trip = t?.seat?.trip as any;
										const origin = trip?.origin || "-";
										const destination = trip?.destination || "-";
										const depTime = trip?.departureTime
											? new Date(trip.departureTime).toLocaleString("en-US")
											: "-";
										return (
											<>
												<DetailRow label="Origin" value={origin} />
												<DetailRow label="Destination" value={destination} />
												<DetailRow
													label="Departure"
													value={depTime}
													boldValue
													valueColor="primary.main"
												/>
											</>
										);
									})()}
								</Stack>
							</Paper>

							{/* Payment Details */}
							{order.payment && order.payment.length > 0 && (
								<Paper sx={{ p: 2, elevation: 2 }} variant="outlined">
									<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
										<CreditCardIcon color="action" fontSize="small" />
										<Typography variant="subtitle1" fontWeight="bold">
											Payment Details
										</Typography>
									</Box>
									<Stack spacing={0.5}>
										<DetailRow
											label="Payment Status"
											value={
												<Chip
													label={order.payment[0].paymentStatus}
													color={
														order.payment[0].paymentStatus === "COMPLETED"
															? "success"
															: order.payment[0].paymentStatus === "PENDING"
															? "warning"
															: "error"
													}
													size="small"
												/>
											}
										/>
										<DetailRow
											label="Total Amount"
											value={`${order.payment[0].totalAmount.toLocaleString("vi-VN")} ₫`}
											boldValue
											valueColor="primary.main"
										/>
										<DetailRow
											label="Merchant Ref"
											value={order.payment[0].merchantOrderRef || "-"}
										/>
										{order.payment[0].expiredAt && (
											<DetailRow
												label="Expires At"
												value={new Date(order.payment[0].expiredAt).toLocaleString("en-US")}
												valueColor="warning.main"
											/>
										)}
									</Stack>
								</Paper>
							)}

							{/* Payment Info */}
							<Paper sx={{ p: 2, elevation: 2 }} variant="outlined">
								<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
									<InfoIcon color="action" fontSize="small" />
									<Typography variant="subtitle1" fontWeight="bold">
										Payment Summary
									</Typography>
								</Box>
								<Stack spacing={0.5}>
									<DetailRow
										label="Base Price"
										value={`${order.totalBasePrice.toLocaleString("vi-VN")} ₫`}
									/>
									<DetailRow
										label="Discount"
										value={`${order.totalDiscount.toLocaleString("vi-VN")} ₫`}
										valueColor="success.main"
									/>
									<Divider sx={{ my: 1 }} />
									<DetailRow
										label="Total Amount"
										value={`${order.totalFinalPrice.toLocaleString("vi-VN")} ₫`}
										boldValue
										valueColor="primary.main"
									/>
								</Stack>

								{order.status === "CONFIRMED" && (
									<Button
										variant="outlined"
										color="error"
										fullWidth
										startIcon={<RefundIcon />}
										sx={{ mt: 2 }}
										onClick={onRefundOrder}
									>
										Full Refund
									</Button>
								)}
							</Paper>

							{/* Coupon Usage */}
							{order.couponUsage && (
								<Paper sx={{ p: 2, elevation: 2 }} variant="outlined">
									<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
										<CouponIcon color="action" fontSize="small" />
										<Typography variant="subtitle1" fontWeight="bold">
											Coupon Applied
										</Typography>
									</Box>
									<Stack spacing={0.5}>
										<DetailRow
											label="Coupon Code"
											value={order.couponUsage.coupon?.code || "-"}
											boldValue
										/>
										<DetailRow
											label="Discount Amount"
											value={`${order.couponUsage.discountAmount?.toLocaleString("vi-VN")} ₫`}
											valueColor="success.main"
										/>
										<DetailRow
											label="Usage Date"
											value={
												order.couponUsage.usedAt
													? new Date(order.couponUsage.usedAt).toLocaleString("en-US")
													: "-"
											}
										/>
									</Stack>
								</Paper>
							)}
						</Stack>
					</Grid>

					{/* RIGHT COLUMN: Ticket List */}
					<Grid size={{ xs: 12, md: 8 }}>
						<Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<Typography variant="h6">
								Tickets ({order.tickets?.length ?? 0})
							</Typography>
						</Box>
						<Stack spacing={2}>
							{(order.tickets ?? []).map((ticket) => {
								const trip = ticket.seat?.trip as any;
								return (
									<TicketCard
										key={ticket.id}
										ticket={ticket}
										tripInfo={{
											departure: trip?.origin || "-",
											destination: trip?.destination || "-",
											tripCode: "",
											departureDate:
												trip?.departureTime || new Date().toISOString(),
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
