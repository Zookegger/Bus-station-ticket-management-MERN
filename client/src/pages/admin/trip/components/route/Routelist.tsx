import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import type { Route } from "@pages/admin/vehicle/components/vehicleType/types";

const RouteList: React.FC = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([
    { id: 1, departure: "Hồ Tây", destination: "Vincom Mega Mall Royal City", price: "100,000 đ" },
    { id: 2, departure: "Hồ Tây", destination: "Bitexco Financial Tower", price: "3,000,000 đ" },
    { id: 3, departure: "Thảo Cầm Viên Sài Gòn", destination: "Chợ Bến Thành", price: "230,000 đ" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);

  const filteredRoutes = routes.filter(
    (route) =>
      !searchTerm ||
      route.departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.price.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDelete = (route: Route) => {
    setRouteToDelete(route);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (routeToDelete) {
      setRoutes((prev) => prev.filter((r) => r.id !== routeToDelete.id));
      setRouteToDelete(null);
      setDeleteOpen(false);
    }
  };

  const handleAddNewRoute = () => {
    navigate("/dashboard/trip/createRoute");
  };

  const handleEditRoute = (route: Route) => {
    navigate("/dashboard/trip/editRoute", { state: { route } });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#2E7D32", mb: 3 }}>
        Route List
      </Typography>

      {/* Add New Route Button */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNewRoute}>
          Add New Route
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Departure</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRoutes
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((route) => (
                <TableRow key={route.id} hover>
                  <TableCell>{route.departure}</TableCell>
                  <TableCell>{route.destination}</TableCell>
                  <TableCell>{route.price}</TableCell>
                  <TableCell>
                    {/* Edit Button */}
                    <IconButton
                      size="small"
                      color="primary"
                      title="Edit"
                      onClick={() => handleEditRoute(route)}
                    >
                      <EditIcon />
                    </IconButton>

                    {/* Delete Button */}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleOpenDelete(route)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredRoutes.length}
        page={page}
        onPageChange={(_e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(Number(e.target.value))}
        rowsPerPageOptions={[5, 10, 20]}
        labelRowsPerPage="Show"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Route</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the route from{" "}
          <strong>{routeToDelete?.departure}</strong> to <strong>{routeToDelete?.destination}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RouteList;
