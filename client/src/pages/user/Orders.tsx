import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
	Container,
	Typography,
	Paper,
	Chip,
	Alert,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Grid,
	Divider,
	Stack,
	Skeleton,
	Button,
	useTheme,
	alpha,
	Avatar,
	TextField,
	ToggleButtonGroup,
	ToggleButton,
	Pagination,
} from "@mui/material";
import {
	ExpandMore as ExpandMoreIcon,
	ShoppingBag as ShoppingBagIcon,
	DateRange as DateRangeIcon,
	Receipt as ReceiptIcon,
	FilterList as FilterListIcon,
	CheckCircle as CheckCircleIcon,
	Cancel as CancelIcon,
	AccessTime as AccessTimeIcon,
	AirlineSeatReclineNormal as SeatIcon,
	DirectionsBus as BusIcon,
	ConfirmationNumber as TicketIcon,
} from "@mui/icons-material";

// Ensure these imports point to your actual file paths
import { useAuth } from "@hooks/useAuth";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/api";
import type { Order } from "@my-types/order";
import { OrderStatus } from "@my-types/order";
import type { Ticket } from "@my-types/ticket";
import { format } from "date-fns";
import { formatCurrency } from "@utils/formatting";
import TicketQRDialog from "@components/user/TicketQRDialog";

const ITEMS_PER_PAGE = 5;

const STATUS_CONFIG: Record<
	string,
	{
		color: "success" | "warning" | "error" | "info";
		icon: React.ReactElement;
		label: string;
	}
> = {
	CONFIRMED: {
		color: "success",
		icon: <CheckCircleIcon fontSize="small" />,
		label: "Confirmed",
	},
	PENDING: {
		color: "warning",
		icon: <AccessTimeIcon fontSize="small" />,
		label: "Pending",
	},
	CANCELLED: {
		color: "error",
		icon: <CancelIcon fontSize="small" />,
		label: "Cancelled",
	},
	PARTIALLY_REFUNDED: {
		color: "info",
		icon: <ReceiptIcon fontSize="small" />,
		label: "Partially Refunded",
	},
	REFUNDED: {
		color: "info",
		icon: <ReceiptIcon fontSize="small" />,
		label: "Refunded",
	},
	EXPIRED: {
		color: "error",
		icon: <CancelIcon fontSize="small" />,
		label: "Expired",
	},
	DEFAULT: {
		color: "info",
		icon: <ReceiptIcon fontSize="small" />,
		label: "Processing",
	},
};

const UserOrders: React.FC = () => {
	const [qrOpen, setQrOpen] = useState(false);
	const [qrOrderId, setQrOrderId] = useState<string | null>(null);
	const [qrToken, setQrToken] = useState<string | null>(null);
	const { user } = useAuth();
	const theme = useTheme();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">(
		"ALL"
	);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [page, setPage] = useState(1);

	useEffect(() => {
		const fetchOrders = async () => {
			if (!user) return;
			try {
				const response = await callApi<Order[]>({
					method: "GET",
					url: API_ENDPOINTS.ORDER.BY_USER.replace(":id", user.id),
				});
				if (!Array.isArray(response))
					throw new Error("Invalid response format");
				setOrders(response as Order[]);
			} catch (err: any) {
				setError(err.message || "Failed to fetch orders");
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, [user]);

	const filteredOrders = useMemo(() => {
		return orders.filter((order) => {
			// Status filter
			if (statusFilter !== "ALL" && order.status !== statusFilter) {
				return false;
			}

			// Search filter (by order ID or route name)
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const orderId = order.id.toLowerCase();
				const routeName =
					order.tickets?.[0]?.seat?.trip?.route?.name?.toLowerCase() ||
					"";

				if (!orderId.includes(query) && !routeName.includes(query)) {
					return false;
				}
			}

			return true;
		});
	}, [orders, statusFilter, searchQuery]);

	const openBoardingPass = (orderId: string, token?: string) => {
		if (!token) return; // Require token to open dialog
		setQrOrderId(orderId);
		setQrToken(token);
		setQrOpen(true);
	};

	const closeBoardingPass = () => {
		setQrOpen(false);
		setQrOrderId(null);
		setQrToken(null);
	};

	const getStatus = (status: string) =>
		STATUS_CONFIG[status] || STATUS_CONFIG.DEFAULT;

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
	}, [statusFilter, searchQuery]);

	// Calculate the slice of data to show
	const paginatedOrders = useMemo(() => {
		const startIndex = (page - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		return filteredOrders.slice(startIndex, endIndex);
	}, [filteredOrders, page]);

	const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
		setPage(value);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	if (loading) {
		return (
			<Container maxWidth="md" sx={{ py: 4 }}>
				<Typography variant="h4" gutterBottom>
					My Orders
				</Typography>
				<Stack spacing={2}>
					{[1, 2, 3].map((item) => (
						<Paper key={item} sx={{ p: 3, borderRadius: 2 }}>
							<Skeleton variant="text" width="60%" />
							<Skeleton
								variant="rectangular"
								height={100}
								sx={{ mt: 2 }}
							/>
						</Paper>
					))}
				</Stack>
			</Container>
		);
	}

	return (
		<Container maxWidth="md" sx={{ py: 4 }}>
			<Typography
				variant="h4"
				fontWeight="bold"
				gutterBottom
				sx={{ mb: 2 }}
			>
				My Orders
			</Typography>

			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}

			{/* Filters */}
			{orders.length > 0 && (
				<Paper
					elevation={0}
					sx={{
						p: 2,
						mb: 3,
						border: `1px solid ${theme.palette.divider}`,
						borderRadius: 2,
					}}
				>
					<Stack direction={"row"} spacing={2}>
						<Stack flex={3}>
							<Stack
								direction="row"
								alignItems="center"
								spacing={1}
								mb={1}
							>
								<FilterListIcon
									fontSize="small"
									color="action"
								/>
								<Typography
									variant="subtitle2"
									fontWeight="bold"
								>
									Filters
								</Typography>
							</Stack>

							<TextField
								size="small"
								placeholder="Search by Order ID or Route..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								fullWidth
								sx={{ maxWidth: 400 }}
							/>

							<Typography
								variant="body2"
								color="text.secondary"
								mt={0.5}
							>
								Showing {filteredOrders.length} of{" "}
								{orders.length} orders
							</Typography>
						</Stack>

						<Stack flex={2} flexWrap={"wrap"}>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ mb: 1, display: "block" }}
							>
								Status
							</Typography>
							<ToggleButtonGroup
								value={statusFilter}
								exclusive
								onChange={(_, newValue) => {
									if (newValue !== null) {
										setStatusFilter(newValue);
									}
								}}
								size="small"
								sx={{
									flexWrap: "wrap",
									"& .MuiToggleButton-root": {
										textTransform: "none",
									},
								}}
							>
								<ToggleButton value="ALL">All</ToggleButton>
								{Object.values(OrderStatus).map((v, k) => {
									return (
										<ToggleButton key={k} value={v}>
											{v.charAt(0).toUpperCase() +
												v
													.slice(1)
													.replace("_", " ")
													.toLowerCase()}
										</ToggleButton>
									);
								})}
							</ToggleButtonGroup>
						</Stack>

						{(searchQuery || statusFilter !== "ALL") && (
							<Button
								sx={{ flex: 1 }}
								size="small"
								onClick={() => {
									setSearchQuery("");
									setStatusFilter("ALL");
								}}
							>
								Clear Filters
							</Button>
						)}
					</Stack>
				</Paper>
			)}

			{/* Content Area */}
			{orders.length === 0 ? (
				<Paper
					elevation={0}
					sx={{
						p: 6,
						textAlign: "center",
						border: `1px dashed ${theme.palette.divider}`,
						backgroundColor: alpha(
							theme.palette.primary.main,
							0.02
						),
					}}
				>
					<ShoppingBagIcon
						sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
					/>
					<Typography variant="h6" color="text.primary" gutterBottom>
						No orders found
					</Typography>
					<Button variant="contained" startIcon={<ShoppingBagIcon />}>
						Start Shopping
					</Button>
				</Paper>
			) : filteredOrders.length === 0 ? (
				<Paper
					elevation={0}
					sx={{
						p: 4,
						textAlign: "center",
						border: `1px dashed ${theme.palette.divider}`,
					}}
				>
					<Typography
						variant="h6"
						color="text.secondary"
						gutterBottom
					>
						No orders match your filters
					</Typography>
					<Button
						variant="text"
						onClick={() => {
							setSearchQuery("");
							setStatusFilter("ALL");
						}}
					>
						Clear Filters
					</Button>
				</Paper>
			) : (
				<Stack spacing={2}>
					{paginatedOrders.map((order) => {
						const status = getStatus(order.status);
						// Derive trip info from the first ticket (assuming single trip orders for now)
						const firstTicket = order.tickets?.[0];
						const trip = firstTicket?.seat?.trip;
						const routeName = trip?.route?.name || "Bus Trip";
						const tripDate = trip?.startTime
							? new Date(trip.startTime)
							: null;

						return (
							<Accordion
								key={order.id}
								disableGutters
								sx={{
									borderRadius: "12px !important",
									border: `1px solid ${theme.palette.divider}`,
									boxShadow: "none",
									"&:before": { display: "none" },
									transition: "all 0.2s",
									"&:hover": {
										borderColor: theme.palette.primary.main,
									},
								}}
							>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon />}
									sx={{ py: 1 }}
								>
									<Grid
										container
										alignItems="center"
										justifyContent="space-between"
										spacing={2}
										pr={2}
										pl={1}
										flex={1}
									>
										<Grid size={{ xs: 12, sm: 6 }}>
											<Stack
												direction="row"
												alignItems="center"
												spacing={1}
												mb={0.5}
											>
												<ReceiptIcon
													fontSize="medium"
													color="action"
												/>
												<Typography
													variant="subtitle1"
													fontWeight="bold"
												>
													#
													{order.id
														.substring(0, 8)
														.toUpperCase()}
												</Typography>
												<Chip
													icon={status.icon}
													label={status.label}
													color={status.color}
													size="small"
													variant="outlined"
													sx={{
														fontWeight: 600,
														px: 0.5,
													}}
												/>
											</Stack>
											<Stack
												direction="row"
												alignItems="center"
												spacing={1}
											>
												<DateRangeIcon
													fontSize="medium"
													sx={{
														color: "text.secondary",
													}}
												/>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													{format(
														new Date(
															order.createdAt!.toString()
														),
														"MMM dd, yyyy"
													)}
												</Typography>
											</Stack>
										</Grid>

										<Grid size={{ xs: 12, sm: 6 }}>
											<Box
												display="flex"
												flexDirection={{
													xs: "row",
													sm: "column",
												}}
												justifyContent={{
													xs: "space-between",
													sm: "flex-end",
												}}
												alignItems={{
													xs: "center",
													sm: "flex-end",
												}}
											>
												<Typography
													variant="h6"
													color="primary.main"
													fontWeight="bold"
												>
													{formatCurrency(
														order.totalFinalPrice,
														"VND",
														"vi-VN"
													)}
												</Typography>
												{order.status ===
													OrderStatus.CONFIRMED &&
													order.checkInToken && (
														<Button
															variant="contained"
															size="small"
															sx={{
																mt: {
																	xs: 0,
																	sm: 1,
																},
															}}
															onClick={() =>
																openBoardingPass(
																	order.id,
																	(
																		order as any
																	)
																		.checkInToken
																)
															}
														>
															View Boarding Pass
														</Button>
													)}
											</Box>
										</Grid>
									</Grid>
								</AccordionSummary>

								<Divider />

								<AccordionDetails sx={{ p: 0 }}>
									<Box
										sx={{
											p: 3,
											bgcolor: alpha(
												theme.palette.background
													.default,
												0.5
											),
										}}
									>
										<Grid container spacing={4}>
											{/* Left Col: Trip & Ticket Info */}
											<Grid size={{ xs: 12, md: 7 }}>
												<Stack spacing={2}>
													{/* Trip Header */}
													<Box
														display="flex"
														alignItems="center"
														gap={2}
													>
														<Avatar
															sx={{
																bgcolor: alpha(
																	theme
																		.palette
																		.primary
																		.main,
																	0.1
																),
																color: theme
																	.palette
																	.primary
																	.main,
															}}
														>
															<BusIcon fontSize="large" />
														</Avatar>
														<Box>
															<Typography
																variant="subtitle2"
																fontWeight="bold"
															>
																{routeName}
															</Typography>
															{tripDate && (
																<Typography
																	variant="caption"
																	color="text.secondary"
																>
																	Departing:{" "}
																	{format(
																		tripDate,
																		"PPpp"
																	)}
																</Typography>
															)}
														</Box>
													</Box>

													<Divider
														sx={{
															borderStyle:
																"dashed",
														}}
													/>

													{/* Ticket List */}
													<Stack
														direction="row"
														alignItems="center"
														spacing={0.5}
													>
														<TicketIcon
															fontSize="small"
															sx={{
																mr: 0.5,
																color: "text.secondary",
															}}
														/>
														<Typography
															variant="overline"
															color="text.secondary"
															sx={{}}
														>
															Tickets (
															{order.tickets
																?.length || 0}
															)
														</Typography>
													</Stack>

													<Stack spacing={1.5}>
														{order.tickets?.map(
															(
																ticket: Ticket
															) => (
																<Paper
																	key={
																		ticket.id
																	}
																	variant="outlined"
																	sx={{
																		p: 1.5,
																		display:
																			"flex",
																		alignItems:
																			"center",
																		justifyContent:
																			"space-between",
																		bgcolor:
																			"background.paper",
																	}}
																>
																	<Box
																		display="flex"
																		alignItems="center"
																		gap={
																			1.5
																		}
																	>
																		<SeatIcon
																			color="action"
																			fontSize="large"
																		/>
																		<Box>
																			<Typography
																				variant="body2"
																				fontWeight="bold"
																			>
																				Seat{" "}
																				{ticket
																					.seat
																					?.number ||
																					"N/A"}
																			</Typography>
																			<Typography
																				variant="caption"
																				color="text.secondary"
																			>
																				Standard
																				Ticket
																			</Typography>
																		</Box>
																	</Box>
																	<Typography
																		variant="body2"
																		fontWeight="medium"
																	>
																		{formatCurrency(
																			ticket.finalPrice,
																			"VND",
																			"vi-VN"
																		)}
																	</Typography>
																</Paper>
															)
														)}
													</Stack>
												</Stack>
											</Grid>

											{/* Right Col: Summary & Metadata */}
											<Grid size={{ xs: 12, md: 5 }}>
												<Paper
													elevation={0}
													sx={{
														p: 2,
														bgcolor: alpha(
															theme.palette.action
																.hover,
															0.05
														),
													}}
												>
													<Typography
														variant="overline"
														color="text.secondary"
													>
														Order Summary
													</Typography>
													<Stack spacing={1.5} mt={2}>
														<Box
															display="flex"
															justifyContent="space-between"
														>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																Subtotal
															</Typography>
															<Typography variant="body2">
																{formatCurrency(
																	order.totalBasePrice,
																	"VND",
																	"vi-VN"
																)}
															</Typography>
														</Box>
														{Number(
															order.totalDiscount
														) > 0 && (
															<Box
																display="flex"
																justifyContent="space-between"
															>
																<Typography
																	variant="body2"
																	color="success.main"
																>
																	Discount
																</Typography>
																<Typography
																	variant="body2"
																	color="success.main"
																>
																	-
																	{formatCurrency(
																		order.totalDiscount ||
																			0,
																		"VND",
																		"vi-VN"
																	)}
																</Typography>
															</Box>
														)}
														<Divider />
														<Box
															display="flex"
															justifyContent="space-between"
															sx={{ mt: 1 }}
														>
															<Typography
																variant="subtitle1"
																fontWeight="bold"
															>
																Total
															</Typography>
															<Typography
																variant="subtitle1"
																fontWeight="bold"
																color="primary"
															>
																{formatCurrency(
																	order.totalFinalPrice,
																	"VND",
																	"vi-VN"
																)}
															</Typography>
														</Box>
													</Stack>

													<Box mt={2}>
														<Typography
															variant="caption"
															color="text.secondary"
															display="block"
														>
															Order ID: {order.id}
														</Typography>
														<Typography
															variant="caption"
															color="text.secondary"
															display="block"
														>
															Placed on:{" "}
															{format(
																new Date(
																	order.createdAt!.toString()
																),
																"PPpp"
															)}
														</Typography>
													</Box>
												</Paper>
											</Grid>
										</Grid>
									</Box>
								</AccordionDetails>
							</Accordion>
						);
					})}
				</Stack>
			)}

			{/* Pagination Footer */}
			{filteredOrders.length > ITEMS_PER_PAGE && (
				<Stack alignItems="center" sx={{ mt: 4 }}>
					<Pagination
						count={Math.ceil(
							filteredOrders.length / ITEMS_PER_PAGE
						)}
						page={page}
						onChange={handlePageChange}
						color="primary"
						size="large"
					/>
				</Stack>
			)}
			{/* QR Dialog */}
			<TicketQRDialog
				open={qrOpen}
				onClose={closeBoardingPass}
				orderId={qrOrderId || ""}
				checkInToken={qrToken || ""}
			/>
		</Container>
	);
};

export default UserOrders;
