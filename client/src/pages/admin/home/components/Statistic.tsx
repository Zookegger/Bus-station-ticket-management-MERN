import {
	Box,
	Grid,
	Card,
	CardContent,
	Typography,
	Stack,
	Button,
} from "@mui/material";
import DateRangeFilter from "./DateRangeFilter";
import RevenueChart from "./RevenueChart";
import { RateDistributionChart, PeriodComparisonChart } from "./index";
import { AssessmentRounded, Download } from "@mui/icons-material";
import type {
	DailyRevenueRecord,
	MonthlyComparisonRecord,
	CancellationRecord,
	RevenueStatsSummary,
} from "../../../../types/dashboard";
import { formatCurrency } from "@utils/formatting";
import { useDateRangeFilter } from "@hooks/useDateRangeFilter";

/**
 * Generic stats payload passed into Statistics component.
 */
interface StatisticsProps {
	stats: RevenueStatsSummary;
	daily_revenue: DailyRevenueRecord[];
	monthly_comparison: MonthlyComparisonRecord[];
	cancellation_records: CancellationRecord[];
	on_apply_date_range: (from: string, to: string) => void;
	on_clear_date_range: () => void;
	on_export_excel?: () => void;
	on_export_pdf?: () => void;
	currency?: string;
}

/**
 * Statistics dashboard component.
 * Accepts dynamic data via props instead of relying on static in-file constants.
 */
const Statistics = ({
	stats,
	daily_revenue,
	monthly_comparison,
	cancellation_records,
	on_apply_date_range,
	on_clear_date_range,
	on_export_excel,
	on_export_pdf,
	currency = "VND",
}: StatisticsProps) => {
	const { from_date, to_date, update_date, clear_dates } =
		useDateRangeFilter();
	const handle_apply = () => on_apply_date_range(from_date, to_date);
	const handle_clear = () => {
		clear_dates();
		on_clear_date_range();
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
					<Button
						startIcon={<Download />}
						variant="outlined"
						onClick={on_export_excel}
						disabled={!on_export_excel}
					>
						Export to Excel
					</Button>
					<Button
						startIcon={<Download />}
						variant="contained"
						onClick={on_export_pdf}
						disabled={!on_export_pdf}
					>
						Export to PDF
					</Button>
				</Stack>
			</Stack>

			{/* Summary Cards */}
			<Grid container spacing={2} mb={3}>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Card sx={{ bgcolor: "#1976d2", color: "#fff" }}>
						<CardContent>
							<Typography variant="subtitle2">
								Total Revenue
							</Typography>
							<Typography variant="h5" fontWeight={700}>
								{formatCurrency(stats.totalRevenue, currency)}
							</Typography>
							<Typography variant="caption">All Time</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Card sx={{ bgcolor: "#000", color: "#fff" }}>
						<CardContent>
							<Typography variant="subtitle2">
								Average Ticket Price
							</Typography>
							<Typography variant="h5" fontWeight={700}>
								{formatCurrency(stats.avgTicketPrice, currency)}
							</Typography>
							<Typography variant="caption">
								Per Ticket
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Card sx={{ bgcolor: "#f9a825", color: "#fff" }}>
						<CardContent>
							<Typography variant="subtitle2">
								Tickets Sold
							</Typography>
							<Typography variant="h5" fontWeight={700}>
								{stats.ticketsSold}
							</Typography>
							<Typography variant="caption">Total</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Card sx={{ bgcolor: "#d32f2f", color: "#fff" }}>
						<CardContent>
							<Typography variant="subtitle2">
								Cancelled Tickets
							</Typography>
							<Typography variant="h5" fontWeight={700}>
								{stats.cancelledTickets}
							</Typography>
							<Typography variant="caption">Total</Typography>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* Charts Row */}
			<Grid container spacing={3} mb={3}>
				<Grid size={{ xs: 12, md: 6 }}>
					<Card>
						<CardContent>
							<RevenueChart
								data={daily_revenue}
								currency={currency}
							/>
						</CardContent>
					</Card>
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					<Card>
						<CardContent>
							<PeriodComparisonChart
								data={monthly_comparison}
								currency={currency}
							/>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* Date Filter */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<DateRangeFilter
						from_date={from_date}
						to_date={to_date}
						on_change={update_date}
						on_apply={handle_apply}
						on_clear={handle_clear}
					/>
				</CardContent>
			</Card>

			{/* Cancellation Chart */}
			<Grid container spacing={3} mt={2} mb={3}>
				<Grid size={{ xs: 12, md: 6 }}>
					<Card>
						<CardContent>
							<RateDistributionChart
								data={cancellation_records}
							/>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default Statistics;
