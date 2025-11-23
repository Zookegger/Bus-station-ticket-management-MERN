import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	Paper,
	IconButton,
	Chip,
	Typography,
} from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import type { Order } from "@my-types/order";
import type { Ticket } from "@my-types/ticket";

interface OrderTableProps {
	orders: Order[];
	page: number;
	rowsPerPage: number;
	total: number;
	onPageChange: (page: number) => void;
	onRowsPerPageChange: (rows: number) => void;
	onViewDetail: (order: Order) => void;
}

const OrderTable = ({
	orders,
	page,
	rowsPerPage,
	total,
	onPageChange,
	onRowsPerPageChange,
	onViewDetail,
}: OrderTableProps) => {
	return (
		<TableContainer component={Paper}>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>
							<strong>Order ID</strong>
						</TableCell>
						<TableCell>
							<strong>Customer</strong>
						</TableCell>
						<TableCell>
							<strong>Origin</strong>
						</TableCell>
						<TableCell>
							<strong>Destination</strong>
						</TableCell>
						<TableCell>
							<strong>Departure Time</strong>
						</TableCell>
						<TableCell>
							<strong>Ticket Quantity</strong>
						</TableCell>
						<TableCell>
							<strong>Total Amount</strong>
						</TableCell>
						<TableCell>
							<strong>Status</strong>
						</TableCell>
						<TableCell align="center">
							<strong>View Details</strong>
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{orders.map((order) => (
						<TableRow key={order.id} hover>
							<TableCell>{order.id}</TableCell>
							<TableCell>
								{order.guestPurchaserName ||
									(order.userId
										? "Registered User"
										: "Guest")}
								<br />
								<Typography
									variant="caption"
									color="text.secondary"
								>
									{order.guestPurchaserEmail ||
										order.guestPurchaserPhone ||
										""}
								</Typography>
							</TableCell>

							{(() => {
								const first: Ticket | undefined =
									order.tickets?.[0];
								const trip = first?.seat?.trip;
								const origin = (trip as any)?.origin || "-";
								const destination =
									(trip as any)?.destination || "-";
								const depTime = (trip as any)?.departureTime
									? new Date(
											(trip as any).departureTime
									  ).toLocaleString("en-US")
									: "-";
								return (
									<>
										<TableCell>
											<Typography
												variant="body2"
												fontWeight="medium"
											>
												{origin}
											</Typography>
										</TableCell>
										<TableCell>
											<Typography
												variant="body2"
												fontWeight="medium"
											>
												{destination}
											</Typography>
										</TableCell>
										<TableCell>
											<Typography
												variant="body2"
												fontWeight="medium"
											>
												{depTime}
											</Typography>
										</TableCell>
									</>
								);
							})()}
							<TableCell>{order.tickets?.length}</TableCell>
							<TableCell>
								{order.totalFinalPrice.toLocaleString("vi-VN")}{" "}
								₫
							</TableCell>
							<TableCell>
								<Chip
									label={
										order.status === "CONFIRMED"
											? "Paid"
											: order.status === "PENDING"
											? "Awaiting Payment"
											: order.status ===
											  "PARTIALLY_REFUNDED"
											? "Partially Refunded"
											: order.status === "REFUNDED"
											? "Refunded"
											: order.status === "EXPIRED" ||
											  order.status === "CANCELLED"
											? "Cancelled"
											: "Expired"
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
											: order.status === "EXPIRED"
											? "default"
											: "default"
									}
									size="small"
								/>
							</TableCell>
							<TableCell align="center">
								<IconButton
									color="primary"
									onClick={() => onViewDetail(order)}
								>
									<VisibilityIcon />
								</IconButton>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<TablePagination
				rowsPerPageOptions={[5, 10, 25]}
				component="div"
				count={total}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={(_, newPage) => onPageChange(newPage)}
				onRowsPerPageChange={(e) => {
					onRowsPerPageChange(parseInt(e.target.value, 10));
				}}
				labelRowsPerPage="Rows per page:"
				labelDisplayedRows={({ from, to, count }) =>
					`${from}-${to} of ${count}`
				}
			/>
		</TableContainer>
	);
}

export default OrderTable;