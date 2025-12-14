import React from "react";
import { Grid, Card, CardContent, Typography, Grow } from "@mui/material";
import { formatCurrency } from "@utils/formatting";
import type { RevenueStatsSummary } from "@my-types/dashboard";

interface SummaryCardsProps {
    stats: RevenueStatsSummary;
    currency?: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats, currency = "VND" }) => {
    return (
        <Grid container spacing={2} mb={3}>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Grow in={true} timeout={200}>
                    <Card sx={{ bgcolor: "#1976d2", color: "#fff", height: "100%" }}>
                        <CardContent>
                            <Typography variant="subtitle2" fontWeight={"bold"}>
                                Total Revenue
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {formatCurrency(stats.totalRevenue, currency, "vi-VN")}
                            </Typography>
                            <Typography variant="caption">All Time</Typography>
                        </CardContent>
                    </Card>
                </Grow>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Grow in={true} timeout={400}>
                    <Card sx={{ bgcolor: "#0e8d52a2", color: "#fff", height: "100%" }}>
                        <CardContent>
                            <Typography variant="subtitle2" fontWeight={"bold"}>
                                Average Ticket Price
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {formatCurrency(stats.avgTicketPrice, currency, "vi-VN")}
                            </Typography>
                            <Typography variant="caption">Per Ticket</Typography>
                        </CardContent>
                    </Card>
                </Grow>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Grow in={true} timeout={600}>
                    <Card sx={{ bgcolor: "#f9a825", color: "#fff", height: "100%" }}>
                        <CardContent>
                            <Typography variant="subtitle2" fontWeight={"bold"}>
                                Tickets Sold
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {stats.ticketsSold}
                            </Typography>
                            <Typography variant="caption">Total</Typography>
                        </CardContent>
                    </Card>
                </Grow>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Grow in={true} timeout={800}>
                    <Card sx={{ bgcolor: "#d32f2f", color: "#fff", height: "100%" }}>
                        <CardContent>
                            <Typography variant="subtitle2" fontWeight={"bold"}>
                                Cancelled Tickets
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {stats.cancelledTickets}
                            </Typography>
                            <Typography variant="caption">Total</Typography>
                        </CardContent>
                    </Card>
                </Grow>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Grow in={true} timeout={1000}>
                    <Card sx={{ bgcolor: "#5e35b1", color: "#fff", height: "100%" }}>
                        <CardContent>
                            <Typography variant="subtitle2" fontWeight={"bold"}>
                                Total Users
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {stats.totalUsers}
                            </Typography>
                            <Typography variant="caption">Registered</Typography>
                        </CardContent>
                    </Card>
                </Grow>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Grow in={true} timeout={1200}>
                    <Card sx={{ bgcolor: "#ef6c00", color: "#fff", height: "100%" }}>
                        <CardContent>
                            <Typography variant="subtitle2" fontWeight={"bold"}>
                                Total Trips
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {stats.totalTrips}
                            </Typography>
                            <Typography variant="caption">Scheduled</Typography>
                        </CardContent>
                    </Card>
                </Grow>
            </Grid>
        </Grid>
    );
};

export default SummaryCards;
