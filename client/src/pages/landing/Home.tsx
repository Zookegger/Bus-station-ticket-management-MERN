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

interface Trip {
  route: string;
  departure: string; // yyyy-mm-dd
  departureTime: string; // hh:mm
  arrival: string; // yyyy-mm-dd
  arrivalTime: string; // hh:mm
  price: string;
}

const popularTrips: Trip[] = [
  {
    route: "Thao Cam Vien Sai Gon - Cho Ben Thanh",
    departure: "2023-06-01",
    departureTime: "17:00",
    arrival: "2023-06-01",
    arrivalTime: "19:00",
    price: "200.000 đ",
  },
  {
    route: "Ho Tay - Vincom Mega Mall Royal City",
    departure: "2023-06-02",
    departureTime: "18:30",
    arrival: "2023-06-02",
    arrivalTime: "20:45",
    price: "135.000 đ",
  },
  {
    route: "Ho Tay - Bitexco Financial Tower",
    departure: "2023-06-01",
    departureTime: "14:20",
    arrival: "2023-06-01",
    arrivalTime: "15:20",
    price: "6.050.000 đ",
  },
  // ... bạn có thể thêm nhiều trip khác
];

const Home: React.FC = () => {
  const [searchForm, setSearchForm] = useState({
    from: "",
    to: "",
    date: "",
  });

  const [filteredTrips, setFilteredTrips] = useState<Trip[]>(popularTrips);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const { from, to, date } = searchForm;

    const filtered = popularTrips.filter((trip) => {
      const routeLower = trip.route.toLowerCase();
      const fromMatch = from ? routeLower.includes(from.toLowerCase()) : true;
      const toMatch = to ? routeLower.includes(to.toLowerCase()) : true;
      const dateMatch = date ? trip.departure === date : true;

      return fromMatch && toMatch && dateMatch;
    });

    setFilteredTrips(filtered);
  };

  const handleReset = () => {
    setSearchForm({ from: "", to: "", date: "" });
    setFilteredTrips(popularTrips);
  };

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
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              Fast, easy, and secure travel reservations
            </Typography>

            <Box component="form" onSubmit={handleSearch}>
              <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
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
                  type="date"
                  size="small"
                />
              </Box>
              <Box display="flex" justifyContent="center" gap={1}>
                <Button type="submit" variant="contained" size="small">
                  Search
                </Button>
                <Button type="button" variant="outlined" size="small" onClick={handleReset}>
                  Reset
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
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
          {filteredTrips.map((trip, index) => (
            <Card
              key={index}
              sx={{
                height: { xs: "auto", md: 240 },
                display: "flex",
                flexDirection: "column",
                bgcolor: "#fff !important",
              }}
            >
              <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {trip.route}
                </Typography>
                <Box mb={2} sx={{ flex: 1, overflow: "hidden" }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      Departure:
                    </Typography>
                    <Typography variant="body2">
                      {trip.departure} {trip.departureTime}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      Arrival:
                    </Typography>
                    <Typography variant="body2">
                      {trip.arrival} {trip.arrivalTime}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Price:
                    </Typography>
                    <Typography variant="subtitle1" color="success.main" fontWeight={700}>
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
                    "&:hover": { bgcolor: "#1565c0 !important" },
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
