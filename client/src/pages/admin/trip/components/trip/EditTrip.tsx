import React, { useEffect, useState } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "@constants";
import { TripStatus } from "@my-types/trip";

const EditTrip: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (!id) return;
    axios
      .get(API_ENDPOINTS.TRIP.BY_ID.replace(":id", String(id)))
      .then((res) => {
        const t = res.data.trip || res.data;
        setForm({
          startTime: t.startTime ? new Date(t.startTime).toISOString().slice(0, 16) : "",
          endTime: t.endTime ? new Date(t.endTime).toISOString().slice(0, 16) : "",
          isRoundTrip: !!t.isRoundTrip,
          returnStartTime: t.returnStartTime ? new Date(t.returnStartTime).toISOString().slice(0, 16) : "",
          returnEndTime: t.returnEndTime ? new Date(t.returnEndTime).toISOString().slice(0, 16) : "",
        });
      })
      .catch((err) => console.error("Failed to load trip", err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    const payload: any = {};
    if (form.startTime) payload.startTime = new Date(form.startTime).toISOString();
    if (form.endTime) payload.endTime = new Date(form.endTime).toISOString();
    payload.isRoundTrip = !!form.isRoundTrip;
    if (form.returnStartTime) payload.returnStartTime = new Date(form.returnStartTime).toISOString();
    if (form.returnEndTime) payload.returnEndTime = new Date(form.returnEndTime).toISOString();

    try {
      await axios.put(API_ENDPOINTS.TRIP.UPDATE(Number(id)), payload);
      navigate("../");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update trip");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", color: "#2E7D32", mb: 3 }}
      >
        Edit Trip
      </Typography>
      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : (
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
                    value={form.startTime || ""}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Arrival Time"
                    type="datetime-local"
                    value={form.endTime || ""}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={<Checkbox checked={!!form.isRoundTrip} onChange={(e) => setForm({ ...form, isRoundTrip: e.target.checked })} />}
                    label="Is Round Trip?"
                  />
                </Grid>
                {form.isRoundTrip && (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Return Departure"
                        type="datetime-local"
                        value={form.returnStartTime || ""}
                        onChange={(e) => setForm({ ...form, returnStartTime: e.target.value })}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Return Arrival"
                        type="datetime-local"
                        value={form.returnEndTime || ""}
                        onChange={(e) => setForm({ ...form, returnEndTime: e.target.value })}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    backgroundColor: "#2E7D32",
                    "&:hover": { backgroundColor: "#276a2b" },
                  }}
                  onClick={handleSave}
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
        </Grid>
      )}
    </Box>
  );
};

export default EditTrip;
