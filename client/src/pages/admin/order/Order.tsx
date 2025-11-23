import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { OrderFilters, OrderTable, OrderDetailDialog } from "./components";
import type { Order } from "@my-types/order";
import type { Ticket } from "@my-types/ticket";
import { Box } from "@mui/system";
import callApi from "@utils/apiCaller";

export default function OrderManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    | "all"
    | "pending"
    | "confirmed"
    | "cancelled"
    | "partially_refunded"
    | "refunded"
    | "EXPIRED"
  >("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [ticketToCancel, setTicketToCancel] = useState<Ticket | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await callApi<Order[]>({
          method: "GET",
          url: "/api/orders",
          params: {
            include: ["tickets"],
            // optionally: limit/offset, but we paginate client-side for now
          },
        });
        setOrders(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        (order.guestPurchaserName || "").toLowerCase().includes(q) ||
        (order.guestPurchaserEmail || "").toLowerCase().includes(q) ||
        (order.guestPurchaserPhone || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleRefundOrder = () => {
    alert(`Full refund of order ${selectedOrder?.id}`);
    setSelectedOrder(null);
  };

  const handleCancelTicket = () => {
    if (ticketToCancel) {
      alert(`Cancel ticket ${ticketToCancel.id} and refund`);
      setTicketToCancel(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Order & ticket management
        </Typography>
        <OrderFilters
          search={search}
          statusFilter={statusFilter}
          onSearchChange={setSearch}
          onStatusChange={(value: string) =>
            setStatusFilter(
              value as
                | "all"
                | "pending"
                | "confirmed"
                | "cancelled"
                | "partially_refunded"
                | "refunded"
                | "EXPIRED"
            )
          }
        />
        {loading && (
          <Typography variant="body2" color="text.secondary">
            Loading orders...
          </Typography>
        )}
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
      </Paper>

      <OrderTable
        orders={paginatedOrders}
        page={page}
        rowsPerPage={rowsPerPage}
        total={filteredOrders.length}
        onPageChange={setPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(0);
        }}
        onViewDetail={setSelectedOrder}
      />

      <OrderDetailDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onRefundOrder={handleRefundOrder}
        onCancelTicket={setTicketToCancel}
      />

      {/* Confirm Cancel Ticket */}
      <Dialog open={!!ticketToCancel} onClose={() => setTicketToCancel(null)}>
        <DialogTitle>Confirmation of ticket cancellation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your ticket?{" "}
            <strong>{ticketToCancel?.id}</strong> and refund?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTicketToCancel(null)}>Cancel</Button>
          <Button
            onClick={handleCancelTicket}
            variant="contained"
            color="error"
          >
            Cancel Ticket & Refund
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
