import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import { DateRangeFilter } from "./DateRangeFilter";
import { DailyRevenueChart } from "./DailyRevenueChart";
import { TopRoutesChart } from "./TopRoutesChart";
import { OrderTable } from "./OrderTable";
import { WeeklyRevenueChart } from "./WeeklyRevenueChart";
import { CancellationRateChart } from "./CancellationRateChart";
import { TopCustomersList } from "./TopCustomersList";
import { AssessmentRounded, Download } from "@mui/icons-material";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);

export default function Statistics() {
  const handleApplyFilter = (from: string, to: string) => {
    console.log("Filter from:", from, "to:", to);
    // Gọi API sau
  };

  const handleClearFilter = () => {
    console.log("Clear filter");
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <AssessmentRounded sx={{ color: "#2e7d32" }} />
          <Typography variant="h5" fontWeight={700} color="#2e7d32">
            Revenue Statistics
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<Download />} variant="outlined">
            Export to Excel
          </Button>
          <Button startIcon={<Download />} variant="contained">
            Export to PDF
          </Button>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: "#1976d2", color: "#fff" }}>
            <CardContent>
              <Typography variant="subtitle2">Total Revenue</Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(3525300)}
              </Typography>
              <Typography variant="caption">All Time</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: "#000", color: "#fff" }}>
            <CardContent>
              <Typography variant="subtitle2">Average Ticket Price</Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(160240)}
              </Typography>
              <Typography variant="caption">Per Ticket</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: "#f9a825", color: "#fff" }}>
            <CardContent>
              <Typography variant="subtitle2">Tickets Sold</Typography>
              <Typography variant="h5" fontWeight={700}>
                22
              </Typography>
              <Typography variant="caption">Views</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: "#d32f2f", color: "#fff" }}>
            <CardContent>
              <Typography variant="subtitle2">Cancelled Tickets</Typography>
              <Typography variant="h5" fontWeight={700}>
                2
              </Typography>
              <Typography variant="caption">Views</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <DailyRevenueChart />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <TopRoutesChart />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Date Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <DateRangeFilter
            onApply={handleApplyFilter}
            onClear={handleClearFilter}
          />
        </CardContent>
      </Card>

      <Grid container spacing={3} mt={2} mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <WeeklyRevenueChart />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <CancellationRateChart />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <Card>
          <CardContent>
            <TopCustomersList />
          </CardContent>
        </Card>
      </Card>

      {/* Order Table */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Order Details
          </Typography>
          <OrderTable />
        </CardContent>
      </Card>
    </Box>
  );
}
