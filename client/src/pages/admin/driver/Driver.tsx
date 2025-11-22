import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  Stack,
  Chip,
  TableSortLabel,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { MOCK_DRIVERS } from "@data/mockDrivers";
import { type DriverRecord } from "@my-types/driver";
import DriverDetails from "./components/DriverDetails";
import { useNavigate } from "react-router-dom";

type Order = "asc" | "desc";
type OrderBy = keyof Pick<
  DriverRecord,
  "fullName" | "email" | "phone" | "rating"
>;

const Driver: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "suspended"
  >("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedDriver, setSelectedDriver] = useState<DriverRecord | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<OrderBy>("fullName");

  // Filter
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return MOCK_DRIVERS.filter((d) => {
      const matchesSearch =
        !term ||
        [d.fullName, d.email, d.phone, d.licenseNumber].some((f) =>
          f.toLowerCase().includes(term)
        );
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  // Sort
  const sorted = useMemo(() => {
    const comparator = (a: DriverRecord, b: DriverRecord) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    };
    return [...filtered].sort(comparator);
  }, [filtered, order, orderBy]);

  const handleSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleOpenMenu = (
    e: React.MouseEvent<HTMLButtonElement>,
    driver: DriverRecord
  ) => {
    setSelectedDriver(driver);
    setMenuAnchor(e.currentTarget);
  };

  const handleCloseMenu = () => setMenuAnchor(null);

  const openDetails = (driver: DriverRecord) => {
    setSelectedDriver(driver);
    setDrawerOpen(true);
    handleCloseMenu();
  };

  const visibleRows =
    rowsPerPage > 0
      ? sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : sorted;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#2E7D32", mb: 2 }}
      >
        Quản lý tài xế
      </Typography>

      <Link to="driver/create">
        <Button variant="contained" sx={{ textTransform: "none", mb: 2 }}>
          + Thêm tài xế
        </Button>
      </Link>

      <Paper variant="outlined" sx={{ p: 2 }}>
        {/* Filter Bar */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Hiển thị
            </Typography>
            <Chip
              size="small"
              label={rowsPerPage === -1 ? "Tất cả" : rowsPerPage}
            />
            <Typography variant="body2" color="text.secondary">
              bản ghi
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(0);
                }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
                <MenuItem value="suspended">Bị đình chỉ</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 200 }}
            />
          </Stack>
        </Stack>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "fullName"}
                    direction={orderBy === "fullName" ? order : "asc"}
                    onClick={() => handleSort("fullName")}
                  >
                    Tên & Thông tin
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "email"}
                    direction={orderBy === "email" ? order : "asc"}
                    onClick={() => handleSort("email")}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "phone"}
                    direction={orderBy === "phone" ? order : "asc"}
                    onClick={() => handleSort("phone")}
                  >
                    Số điện thoại
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "rating"}
                    direction={orderBy === "rating" ? order : "asc"}
                    onClick={() => handleSort("rating")}
                  >
                    Đánh giá
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: 14,
                          fontWeight: 600,
                          bgcolor: "#e0e0e0",
                          color: "#424242",
                        }}
                      >
                        {getInitials(d.fullName)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {d.fullName}
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                          <Chip
                            label={d.licenseClass}
                            size="small"
                            sx={{ height: 20, fontSize: 11 }}
                          />
                          <Chip
                            label={
                              d.status === "active"
                                ? "Hoạt động"
                                : d.status === "suspended"
                                ? "Bị đình chỉ"
                                : "Không hoạt động"
                            }
                            size="small"
                            color={
                              d.status === "active"
                                ? "success"
                                : d.status === "suspended"
                                ? "error"
                                : "default"
                            }
                            sx={{ height: 20, fontSize: 11 }}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{d.email}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{d.phone}</TableCell>
                  <TableCell align="right">⭐ {d.rating.toFixed(1)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, d)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            pt: 1,
          }}
        >
          <Typography variant="caption">
            {filtered.length === 0
              ? "0 bản ghi"
              : `${page * rowsPerPage + 1} - ${Math.min(
                  filtered.length,
                  page * rowsPerPage +
                    (rowsPerPage > 0 ? rowsPerPage : filtered.length)
                )} trong tổng số ${filtered.length} bản ghi`}
          </Typography>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 9, 25, { label: "Tất cả", value: -1 }]}
            labelRowsPerPage="Số hàng mỗi trang:"
          />
        </Box>
      </Paper>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => selectedDriver && openDetails(selectedDriver)}>
          Xem chi tiết
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: 360, sm: 420, md: 560 } } }}
      >
        {selectedDriver && (
          <DriverDetails
            driver={selectedDriver}
            onClose={() => setDrawerOpen(false)}
          />
        )}
      </Drawer>
    </Box>
  );
};

export default Driver;
