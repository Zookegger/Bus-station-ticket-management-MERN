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
  Stack,
  Chip,
  Alert,
  Button,
  Drawer,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { MOCK_ASSIGNMENTS } from "@data/mockAssignments";
import { MOCK_TRIPS } from "@data/mockTrips";
import { useNavigate } from "react-router-dom";
import AssignmentDetail from "./components/AssignmentDetail"; // Import component chi tiết

const AssignmentList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Join data
  const assignments = useMemo(() => {
    return MOCK_ASSIGNMENTS.map((a) => {
      const trip = MOCK_TRIPS.find((t) => t.id === a.tripId);
      return { ...a, trip };
    });
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return assignments.filter((a) =>
      [a.trip?.startPoint, a.driverName, a.vehicle].some((f) =>
        f?.toLowerCase().includes(term)
      )
    );
  }, [search, assignments]);

  const visible =
    rowsPerPage > 0
      ? filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : filtered;

  const openDetails = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
    setMenuAnchor(null);
  };

  const handleRowClick = (id: string) => {
    openDetails(id);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* === HEADER === */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2E7D32" }}>
          Phân Công Tài Xế
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("assignment/create")}
          sx={{ textTransform: "none" }}
        >
          + Phân công
        </Button>
      </Stack>

      {/* === BẢNG === */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        {assignments.length === 0 ? (
          <Alert severity="info">
            Không có chuyến nào để phân công. Tất cả đã được phân công hoặc ở
            trạng thái "Standby".
          </Alert>
        ) : (
          <>
            {/* Filter Bar */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              mb={2}
              alignItems="center"
            >
              <Typography variant="body2">Hiển thị</Typography>
              <Chip
                label={rowsPerPage === -1 ? "Tất cả" : rowsPerPage}
                size="small"
              />
              <Typography variant="body2">bản ghi</Typography>
              <Box sx={{ flex: 1 }} />
              <TextField
                size="small"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                sx={{ minWidth: 200 }}
              />
            </Stack>

            {/* Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Chuyến</TableCell>
                    <TableCell>Thời gian</TableCell>
                    <TableCell>Tài xế</TableCell>
                    <TableCell>Ngày phân công</TableCell>
                    <TableCell align="right">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visible.map((a) => (
                    <TableRow
                      key={a.id}
                      hover
                      onClick={() => handleRowClick(a.id)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { bgcolor: "#f9f9f9" },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {a.trip?.startPoint}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {a.vehicle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {a.trip?.startTime} - {a.trip?.endTime}
                      </TableCell>
                      <TableCell>{a.driverName}</TableCell>
                      <TableCell>{a.assignedAt}</TableCell>
                      <TableCell
                        align="right"
                        onClick={(e) => e.stopPropagation()} // Ngăn click dòng
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setSelectedId(a.id);
                            setMenuAnchor(e.currentTarget);
                          }}
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
              sx={{ display: "flex", justifyContent: "space-between", pt: 1 }}
            >
              <Typography variant="caption">
                {filtered.length} trong {assignments.length} bản ghi
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
                rowsPerPageOptions={[5, 10, 25]}
              />
            </Box>
          </>
        )}
      </Paper>

      {/* === MENU === */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => selectedId && openDetails(selectedId)}>
          Xem chi tiết
        </MenuItem>
        <MenuItem>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Chỉnh sửa
        </MenuItem>
        <MenuItem sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Hủy phân công
        </MenuItem>
      </Menu>

      {/* === DRAWER CHI TIẾT === */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: 360, sm: 420, md: 520 },
            p: 0,
          },
        }}
      >
        {selectedId && (
          <AssignmentDetail
            assignmentId={selectedId}
            onClose={() => setDrawerOpen(false)}
          />
        )}
      </Drawer>
    </Box>
  );
};

export default AssignmentList;
