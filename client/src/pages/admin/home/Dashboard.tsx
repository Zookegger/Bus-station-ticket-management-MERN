import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DateRangeFilter } from "./DateRangeFilter";
import { DailyRevenueChart } from "./DailyRevenueChart";
import { TopRoutesChart } from "./TopRoutesChart";
import { OrderTable } from "./OrderTable";
import { WeeklyRevenueChart } from "./WeeklyRevenueChart";
import { MonthlyComparisonChart } from "./MonthlyComparisonChart";
import { CancellationRateChart } from "./CancellationRateChart";
import { TopCustomersList } from "./TopCustomersList";
import {
  AssessmentRounded,
  Download,
  Error as ErrorIcon,
} from "@mui/icons-material";
import callApi from "@utils/apiCaller";
import type { DashboardStats } from "@my-types/dashboard";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);

export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats on component mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await callApi({
          method: "GET",
          url: "/dashboard/stats",
        });

        // Handle different possible response envelopes
        const stats = response?.data || response;
        if (stats) {
          setDashboardStats(stats);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err: any) {
        console.error("Failed to fetch dashboard stats:", err);
        setError(
          err.message || "Failed to load dashboard data. Please try again."
        );
        // Fallback to mock data for development
        setDashboardStats({
          totalRevenue: 3525300,
          avgTicketPrice: 160240,
          ticketsSold: 22,
          cancelledTickets: 2,
          totalUsers: 150,
          totalTrips: 45,
          dailyRevenue: [],
          dailyComparison: [],
          monthlyComparison: [],
          yearlyComparison: [],
          cancellationRate: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const handleApplyFilter = (from: string, to: string) => {
    console.log("Filter from:", from, "to:", to);
    // TODO: Implement date range filtering
    // const fetchFilteredStats = async () => {
    //   try {
    //     const response = await callApi({
    //       method: "GET",
    //       url: "/dashboard/stats",
    //       params: { from, to }
    //     });
    //     // Update stats with filtered data
    //   } catch (err) {
    //     console.error("Failed to fetch filtered stats:", err);
    //   }
    // };
    // fetchFilteredStats();
  };

  const handleClearFilter = () => {
    console.log("Clear filter");
    // TODO: Reset to default date range
  };

  if (loading) {
    return (
      <Box
        p={3}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6">Loading dashboard data...</Typography>
        </Stack>
      </Box>
    );
  }

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

      {error && (
        <Alert icon={<ErrorIcon />} severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ bgcolor: "#1976d2", color: "#fff" }}>
            <CardContent>
              <Typography variant="subtitle2">Total Revenue</Typography>
              <Typography variant="h5" fontWeight={700}>
                {dashboardStats
                  ? formatCurrency(dashboardStats.totalRevenue)
                  : formatCurrency(3525300)}
              </Typography>
              <Typography variant="caption">All Time</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ bgcolor: "#000", color: "#fff" }}>
            <CardContent>
              <Typography variant="subtitle2">Average Ticket Price</Typography>
              <Typography variant="h5" fontWeight={700}>
                {dashboardStats
                  ? formatCurrency(dashboardStats.avgTicketPrice)
                  : formatCurrency(160240)}
              </Typography>
              <Typography variant="caption">Per Ticket</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ bgcolor: "#f9a825", color: "#fff" }}>
            <CardContent>
              <Typography variant="subtitle2">Tickets Sold</Typography>
              <Typography variant="h5" fontWeight={700}>
                {dashboardStats?.ticketsSold ?? 22}
              </Typography>
              <Typography variant="caption">Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ bgcolor: "#d32f2f", color: "#fff" }}>
            <CardContent>
              <Typography variant="subtitle2">Cancelled Tickets</Typography>
              <Typography variant="h5" fontWeight={700}>
                {dashboardStats?.cancelledTickets ?? 2}
              </Typography>
              <Typography variant="caption">Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Additional Stats Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ bgcolor: "#4caf50", color: "#fff" }}>
            <CardContent>
              <Typography variant="subtitle2">Total Users</Typography>
              <Typography variant="h5" fontWeight={700}>
                {dashboardStats?.totalUsers ?? 150}
              </Typography>
              <Typography variant="caption">Registered</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ bgcolor: "#ff9800", color: "#fff" }}>
            <CardContent>
              <Typography variant="subtitle2">Total Trips</Typography>
              <Typography variant="h5" fontWeight={700}>
                {dashboardStats?.totalTrips ?? 45}
              </Typography>
              <Typography variant="caption">Available</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <DailyRevenueChart data={dashboardStats?.dailyRevenue} />
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
              <WeeklyRevenueChart dailyData={dashboardStats?.dailyRevenue} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <MonthlyComparisonChart
                data={dashboardStats?.monthlyComparison}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={2} mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <CancellationRateChart data={dashboardStats?.cancellationRate} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <TopCustomersList />
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
