// src/components/orders/TicketCard.tsx
import { Paper, Typography, Stack, Button, Chip, Box } from "@mui/material";
import { Cancel as CancelIcon } from "@mui/icons-material";
import type { Ticket } from "@my-types/order";

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

export default function TicketCard({
  ticket,
  tripInfo,
  onCancel,
}: TicketCardProps) {
  const canCancel =
    ticket.status === "confirmed" || ticket.status === "pending";

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
              label={
                ticket.status === "confirmed"
                  ? "Confirmed"
                  : ticket.status === "pending"
                  ? "Awaiting Payment"
                  : "Cancelled"
              }
              color={
                ticket.status === "confirmed"
                  ? "success"
                  : ticket.status === "pending"
                  ? "warning"
                  : "error"
              }
              size="small"
            />
          </Box>

          <Stack spacing={0.5} mt={1}>
            <Typography variant="body2">
              <strong>Chair</strong> {ticket.seat}
            </Typography>
            <Typography variant="body2">
              <strong>Vehicle:</strong> {ticket.vehicle.plate} (
              {ticket.vehicle.type})
            </Typography>
            <Typography variant="body2">
              <strong>Driver:</strong> {ticket.driver}
            </Typography>
            <Typography variant="body2">
              <strong>Trip:</strong> {tripInfo.departure} to{" "}
              {tripInfo.destination}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Trip Code: {tripInfo.tripCode} | Departure:{" "}
              {new Date(tripInfo.departureDate).toLocaleDateString("en-US")}
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
