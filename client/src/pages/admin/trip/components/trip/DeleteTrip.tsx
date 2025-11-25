import React from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "@constants";

interface DeleteTripProps {
  tripId?: number;
}

const DeleteTrip: React.FC<DeleteTripProps> = ({ tripId }) => {
  const navigate = useNavigate();
  const params = useParams();
  const id = tripId || (params.id ? Number(params.id) : undefined);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await axios.delete(API_ENDPOINTS.TRIP.DELETE(id));
      navigate("../");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete trip.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", color: "#c62828", mb: 2 }}
      >
        Delete Trip
      </Typography>
      <Paper
        sx={{ p: 2, border: "1px solid #fde0dc", backgroundColor: "#fff8f6" }}
      >
        <Typography sx={{ mb: 2, color: "#bf360c" }}>
          Are you sure you want to delete this trip? This action cannot be
          undone.
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>
                Trip Information
              </Typography>
              <Typography>Trip ID: {id ?? "-"}</Typography>
            </Paper>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="error"
            sx={{ textTransform: "none" }}
            onClick={handleDelete}
          >
            Delete Trip
          </Button>
          <Button
            variant="outlined"
            sx={{ textTransform: "none" }}
            onClick={() => navigate("../")}
          >
            Back to List
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DeleteTrip;
