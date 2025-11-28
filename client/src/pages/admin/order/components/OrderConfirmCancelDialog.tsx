import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
} from "@mui/material";
import type { Ticket } from "@my-types";

interface OrderConfirmCancelDialogProps {
	ticketToCancel: Ticket;
	onClose: () => void;
}

const OrderConfirmCancelDialog: React.FC<OrderConfirmCancelDialogProps> = ({
	ticketToCancel,
	onClose,
}) => {
	const handleCancelTicket = () => {
		if (ticketToCancel) {
			alert(`Cancel ticket ${ticketToCancel.id} and refund`);
			onClose();
		}
	};

	return (
		<Dialog open={!!ticketToCancel} onClose={() => onClose}>
			<DialogTitle>Confirmation of ticket cancellation</DialogTitle>
			<DialogContent>
				<Typography>
					Are you sure you want to cancel your ticket?{" "}
					<strong>{ticketToCancel?.id}</strong> and refund?
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={() => onClose}>Cancel</Button>
				<Button
					onClick={handleCancelTicket}
					variant="contained"
					color="error"
				>
					Cancel Ticket & Refund
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default OrderConfirmCancelDialog;