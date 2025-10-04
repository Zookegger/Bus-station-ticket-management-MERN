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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  TablePagination,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  ArrowUpward as ArrowUpIcon,
} from "@mui/icons-material";
import vehicleDetailsData from "@data/vehicleDetails.json";
import VehicleDetailsDrawer from "./VehicleDetailsDrawer";
import vehiclesData from "@data/vehicles.json";

interface Vehicle {
  id: number;
  name: string;
  licensePlate: string;
  status: string;
  vehicleType: string;
}

interface VehicleDetail {
  id: number;
  name: string;
  vehicleType: string;
  licensePlate: string;
  seatCapacity: number;
  status: string;
  acquiredDate: string;
  lastUpdated: string;
  description: string;
  fuelType: string;
  yearOfManufacture: number;
  insuranceExpiry: string;
  maintenanceSchedule: string;
}

const VehicleList: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles] = useState<Vehicle[]>(vehiclesData);
  const [vehicleDetails] = useState<VehicleDetail[]>(vehicleDetailsData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDetail | null>(
    null
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hoạt động":
        return "success";
      case "Standby":
        return "warning";
      case "In Progress":
        return "info";
      default:
        return "default";
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesStatus = !statusFilter || vehicle.status === statusFilter;
    const matchesType = !typeFilter || vehicle.status === typeFilter;
    const matchesSearch =
      !searchTerm ||
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    const vehicleDetail = vehicleDetails.find(
      (detail) => detail.id === vehicle.id
    );
    if (vehicleDetail) {
      setSelectedVehicle(vehicleDetail);
      setDrawerOpen(true);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedVehicle(null);
  };

  const handleEditVehicle = (vehicle: VehicleDetail) => {
    console.log("Edit vehicle:", vehicle);
  };

  const handleCreateVehicle = () => {
    navigate("/dashboard/vehicle/create");
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#2E7D32",
          mb: 3,
        }}
      >
        Vehicle List
      </Typography>

      {/* Action Button and Filters */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateVehicle}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          Add New Vehicle
        </Button>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Hoạt động">Hoạt động</MenuItem>
              <MenuItem value="Standby">Standby</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={typeFilter}
              label="Filter by Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Limousine 9 chỗ">Limousine 9 chỗ</MenuItem>
              <MenuItem value="Ghế ngồi 16 chỗ">Ghế ngồi 16 chỗ</MenuItem>
              <MenuItem value="Ghế ngồi 29 chỗ">Ghế ngồi 29 chỗ</MenuItem>
              <MenuItem value="Giường nằm 44 chỗ (2 tầng)">
                Giường nằm 44 chỗ (2 tầng)
              </MenuItem>
              <MenuItem value="Giường nằm 34 chỗ (VIP)">
                Giường nằm 34 chỗ (VIP)
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Show entries and Search */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2">Show</Typography>
          <Select
            size="small"
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            sx={{ minWidth: 70 }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
          <Typography variant="body2">entries</Typography>
        </Box>

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
          sx={{ minWidth: 200 }}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Name
                  <ArrowUpIcon fontSize="small" />
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  License Plate
                  <ArrowUpIcon fontSize="small" />
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Status
                  <ArrowUpIcon fontSize="small" />
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Vehicle Type
                  <ArrowUpIcon fontSize="small" />
                </Box>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((vehicle) => (
                <TableRow key={vehicle.id} hover>
                  <TableCell>{vehicle.name}</TableCell>
                  <TableCell>{vehicle.licensePlate}</TableCell>
                  <TableCell>
                    <Chip
                      label={vehicle.status}
                      color={getStatusColor(vehicle.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{vehicle.vehicleType}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(vehicle)}
                        title="View Details"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Box>
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
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {`${page * rowsPerPage + 1} to ${Math.min(
            (page + 1) * rowsPerPage,
            filteredVehicles.length
          )} of ${filteredVehicles.length} entries`}
        </Typography>

        <TablePagination
          component="div"
          count={filteredVehicles.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage=""
        />
      </Box>

      {/* Vehicle Details Drawer */}
      <VehicleDetailsDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        vehicle={selectedVehicle}
        onEdit={handleEditVehicle}
      />
    </Box>
  );
};

export default VehicleList;
