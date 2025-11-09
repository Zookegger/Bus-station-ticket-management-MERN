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
  Button,
  Chip,
  TableSortLabel,
  Divider,
  Avatar,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import { MOCK_USERS } from "@data/mockUsers";
import type { UserRecord } from "@my-types/types";

const currency = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

type Order = "asc" | "desc";
type OrderBy = keyof Pick<
  UserRecord,
  "username" | "fullName" | "email" | "phone"
>;

const User: React.FC = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all"); // LỌC THEO ROLE
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeUser, setActiveUser] = useState<UserRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<OrderBy>("username");

  // === LỌC THEO SEARCH + ROLE ===
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return MOCK_USERS.filter((u) => {
      const matchesSearch =
        !term ||
        [u.username, u.fullName, u.email, u.phone, u.role, u.status].some((f) =>
          f.toLowerCase().includes(term)
        );

      const matchesRole =
        roleFilter === "all" || u.role.toLowerCase() === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter]);

  // === SẮP XẾP ===
  const sorted = useMemo(() => {
    const comparator = (a: UserRecord, b: UserRecord) => {
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
    user: UserRecord
  ) => {
    setActiveUser(user);
    setMenuAnchor(e.currentTarget);
  };
  const handleCloseMenu = () => setMenuAnchor(null);

  const openDetails = (user: UserRecord) => {
    setActiveUser(user);
    setDrawerOpen(true);
    handleCloseMenu();
  };

  const visibleRows =
    rowsPerPage > 0
      ? sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : sorted;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#2E7D32", mb: 2 }}
      >
        Users Management
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        {/* === FILTER BAR === */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Show
            </Typography>
            <Chip
              size="small"
              label={rowsPerPage === -1 ? "All" : rowsPerPage}
              sx={{ mx: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              entries
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {/* LỌC THEO ROLE */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => {
                  setRoleFilter(e.target.value as any);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>

            {/* TÌM KIẾM */}
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

        {/* === BẢNG === */}
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
                    Full Name & Info
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
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((u) => (
                <TableRow key={u.id} hover>
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
                        {getInitials(u.fullName)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {u.fullName}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          sx={{ mt: 0.5 }}
                        >
                          <Chip
                            label={u.role}
                            size="small"
                            color="default"
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: 11,
                              "& .MuiChip-label": { px: 1 },
                              bgcolor:
                                u.role === "admin" ? "#f3e5f5" : "#e3f2fd",
                              color: u.role === "admin" ? "#7b1fa2" : "#1565c0",
                            }}
                          />
                          <Chip
                            label={u.status}
                            size="small"
                            color={u.status === "active" ? "success" : "error"}
                            sx={{
                              height: 20,
                              fontSize: 11,
                              "& .MuiChip-label": { px: 1 },
                            }}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{u.email}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{u.phone}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, u)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* === PHÂN TRANG === */}
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
              ? "0 entries"
              : `${page * rowsPerPage + 1} to ${Math.min(
                  filtered.length,
                  page * rowsPerPage +
                    (rowsPerPage > 0 ? rowsPerPage : filtered.length)
                )} of ${filtered.length} entries`}
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
            rowsPerPageOptions={[5, 9, 25, { label: "All", value: -1 }]}
          />
        </Box>
      </Paper>

      {/* === MENU HÀNH ĐỘNG === */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => activeUser && openDetails(activeUser)}>
          View details
        </MenuItem>
      </Menu>

      {/* === DRAWER CHI TIẾT === */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: 360, sm: 420, md: 520 } } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#1e88e5", mb: 2 }}
          >
            User Details
          </Typography>

          {activeUser && (
            <>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    fontSize: 18,
                    fontWeight: 600,
                    bgcolor: "#e3f2fd",
                    color: "#1565c0",
                  }}
                >
                  {getInitials(activeUser.fullName)}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    {activeUser.fullName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {activeUser.email}
                    </Typography>
                    <Chip
                      size="small"
                      label={activeUser.role}
                      color={
                        activeUser.role === "admin" ? "secondary" : "default"
                      }
                    />
                    <Chip
                      size="small"
                      label={activeUser.status}
                      color={
                        activeUser.status === "active" ? "success" : "error"
                      }
                    />
                  </Stack>
                </Box>
              </Stack>

              <Paper variant="outlined" sx={{ mb: 2 }}>
                <Box sx={{ p: 1.5, background: "#e3f2fd" }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    Personal information
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <EventRoundedIcon fontSize="small" />
                      <Typography variant="body2">
                        Date of birth: {activeUser.dateOfBirth ?? "-"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <HomeRoundedIcon fontSize="small" />
                      <Typography variant="body2">
                        Address: {activeUser.address ?? "-"}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ mb: 2 }}>
                <Box sx={{ p: 1.5, background: "#e3f2fd" }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    Contact Information
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <PhoneIphoneRoundedIcon fontSize="small" />
                      <Typography variant="body2">
                        Phone Number: {activeUser.phone}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <MailOutlineRoundedIcon fontSize="small" />
                      <Typography variant="body2">
                        Email: {activeUser.email}
                      </Typography>
                      <Chip
                        size="small"
                        color={activeUser.emailVerified ? "success" : "default"}
                        label={
                          activeUser.emailVerified ? "Verified" : "Unverified"
                        }
                        sx={{ ml: 1 }}
                      />
                    </Stack>
                  </Stack>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ mb: 2 }}>
                <Box sx={{ p: 1.5, background: "#e3f2fd" }}>
                  <Typography sx={{ fontWeight: 700 }}>Tickets</Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="body2">
                      Total Tickets: {activeUser.ticketsTotal}
                    </Typography>
                    <Typography variant="body2">
                      Total Spent: {currency(activeUser.totalSpentVnd)}
                    </Typography>
                  </Stack>
                </Box>
              </Paper>

              <Divider sx={{ my: 1 }} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setDrawerOpen(false)}
                >
                  Back to List
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default User;
