import React from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const DeleteTrip: React.FC = () => {
  const navigate = useNavigate();
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
              <Typography>
                Route: Thảo Cầm Viên Sài Gòn ➝ Chợ Bến Thành
              </Typography>
              <Typography>Departure Time: 01/06/2025 12:00</Typography>
              <Typography>Total Price: 280,000 đ</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>Vehicle</Typography>
              <Typography>City Runner</Typography>
              <Typography>Arrival Time: 01/06/2025 18:00</Typography>
              <Typography>Status: Standby</Typography>
            </Paper>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="error"
            sx={{ textTransform: "none" }}
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
