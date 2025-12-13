import { useState, useMemo } from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
	Alert,
	Box,
	CircularProgress,
} from "@mui/material";
import type { Ticket } from "@my-types";
import { callApi } from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { formatCurrency } from "@utils/formatting";

interface OrderConfirmCancelDialogProps {
	orderId: string;
	tickets: Ticket[];
	open: boolean;
	onClose: () => void;
	onSuccess?: (message?: string) => void;
	initialSelectedTicketIds?: number[];
}

const OrderConfirmCancelDialog: React.FC<OrderConfirmCancelDialogProps> = ({
	orderId,
	tickets,
	open,
	onClose,
	onSuccess,
	initialSelectedTicketIds = [],
}) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const ticketsToRefund = useMemo(() => {
		return tickets.filter((t) => initialSelectedTicketIds.includes(t.id));
	}, [tickets, initialSelectedTicketIds]);

	const totalRefundAmount = useMemo(() => {
		return ticketsToRefund.reduce(
			(sum, t) => sum + Number(t.finalPrice),
			0
		);
	}, [ticketsToRefund]);

	const handleRefund = async () => {
		if (ticketsToRefund.length === 0) return;

		setLoading(true);
		setError(null);

		try {
			await callApi({
				method: "POST",
				url: API_ENDPOINTS.ORDER.REFUND.replace(":id", orderId),
				data: {
					orderId,
					ticketIds: initialSelectedTicketIds,
				},
			});

			if (onSuccess) {
				onSuccess("Tickets have been successfully refunded.");
			}
			onClose();
		} catch (err: any) {
			setError(err.message || "Failed to refund tickets");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle>Confirm Refund</DialogTitle>
			<DialogContent>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<Typography variant="body1" gutterBottom>
					Are you sure you want to refund{" "}
					<strong>{ticketsToRefund.length}</strong> ticket(s)?
				</Typography>

				<Box
					sx={{
						mt: 2,
						mb: 2,
						maxHeight: 200,
						overflowY: "auto",
						border: "1px solid #eee",
						borderRadius: 1,
						p: 1,
					}}
				>
					{ticketsToRefund.map((t) => (
						<Box
							key={t.id}
							sx={{
								display: "flex",
								justifyContent: "space-between",
								mb: 1,
								borderBottom: "1px dashed #eee",
								pb: 0.5,
							}}
						>
							<Typography variant="body2">
								Ticket #{t.id} (Seat:{" "}
								{t.seat?.number || t.seatId})
							</Typography>
							<Typography variant="body2" fontWeight="bold">
								{formatCurrency(Number(t.finalPrice), "VND", "vi-VN")}
							</Typography>
						</Box>
					))}
				</Box>

				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						mt: 2,
						pt: 2,
						borderTop: "1px solid #eee",
					}}
				>
					<Typography variant="subtitle1">
						Total Refund Amount:
					</Typography>
					<Typography
						variant="subtitle1"
						fontWeight="bold"
						color="error"
					>
						{formatCurrency(totalRefundAmount, "VND", "vi-VN")}
					</Typography>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={loading}>
					Cancel
				</Button>
				<Button
					onClick={handleRefund}
					variant="contained"
					color="error"
					disabled={loading || ticketsToRefund.length === 0}
					startIcon={
						loading ? (
							<CircularProgress size={20} color="inherit" />
						) : null
					}
				>
					{loading ? "Processing..." : "Confirm Refund"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default OrderConfirmCancelDialog;
