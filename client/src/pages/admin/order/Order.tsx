// src/components/orders/OrderManagement.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { mockOrders } from "@data/mockOrder";
import OrderFilters from "./OrderFilters";
import OrderTable from "./OrderTable";
import OrderDetailDialog from "./OrderDetailDialog";
import type { Order, Ticket } from "@my-types/order";
import { Box } from "@mui/system";

export default function OrderManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "paid" | "pending" | "cancelled"
  >("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [ticketToCancel, setTicketToCancel] = useState<Ticket | null>(null);

  const filteredOrders = useMemo(() => {
    return (mockOrders as Order[]).filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.phone.includes(search) ||
        (order.customer.email && order.customer.email.includes(search)) ||
        order.tripCode.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

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
          onStatusChange={setStatusFilter}
        />
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
