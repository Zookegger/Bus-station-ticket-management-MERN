import { useState, useEffect } from "react";
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
	CreditCard as CreditCardIcon,
	LocalOffer as CouponIcon,
} from "@mui/icons-material";
import type { Order } from "@my-types/order";
import TicketCard from "./TicketCard";

import { formatCurrency } from "@utils/formatting";

interface OrderDetailDialogProps {
	order: Order | null;
	open: boolean;
	onClose: () => void;
	onRefundOrder: () => void;
	onRefundTickets: (ticketIds: number[]) => void;
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
	onRefundTickets,
}: OrderDetailDialogProps) {
	const [selectedTicketIds, setSelectedTicketIds] = useState<number[]>([]);

	useEffect(() => {
		if (open) {
			setSelectedTicketIds([]);
		}
	}, [open]);

	if (!order) return null;

	const handleToggleTicket = (ticketId: number) => {
		setSelectedTicketIds((prev) => {
			if (prev.includes(ticketId)) {
				return prev.filter((id) => id !== ticketId);
			} else {
				return [...prev, ticketId];
			}
		});
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
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
						<Typography variant="h6" lineHeight={1.25}>
							<strong>Order</strong> #{order.id}
						</Typography>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
								mt: 0.5,
							}}
						>
							<Typography
								variant="caption"
								color="text.secondary"
							>
								{order.createdAt
									? new Date(order.createdAt).toLocaleString(
											"en-US"
									  )
									: "N/A"}
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
										: order.status ===
												"PARTIALLY_REFUNDED" ||
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

			<Divider color="divider" />

			<DialogContent sx={{ p: 3, bgcolor: "grey.50" }}>
				<Grid container spacing={3}>
					{/* LEFT COLUMN: General Info */}
					<Grid size={{ xs: 12, md: 5 }}>
						<Stack spacing={3}>
							{/* Customer Info */}
							<Paper
								sx={{ p: 2, elevation: 2 }}
								variant="outlined"
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1,
										mb: 2,
									}}
								>
									<PersonIcon
										color="action"
										fontSize="small"
									/>
									<Typography
										variant="subtitle1"
										fontWeight="bold"
									>
										Customer Details
									</Typography>
								</Box>
								<Stack spacing={1}>
									{order.user ? (
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 2,
											}}
										>
											<Avatar
												src={
													order.user.avatar ||
													undefined
												}
												alt={order.user.fullName}
												sx={{ width: 48, height: 48 }}
											/>
											<Box>
												<Typography
													variant="body1"
													fontWeight="medium"
												>
													{order.user.fullName}
												</Typography>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													{order.user.email}
												</Typography>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													{order.user.phoneNumber}
												</Typography>
											</Box>
										</Box>
									) : (
										<>
											<DetailRow
												label="Name"
												value={
													order.guestPurchaserName ||
													"-"
												}
											/>
											<DetailRow
												label="Email"
												value={
													order.guestPurchaserEmail ||
													"-"
												}
											/>
											<DetailRow
												label="Phone"
												value={
													order.guestPurchaserPhone ||
													"-"
												}
											/>
										</>
									)}
								</Stack>
							</Paper>

							{/* Trip Info */}
							<Paper
								sx={{ p: 2, elevation: 2 }}
								variant="outlined"
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1,
										mb: 2,
									}}
								>
									<BusIcon color="action" fontSize="small" />
									<Typography
										variant="subtitle1"
										fontWeight="bold"
									>
										Trip Information
									</Typography>
								</Box>
								<Stack spacing={0.5}>
									{(() => {
										const t = order.tickets?.[0];
										const trip = t?.seat?.trip;
										const route = trip?.route;
										const vehicle = trip?.vehicle;

										// Sort stops to find origin and destination
										const sortedStops = route?.stops
											? [...route.stops].sort(
													(a, b) =>
														a.stopOrder -
														b.stopOrder
											  )
											: [];
										const origin =
											sortedStops.length > 0
												? sortedStops[0].locations?.name
												: "Unknown";
										const destination =
											sortedStops.length > 0
												? sortedStops[
														sortedStops.length - 1
												  ].locations?.name
												: "Unknown";

										const depTime = trip?.startTime
											? new Date(
													trip.startTime
											  ).toLocaleString("en-US")
											: "-";

										return (
											<>
												<DetailRow
													label="Route"
													value={route?.name || "-"}
												/>
												<DetailRow
													label="Origin"
													value={origin || "-"}
												/>
												<DetailRow
													label="Destination"
													value={destination || "-"}
												/>
												<DetailRow
													label="Departure"
													value={depTime}
													boldValue
													valueColor="primary.main"
												/>
												{vehicle && (
													<DetailRow
														label="Vehicle"
														value={`${
															vehicle.numberPlate
														} (${
															vehicle.vehicleType
																?.name || "Bus"
														})`}
													/>
												)}
											</>
										);
									})()}
								</Stack>
							</Paper>

							{/* Payment Details */}
							<Paper
								sx={{ p: 2, elevation: 2 }}
								variant="outlined"
							>
								{/* --- Header --- */}
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1,
										mb: 2,
									}}
								>
									<CreditCardIcon
										color="action"
										fontSize="small"
									/>
									<Typography
										variant="subtitle1"
										fontWeight="bold"
									>
										Payment & Billing
									</Typography>
								</Box>

								{/* --- Section 1: Order Breakdown (Always Visible) --- */}
								<Stack spacing={0.5}>
									<DetailRow
										label="Base Price"
										value={formatCurrency(order.totalBasePrice, "VND", "vi-VN")}
									/>
									<DetailRow
										label="Discount"
										value={formatCurrency(order.totalDiscount, "VND", "vi-VN")}
										valueColor="success.main"
									/>

									<Divider
										sx={{ my: 1, borderStyle: "dashed" }}
									/>

									<DetailRow
										label="Net Total"
										value={formatCurrency(order.totalFinalPrice, "VND", "vi-VN")}
										boldValue
										valueColor="primary.main"
									/>
								</Stack>

								{/* --- Section 2: Transaction Details (Conditional) --- */}
								{order.payment && order.payment.length > 0 && (
									<>
										<Box
											sx={{
												my: 2,
												display: "flex",
												alignItems: "center",
											}}
										>
											<Divider sx={{ flex: 1 }} />
											<Typography
												variant="caption"
												sx={{
													mx: 2,
													color: "text.secondary",
												}}
											>
												Transaction Details
											</Typography>
											<Divider sx={{ flex: 1 }} />
										</Box>

										<Stack spacing={0.5}>
											<DetailRow
												label="Status"
												value={
													<Chip
														label={
															order.payment[0]
																.paymentStatus
														}
														color={
															order.payment[0]
																.paymentStatus ===
															"COMPLETED"
																? "success"
																: order
																		.payment[0]
																		.paymentStatus ===
																  "PENDING"
																? "warning"
																: "error"
														}
														size="small"
														sx={{
															fontWeight: "bold",
															height: 24,
															textTransform:
																"capitalize",
														}}
													/>
												}
											/>

											{/* Only show paid amount if it differs from Net Total, otherwise it's redundant */}
											<DetailRow
												label="Paid Amount"
												value={formatCurrency(order.payment[0].totalAmount, "VND", "vi-VN")}
											/>

											<DetailRow
												label="Merchant Ref"
												value={
													order.payment[0]
														.merchantOrderRef || "-"
												}
											/>

											{order.payment[0].expiredAt && (
												<DetailRow
													label="Expires At"
													value={new Date(
														order.payment[0].expiredAt
													).toLocaleString("en-US")}
													valueColor="warning.main"
												/>
											)}
										</Stack>
									</>
								)}

								{/* --- Footer: Actions --- */}
								{order.status === "CONFIRMED" && (
									<Button
										variant="outlined"
										color="error"
										fullWidth
										startIcon={<RefundIcon />}
										sx={{ mt: 3 }}
										onClick={onRefundOrder}
									>
										Full Refund
									</Button>
								)}
							</Paper>

							{/* Coupon Usage */}
							{order.couponUsage && (
								<Paper
									sx={{ p: 2, elevation: 2 }}
									variant="outlined"
								>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1,
											mb: 2,
										}}
									>
										<CouponIcon
											color="action"
											fontSize="small"
										/>
										<Typography
											variant="subtitle1"
											fontWeight="bold"
										>
											Coupon Applied
										</Typography>
									</Box>
									<Stack spacing={0.5}>
										<DetailRow
											label="Coupon Code"
											value={
												order.couponUsage.coupon
													?.code || "-"
											}
											boldValue
										/>
										<DetailRow
											label="Discount Amount"
											value={`${order.couponUsage.discountAmount.toLocaleString(
												"vi-VN"
											)} ₫`}
											valueColor="success.main"
										/>
										<DetailRow
											label="Usage Date"
											value={
												order.couponUsage.usedAt
													? new Date(
															order.couponUsage.usedAt
													  ).toLocaleString("en-US")
													: "-"
											}
										/>
									</Stack>
								</Paper>
							)}
						</Stack>
					</Grid>

					{/* RIGHT COLUMN: Ticket List */}
					<Grid size={{ xs: 12, md: 7 }}>
						<Box
							sx={{
								mb: 2,
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
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
											destination:
												trip?.destination || "-",
											tripCode: "",
											departureDate:
												trip?.departureTime ||
												new Date().toISOString(),
										}}
										selectable
										selected={selectedTicketIds.includes(
											ticket.id
										)}
										onToggle={handleToggleTicket}
									/>
								);
							})}
						</Stack>
						<Box
							sx={{
								mt: 3,
								display: "flex",
								justifyContent: "flex-end",
							}}
						>
							<Button
								variant="contained"
								color="error"
								startIcon={<RefundIcon />}
								disabled={selectedTicketIds.length === 0}
								onClick={() =>
									onRefundTickets(selectedTicketIds)
								}
							>
								Cancel / Refund Selected (
								{selectedTicketIds.length})
							</Button>
						</Box>
					</Grid>
				</Grid>
			</DialogContent>
		</Dialog>
	);
}
