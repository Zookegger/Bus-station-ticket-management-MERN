import React, { useMemo, useState, useEffect } from "react";
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
import { Error as ErrorIcon } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { type DriverRecord } from "@my-types/driver";
import DriverDetails from "./components/DriverDetails";
import { useNavigate } from "react-router-dom";
import callApi from "@utils/apiCaller";
import { type DriverFromServer, type DriversResponse } from "@my-types/driver";

type Order = "asc" | "desc";
type OrderBy = keyof Pick<
  DriverRecord,
  "fullName" | "email" | "phone" | "rating"
>;

// Transform server data to client format
const transformDriverData = (drivers: DriverFromServer[]): DriverRecord[] => {
  return drivers.map((driver) => {
    // Generate email from fullname (placeholder)
    const email = driver.fullname
      ? `${driver.fullname.toLowerCase().replace(/\s+/g, ".")}@example.com`
      : "unknown@example.com";

    // Determine status based on server fields
    let status: "active" | "inactive" | "suspended" = "inactive";
    if (driver.isSuspended) {
      status = "suspended";
    } else if (driver.isActive) {
      status = "active";
    }

    return {
      id: driver.id,
      fullName: driver.fullname || "Unknown Driver",
      email,
      phone: driver.phoneNumber || "N/A",
      gender: "Male", // Placeholder
      dateOfBirth: "1990-01-01", // Placeholder
      address: "Not provided", // Placeholder
      licenseNumber: driver.licenseNumber || "N/A",
      licenseClass: driver.licenseCategory || "N/A",
      issueDate: driver.licenseIssueDate ? driver.licenseIssueDate : "N/A",
      expiryDate: driver.licenseExpiryDate ? driver.licenseExpiryDate : "N/A",
      status,
      totalTrips: 0, // Placeholder
      totalEarnings: 0, // Placeholder
      rating: 4.0, // Placeholder
      avatar: driver.avatar || undefined,
    };
  });
};

const Driver: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  // Fetch drivers from API
  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await callApi<DriversResponse>({
          method: "GET",
          url: "/drivers",
        });

        if (res) {
          // Handle different possible response envelopes
          const driversPayload =
            (res as any).rows ??
            (res as any).data?.rows ??
            (res as any).drivers ??
            (res as any).data?.drivers ??
            (res as any).payload?.drivers ??
            (res as any);

          const serverDrivers = Array.isArray(driversPayload)
            ? driversPayload
            : [];
          const transformedDrivers = transformDriverData(serverDrivers);
          setDrivers(transformedDrivers);
        }
      } catch (err: any) {
        console.error("Failed to fetch drivers:", err);
        setErrorMessage(
          err.message ?? "Failed to load drivers. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  // Filter
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return drivers.filter((d) => {
      const matchesSearch =
        !term ||
        [d.fullName, d.email, d.phone, d.licenseNumber].some((f) =>
          f.toLowerCase().includes(term)
        );
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, statusFilter]);

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

  // CRUD Handlers
  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;

    try {
      await callApi({
        method: "DELETE",
        url: `/drivers/${driverId}`,
      });

      // Refresh data from server
      await refreshDrivers();
      handleCloseMenu();
    } catch (err: any) {
      console.error("Failed to delete driver:", err);
      alert("Failed to delete driver. Please try again.");
    }
  };

  const handleCreateDriver = () => {
    console.log("handleCreateDriver");
    navigate("/dashboard/driver/create");
  };

  const refreshDrivers = async () => {
    try {
      const res = await callApi<DriversResponse>({
        method: "GET",
        url: "/drivers",
      });

      if (res) {
        const driversPayload =
          (res as any).rows ??
          (res as any).data?.rows ??
          (res as any).drivers ??
          (res as any).data?.drivers ??
          (res as any).payload?.drivers ??
          (res as any);

        const serverDrivers = Array.isArray(driversPayload)
          ? driversPayload
          : [];
        const transformedDrivers = transformDriverData(serverDrivers);
        setDrivers(transformedDrivers);
      }
    } catch (err: any) {
      console.error("Failed to refresh drivers:", err);
    }
  };

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

      <Button
        variant="contained"
        sx={{ textTransform: "none", mb: 2 }}
        onClick={handleCreateDriver}
      >
        + Add Driver
      </Button>

      <Paper variant="outlined" sx={{ p: 2 }}>
        {errorMessage && (
          <Alert icon={<ErrorIcon />} severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

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
              of {filtered.length} records
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
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <Typography>Loading drivers...</Typography>
          </Box>
        ) : (
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
                      Name & Information
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
                      Phone Number
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "rating"}
                      direction={orderBy === "rating" ? order : "asc"}
                      onClick={() => handleSort("rating")}
                    >
                      Rating
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No drivers found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleRows.map((d) => (
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
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {d.fullName}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              sx={{ mt: 0.5 }}
                            >
                              <Chip
                                label={d.licenseClass}
                                size="small"
                                sx={{ height: 20, fontSize: 11 }}
                              />
                              <Chip
                                label={d.status}
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
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {d.email}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {d.phone}
                      </TableCell>
                      <TableCell align="right">
                        ⭐ {d.rating.toFixed(1)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, d)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

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
        <MenuItem
          onClick={() =>
            selectedDriver &&
            navigate(`/dashboard/driver/edit/${selectedDriver.id}`)
          }
        >
          Edit Driver
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedDriver && handleDeleteDriver(selectedDriver.id)
          }
          sx={{ color: "error.main" }}
        >
          Delete Driver
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
