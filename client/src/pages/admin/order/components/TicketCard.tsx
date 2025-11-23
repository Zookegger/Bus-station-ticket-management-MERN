import { Paper, Typography, Stack, Button, Chip, Box } from "@mui/material";
import { Cancel as CancelIcon } from "@mui/icons-material";
import type { Ticket, TicketStatus } from "@my-types/ticket";

interface TripInfo {
  departure: string;
  destination: string;
  tripCode: string;
  departureDate: string;
}

interface TicketCardProps {
  ticket: Ticket;
  tripInfo: TripInfo;
  onCancel: (ticket: Ticket) => void;
}

/**
 * Renders a single ticket with its status, trip info and a cancel/refund action.
 * Provides a consistent mapping from `TicketStatus` values to user-friendly labels and colors.
 * @param {TicketCardProps} props - The ticket, derived trip info and cancellation handler.
 */
export default function TicketCard({ ticket, tripInfo, onCancel }: TicketCardProps) {
  // Determine if the ticket can be cancelled/refunded based on its current status
  const canCancel = ticket.status === "COMPLETED" || ticket.status === "PENDING" || ticket.status === "BOOKED";

  // Human-readable labels for each ticket status
  const statusLabelMap: Record<TicketStatus, string> = {
    PENDING: "Pending",
    BOOKED: "Booked",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
    REFUNDED: "Refunded",
    INVALID: "Invalid",
    EXPIRED: "Expired",
  };

  // Color mapping for status chip (MUI semantic colors)
  const statusColorMap: Record<TicketStatus, "default" | "success" | "warning" | "error" | "info"> = {
    PENDING: "warning",
    BOOKED: "info",
    CANCELLED: "error",
    COMPLETED: "success",
    REFUNDED: "success",
    INVALID: "error",
    EXPIRED: "error",
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box>
          <Box style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Ticket ID: {ticket.id}
            </Typography>
            <Chip
              label={statusLabelMap[ticket.status] ?? ticket.status}
              color={statusColorMap[ticket.status] ?? "default"}
              size="small"
            />
          </Box>

          <Stack spacing={0.5} mt={1}>
            <Typography variant="body2">
              <strong>Seat:</strong> {ticket.seat?.number ?? "-"}
            </Typography>
            <Typography variant="body2">
              <strong>Trip:</strong> {tripInfo.departure} to{" "}
              {tripInfo.destination}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Departure: {new Date(tripInfo.departureDate).toLocaleString("en-US")}
            </Typography>
          </Stack>
        </Box>

        {canCancel && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<CancelIcon />}
            onClick={() => onCancel(ticket)}
          >
            Cancel / Refund
          </Button>
        )}
      </Stack>
    </Paper>
  );
}