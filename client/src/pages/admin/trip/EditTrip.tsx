import React from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Map from "@components/common/Map";

const EditTrip: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", color: "#2E7D32", mb: 3 }}
      >
        Edit Trip
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Trip Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Departure Time"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Arrival Time"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label="Is Two Way?"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Route Name"
                  defaultValue="Hồ Tây - Bitexco Financial Tower"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Vehicle Name"
                  defaultValue="City Runner"
                />
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button
                variant="contained"
                sx={{
                  textTransform: "none",
                  backgroundColor: "#2E7D32",
                  "&:hover": { backgroundColor: "#276a2b" },
                }}
              >
                Update
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
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Vehicle Information
            </Typography>
            <Grid container spacing={1}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Total Seats"
                  defaultValue={40}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Rows"
                  defaultValue={10}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Columns"
                  defaultValue={4}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Floors"
                  defaultValue={1}
                />
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Route Map
            </Typography>
            <Box
              sx={{
                height: 220,
                borderRadius: 1,
                overflow: "hidden",
                border: "1px solid #e0e0e0",
              }}
            >
              <Map height={220} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditTrip;
