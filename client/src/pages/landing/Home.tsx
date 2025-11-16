import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

interface Trip {
  route: string;
  departure: string;
  departureTime: string;
  arrival: string;
  arrivalTime: string;
  price: string;
  type?: string;
}

const popularTrips: Trip[] = [
  {
    route: "Thao Cam Vien Sai Gon - Cho Ben Thanh",
    departure: "2023-06-01",
    departureTime: "17:00",
    arrival: "2023-06-01",
    arrivalTime: "19:00",
    price: "200.000 đ",
    type: "hot",
  },
  {
    route: "Ho Tay - Vincom Mega Mall Royal City",
    departure: "2023-06-02",
    departureTime: "18:30",
    arrival: "2023-06-02",
    arrivalTime: "20:45",
    price: "135.000 đ",
    type: "cheap",
  },
  {
    route: "Ho Tay - Bitexco Financial Tower",
    departure: "2023-06-01",
    departureTime: "14:20",
    arrival: "2023-06-01",
    arrivalTime: "15:20",
    price: "6.050.000 đ",
    type: "vip",
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate(); 

  const [searchForm, setSearchForm] = useState({
    from: "",
    to: "",
    date: "",
  });

  const [filteredTrips, setFilteredTrips] = useState<Trip[]>(popularTrips);
  const [filterType, setFilterType] = useState<string>("all");

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
    setFilterType("all");
  };

  const combinedFilteredTrips = filteredTrips.filter((trip) => {
    if (filterType === "all") return true;
    return trip.type === filterType;
  });

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header Section */}
      <Box sx={{ backgroundColor: "#d4e6d4", py: 2 }}>
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h4" color="primary" fontWeight={700} sx={{ mb: 1 }}>
              Book Your Bus Ticket Online
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              Fast, easy, and secure travel reservations
            </Typography>

            <Box component="form" onSubmit={handleSearch}>
              <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={1.5}>
                <TextField name="from" value={searchForm.from} onChange={handleInputChange} placeholder="From" size="small" />
                <TextField name="to" value={searchForm.to} onChange={handleInputChange} placeholder="To" size="small" />
                <TextField name="date" type="date" value={searchForm.date} onChange={handleInputChange} size="small" />
              </Box>
              <Box display="flex" justifyContent="center" gap={1} mt={2}>
                <Button type="submit" variant="contained" size="small">Search</Button>
                <Button type="button" variant="outlined" size="small" onClick={handleReset}>Reset</Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Popular Trips + Filter */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Popular Trips</Typography>

          <FormControl size="small" sx={{ width: 180 }}>
            <InputLabel>Filter</InputLabel>
            <Select value={filterType} label="Filter" onChange={(e) => setFilterType(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="hot">🔥 Hot / Khuyến mãi</MenuItem>
              <MenuItem value="cheap">💰 Giá rẻ</MenuItem>
              <MenuItem value="vip">⭐ VIP / Cao cấp</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={2}>
          {combinedFilteredTrips.map((trip, index) => (
            <Card key={index}>
              <CardContent>
                <Typography variant="h6" fontWeight={600}>{trip.route}</Typography>
                <Typography variant="caption">Departure: {trip.departure} {trip.departureTime}</Typography><br />
                <Typography variant="caption">Arrival: {trip.arrival} {trip.arrivalTime}</Typography><br />
                <Typography variant="subtitle1" color="success.main" fontWeight={700}>{trip.price}</Typography>
                <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => navigate("/seat-booking")}>
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
