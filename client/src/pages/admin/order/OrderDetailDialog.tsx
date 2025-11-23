// src/components/orders/OrderDetailDialog.tsx
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
import type { Order, Ticket } from "@my-types/order";
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
                order.status === "paid"
                  ? "Paid"
                  : order.status === "pending"
                  ? "Awaiting Payment"
                  : "Cancelled"
              }
              color={
                order.status === "paid"
                  ? "success"
                  : order.status === "pending"
                  ? "warning"
                  : "error"
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
                  {new Date(order.createdAt).toLocaleString("en-US")}
                </Box>
                <Box>
                  <strong>Departure Date:</strong>{" "}
                  {new Date(order.departureDate).toLocaleDateString("en-US")}
                </Box>
                <Box>
                  <strong>Departure Time:</strong>{" "}
                  <Typography
                    component="span"
                    fontWeight="bold"
                    color="primary"
                  >
                    {order.departureTime}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Trip
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <strong>Departure:</strong> <strong>{order.departure}</strong>
                </Box>
                <Box>
                  <strong>Destination:</strong>{" "}
                  <strong>{order.destination}</strong>
                </Box>
                <Box>
                  <strong>Trip Code:</strong>{" "}
                  <Chip
                    label={order.tripCode}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Customer
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <strong>Name:</strong> {order.customer.name}{" "}
                  {order.customer.isGuest && (
                    <Chip label="Guest" size="small" color="default" />
                  )}
                </Box>
                {order.customer.email && (
                  <Box>
                    <strong>Email:</strong> {order.customer.email}
                  </Box>
                )}
                <Box>
                  <strong>Phone:</strong> {order.customer.phone}
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Payment
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <strong>Method:</strong> {order.paymentMethod}
                </Box>
                {order.transactionId && (
                  <Box>
                    <strong>Transaction ID:</strong> {order.transactionId}
                  </Box>
                )}
                <Box>
                  <strong>Amount:</strong>{" "}
                  <Typography component="span" fontWeight="bold" color="error">
                    {order.total.toLocaleString("vi-VN")} ₫
                  </Typography>
                </Box>
              </Stack>

              {order.status === "paid" && (
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
              Ticket List ({order.tickets.length} tickets)
            </Typography>
            <Stack spacing={2}>
              {order.tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  tripInfo={{
                    departure: order.departure,
                    destination: order.destination,
                    tripCode: order.tripCode,
                    departureDate: order.departureDate,
                  }}
                  onCancel={onCancelTicket}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
