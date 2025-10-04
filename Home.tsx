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

  const handleUpdate = (trip: any) => {
    alert(`Update trip: ${trip.route}`);
  };

  const handleDelete = (trip: any) => {
    if (window.confirm(`Are you sure to delete trip: ${trip.route}?`)) {
      alert(`Deleted trip: ${trip.route}`);
    }
  };

  const popularTrips = [
    {
      route: "Thao Cam Vien Sai Gon - Cho Ben Thanh",
      departure: "01/06/2023 17:00",
      arrival: "01/06/2023 19:00",
      price: "200.000 đ",
    },
    {
      route: "Ho Tay - Vincom Mega Mall Royal City",
      departure: "02/06/2023 18:30",
      arrival: "02/06/2023 22:45",
      price: "135.000 đ",
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Header Section */}
      <Box
        sx={{
          backgroundColor: "#d4e6d4",
          display: "flex",
          flexDirection: "column",
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

            <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 2,
                  mb: 2,
                }}
              >
                <TextField
                  name="from"
                  value={searchForm.from}
                  onChange={handleInputChange}
                  placeholder="From"
                  size="small"
                  fullWidth
                />
                <TextField
                  name="to"
                  value={searchForm.to}
                  onChange={handleInputChange}
                  placeholder="To"
                  size="small"
                  fullWidth
                />
                <TextField
                  name="date"
                  value={searchForm.date}
                  onChange={handleInputChange}
                  placeholder="dd/mm/yyyy"
                  size="small"
                  fullWidth
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                size="small"
                fullWidth
                sx={{ maxWidth: 300 }}
              >
                Search
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Popular Trips Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
          Popular Trips
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {popularTrips.map((trip, index) => (
            <Card
              key={index}
              variant="outlined"
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={700}>
                  {trip.route}
                </Typography>
                <Typography variant="body2">
                  Departure: {trip.departure}
                </Typography>
                <Typography variant="body2">
                  Arrival: {trip.arrival}
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
                  Price: {trip.price}
                </Typography>
              </CardContent>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ px: 2, pb: 2 }}
              >
                <Button variant="contained" color="primary" size="small">
                  Select Seat
                </Button>

                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    onClick={() => handleUpdate(trip)}
                    sx={{ minWidth: 80 }}
                  >
                    Update
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(trip)}
                    sx={{ minWidth: 80 }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
