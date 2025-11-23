// src/components/orders/OrderTable.tsx
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

interface OrderTableProps {
  orders: Order[];
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onViewDetail: (order: Order) => void;
}

export default function OrderTable({
  orders,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
  onViewDetail,
}: OrderTableProps) {
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
              <strong>Departure</strong>
            </TableCell>
            <TableCell>
              <strong>Destination</strong>
            </TableCell>
            <TableCell>
              <strong>Trip Code</strong>
            </TableCell>
            <TableCell>
              <strong>Departure Date</strong>
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
                {order.customer.name}
                <br />
                <Typography variant="caption" color="text.secondary">
                  {order.customer.phone}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {order.departure}
                </Typography>
              </TableCell>

              {/* Điểm kết thúc */}
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {order.destination}
                </Typography>
              </TableCell>

              {/* Mã chuyến */}
              <TableCell>
                <Chip
                  label={order.tripCode}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                {new Date(order.departureDate).toLocaleDateString("en-US")}
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {order.departureTime}
                </Typography>
              </TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>{order.total.toLocaleString("vi-VN")} ₫</TableCell>
              <TableCell>
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
                />
              </TableCell>
              <TableCell align="center">
                <IconButton color="primary" onClick={() => onViewDetail(order)}>
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
