// DISABLED: This component has MUI v7 breaking changes that need to be fixed
// TODO: Fix Grid component usage (remove 'item' and 'container' props) and error type definitions
// See: https://mui.com/material-ui/migration/migration-grid-v2/

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import type { VehicleType } from "./types";
import vehicleTypesData from "@data/vehicleTypes.json";
import VehicleTypeDetailsDrawer from "./VehicleTypeDetailsDrawer";
import DeleteVehicleTypeDialog from "./DeleteVehicleTypeDialog";

const VehicleTypeList: React.FC = () => {
  const navigate = useNavigate();
  const [vehicleTypes, setVehicleTypes] =
    useState<VehicleType[]>(vehicleTypesData);
  const [selectedVehicleType, setSelectedVehicleType] =
    useState<VehicleType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Removed createOpen and editOpen states since we're using routing now
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [vehicleTypeToDelete, setVehicleTypeToDelete] =
    useState<VehicleType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredVehicleTypes = vehicleTypes.filter((vt) =>
    vt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (vehicleType: VehicleType) => {
    setSelectedVehicleType(vehicleType);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedVehicleType(null);
  };

  const handleOpenCreate = () => {
    navigate("/dashboard/vehicle-type/create");
  };

  const handleCloseCreate = () => {
    navigate("/dashboard/vehicle-type");
  };

  // Removed handleCreate since we're using separate pages now

  const handleOpenEdit = (vehicleType: VehicleType) => {
    navigate(`/dashboard/vehicle-type/edit/${vehicleType.id}`);
  };

  const handleCloseEdit = () => {
    navigate("/dashboard/vehicle-type");
  };

  // Removed handleUpdate since we're using separate pages now

  const handleOpenDelete = (vehicleType: VehicleType) => {
    setVehicleTypeToDelete(vehicleType);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setVehicleTypeToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!vehicleTypeToDelete) return;
    setVehicleTypes((prev) =>
      prev.filter((vt) => vt.id !== vehicleTypeToDelete.id)
    );
    setDeleteOpen(false);
    setVehicleTypeToDelete(null);
  };

  // Remove inline form rendering since we're using routes now

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", color: "#2E7D32", mb: 3 }}
      >
        Vehicle Type List
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ bgcolor: "#1976d2" }}
        >
          Add New Type
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Show</InputLabel>
          <Select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
          >
            <MenuItem value={5}>5 entries</MenuItem>
            <MenuItem value={10}>10 entries</MenuItem>
            <MenuItem value={25}>25 entries</MenuItem>
            <MenuItem value={50}>50 entries</MenuItem>
            <MenuItem value={-1}>All entries</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search:"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Name</TableCell>
              <TableCell>Base Fare</TableCell>
              <TableCell>Total Seats</TableCell>
              <TableCell>Total Flooring</TableCell>
              <TableCell>Total Row</TableCell>
              <TableCell>Total Column</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicleTypes
              .slice(
                page * rowsPerPage,
                rowsPerPage === -1
                  ? undefined
                  : page * rowsPerPage + rowsPerPage
              )
              .map((vehicleType) => (
                <TableRow
                  key={vehicleType.id}
                  hover
                  onClick={() => handleViewDetails(vehicleType)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      {vehicleType.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "medium", color: "#2e7d32" }}
                    >
                      {formatCurrency(vehicleType.baseFare)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={vehicleType.totalSeats}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell>{vehicleType.totalFlooring}</TableCell>
                  <TableCell>{vehicleType.totalRow}</TableCell>
                  <TableCell>{vehicleType.totalColumn}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(vehicleType)}
                      title="View Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEdit(vehicleType)}
                      title="Edit Vehicle Type"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleOpenDelete(vehicleType)}
                      title="Delete Vehicle Type"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredVehicleTypes.length}
        page={page}
        onPageChange={(_e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage === -1 ? 0 : rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(Number(e.target.value))}
        rowsPerPageOptions={[5, 10, 25, 50, { label: "All", value: -1 }]}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} of ${count !== -1 ? count : `more than ${to}`} entries`
        }
      />

      <VehicleTypeDetailsDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        vehicleType={selectedVehicleType}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <DeleteVehicleTypeDialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        vehicleType={vehicleTypeToDelete}
      />
    </Box>
  );
};

export default VehicleTypeList;
