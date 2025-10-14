import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add as AddIcon, MoreVert as MoreIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import trips from "@data/popularTrips.json";

type TripItem = {
  id: number;
  route: string;
  departure: string;
  arrival: string;
  price: string;
  status?: "Completed" | "Standby";
};

interface TripListProps {
  onOpenDetails: (trip: TripItem) => void;
}

const TripList: React.FC<TripListProps> = ({ onOpenDetails }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTrip, setMenuTrip] = useState<TripItem | null>(null);
  const [search, setSearch] = useState("");

  const data: TripItem[] = useMemo(() => {
    return (trips as TripItem[]).map((t, idx) => ({
      ...t,
      // add a simple status for demo purposes
      status: idx % 2 === 0 ? "Completed" : "Standby",
    }));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;
    return data.filter((d) => d.route.toLowerCase().includes(query));
  }, [data, search]);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    trip: TripItem
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuTrip(trip);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuTrip(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2E7D32" }}>
          Trips
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("create")}
          sx={{
            textTransform: "none",
            backgroundColor: "#2E7D32",
            "&:hover": { backgroundColor: "#276a2b" },
          }}
        >
          Add New Trip
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Filter route"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Route</TableCell>
              <TableCell>Departure Time</TableCell>
              <TableCell>Arrival Time</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.route}</TableCell>
                <TableCell>{row.departure}</TableCell>
                <TableCell>{row.arrival}</TableCell>
                <TableCell>{row.price}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => handleOpenMenu(e, row)}>
                    <MoreIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            if (menuTrip) onOpenDetails(menuTrip);
            handleCloseMenu();
          }}
        >
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuTrip) navigate(`edit/${menuTrip.id}`);
            handleCloseMenu();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuTrip) navigate(`delete/${menuTrip.id}`);
            handleCloseMenu();
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TripList;
