import React, { useState } from "react";
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import popularTripsData from "../../data/popularTrips.json";

const Home: React.FC = () => {
  const [searchForm, setSearchForm] = useState({
    from: "",
    to: "",
    date: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchForm);
  };

  const popularTrips = popularTripsData;

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header Section */}
      <Box
        sx={{
          backgroundColor: "#d4e6d4",
          flex: "0 0 50%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          py: 1,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" maxWidth={{ lg: 800 }} mx="auto">
            <Typography
              variant="h4"
              color="primary"
              fontWeight={700}
              sx={{ mb: 1 }}
            >
              Book Your Bus Ticket Online
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Fast, easy, and secure travel reservations
            </Typography>

            <Box component="form" onSubmit={handleSearch}>
              <Box
                display="grid"
                gridTemplateColumns={{
                  xs: "1fr",
                  md: "repeat(3, 1fr)",
                }}
                gap={1.5}
                sx={{ mb: 1.5 }}
              >
                <TextField
                  fullWidth
                  name="from"
                  value={searchForm.from}
                  onChange={handleInputChange}
                  placeholder="From"
                  size="small"
                />
                <TextField
                  fullWidth
                  name="to"
                  value={searchForm.to}
                  onChange={handleInputChange}
                  placeholder="To"
                  size="small"
                />
                <TextField
                  fullWidth
                  name="date"
                  value={searchForm.date}
                  onChange={handleInputChange}
                  placeholder="dd/mm/yyyy"
                  size="small"
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                size="small"
                sx={{ maxWidth: 300 }}
              >
                Search
              </Button>
            </Box>
          </Box>
        </Container>

        {/* Bus Icon Background */}
        <Box
          sx={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            fontSize: "60px",
            color: "#28a745",
            opacity: 0.1,
            zIndex: 1,
          }}
        >
          <i className="fas fa-bus"></i>
        </Box>
      </Box>

      {/* Popular Trips Section */}
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          py: 1.5,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>
          Popular Trips
        </Typography>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
          gap={2}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            alignContent: "start",
            gridAutoRows: { xs: "auto", md: 240 },
          }}
        >
          {popularTrips.map((trip, index) => (
            <Card
              key={index}
              sx={{
                height: { xs: "auto", md: 240 },
                display: "flex",
                flexDirection: "column",
                bgcolor: "#fff !important",
              }}
            >
              <CardContent
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {trip.route}
                </Typography>
                <Box mb={2} sx={{ flex: 1, overflow: "hidden" }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      Departure:
                    </Typography>
                    <Typography variant="body2">{trip.departure}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      Arrival:
                    </Typography>
                    <Typography variant="body2">{trip.arrival}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Price:
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="success.main"
                      fontWeight={700}
                    >
                      {trip.price}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  sx={{
                    mt: "auto",
                    bgcolor: "#1976d2 !important",
                    color: "#fff !important",
                    "&:hover": {
                      bgcolor: "#1565c0 !important",
                    },
                  }}
                >
                  SELECT SEAT
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
