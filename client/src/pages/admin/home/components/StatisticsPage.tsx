import {
	Box,
	Grid,
	Card,
	CardContent,
	Typography,
	Stack,
	Button,
	Menu,
	Tabs,
	Tab,
	Grow,
} from "@mui/material";
import DateRangeFilter from "./DateRangeFilter";
import {
	RateDistributionChart,
	PeriodComparisonChart,
	TrendChart,
} from "./index";
import SummaryCards from "./SummaryCards";
import { AssessmentRounded, Download } from "@mui/icons-material";
import type {
	DailyRevenueRecord,
	MonthlyComparisonRecord,
	CancellationRecord,
	RevenueStatsSummary,
} from "@my-types/dashboard";
import { useDateRangeFilter } from "@hooks/useDateRangeFilter";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { useDeviceType } from "@utils/deviceHooks";
import TabPanel from "@components/common/TabPanel";
import { OrderTable, OrderDetailDialog } from "../../order/components";
import type { Order } from "@my-types/order";

/**
 * Generic stats payload passed into Statistics component.
 */
interface StatisticsProps {
	stats: RevenueStatsSummary;
	daily_revenue: DailyRevenueRecord[];
	daily_comparison: MonthlyComparisonRecord[];
	monthly_comparison: MonthlyComparisonRecord[];
	yearly_comparison: MonthlyComparisonRecord[];
	cancellation_records: CancellationRecord[];
	orders?: Order[];
	loading?: boolean;
	on_apply_date_range: (from: string, to: string) => void;
	on_clear_date_range: () => void;
	on_export_excel?: () => void;
	on_export_pdf?: () => void;
	currency?: string;
}

/**
 * Statistics dashboard component.
 */
const Statistics = ({
	stats,
	daily_revenue,
	daily_comparison,
	monthly_comparison,
	yearly_comparison,
	cancellation_records,
	orders = [],
	loading = false,
	on_apply_date_range,
	on_clear_date_range,
	on_export_excel,
	on_export_pdf,
	currency = "VND",
}: StatisticsProps) => {
	const { from_date, to_date, update_date, clear_dates } =
		useDateRangeFilter();
	const { isTablet, isDesktop } = useDeviceType();

	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

	// Default to Monthly (index 1) to show the most common view first
	const [activeTab, setActiveTab] = useState(1);

	const handleTabChange = (
		_event: React.SyntheticEvent,
		newValue: number
	) => {
		setActiveTab(newValue);
	};

	const handle_apply = () => on_apply_date_range(from_date, to_date);
	const handle_clear = () => {
		clear_dates();
		on_clear_date_range();
	};

	const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
		setMenuOpen(true);
	};
	const handleMenuClose = () => {
		setAnchorEl(null);
		setMenuOpen(false);
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
				<Box
					display={"flex"}
					flexDirection="row"
					alignItems="center"
					justifyContent={"space-between"}
					flex={1}
					overflow={"hidden"}
					whiteSpace={"nowrap"}
				>
					<Box
						display={"flex"}
						alignItems="center"
						overflow={"hidden"}
						whiteSpace={"nowrap"}
					>
						<AssessmentRounded
							sx={{ color: "#2e7d32", marginRight: 0.5 }}
							fontSize="large"
						/>
						<Typography
							variant="h5"
							fontWeight={700}
							color="#2e7d32"
							textOverflow={"ellipsis"}
							overflow={"hidden"}
							whiteSpace={"nowrap"}
						>
							Revenue Statistics
						</Typography>
					</Box>
					<Box display={"flex"} gap={1}>
						{isDesktop || isTablet ? (
							<>
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
							</>
						) : (
							<>
								<Button onClick={handleMenuOpen}>
									<FontAwesomeIcon icon={faEllipsisV} />
								</Button>
								<Menu
									open={menuOpen}
									onClose={handleMenuClose}
									anchorEl={anchorEl}
									sx={{ p: 0 }}
								>
									<Stack
										sx={{
											width: "180px",
											height: "100%",
											paddingX: 1,
											gap: 1,
										}}
									>
										<Button
											startIcon={<Download />}
											variant="outlined"
											onClick={on_export_excel}
											disabled={!on_export_excel}
											fullWidth
										>
											Export to Excel
										</Button>
										<Button
											startIcon={<Download />}
											variant="contained"
											onClick={on_export_pdf}
											disabled={!on_export_pdf}
											fullWidth
										>
											Export to PDF
										</Button>
									</Stack>
								</Menu>
							</>
						)}
					</Box>
				</Box>
			</Stack>

			{/* Summary Cards */}
			<SummaryCards stats={stats} currency={currency} />

			{/* Charts Row */}
			<Grid container spacing={3} mb={3}>
				{/* Trend Chart (Left Side) */}
				<Grid size={{ xs: 12, lg: 6 }}>
					<Grow in={true} timeout={1400}>
						<Box display={"flex"} flex={1} sx={{height: "100%"}}>
							<TrendChart
								data={daily_revenue}
								currency={currency}
								title="Revenue Trend"
								extra={
									<DateRangeFilter
										from_date={from_date}
										to_date={to_date}
										on_change={update_date}
										on_apply={handle_apply}
										on_clear={handle_clear}
									/>
								}
							/>
						</Box>
					</Grow>
				</Grid>

				{/* Comparison Charts (Right Side with Tabs) */}
				<Grid size={{ xs: 12, lg: 6 }}>
					<Grow in={true} timeout={1600}>
						<Box display={"flex"} flex={1} sx={{height: "100%"}}>
							<RateDistributionChart
								data={cancellation_records}
								height={250}
							/>
						</Box>
					</Grow>
				</Grid>
			</Grid>

			{/* Date Filter & Cancellation */}
			<Grid container spacing={3}>
				<Grid size={{ xs: 12 }}>
					<Grow in={true} timeout={1800}>
						<Card
							sx={{
								height: "100%",
								display: "flex",
								flexDirection: "column",
							}}
						>
							<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
								<Tabs
									value={activeTab}
									onChange={handleTabChange}
									variant="fullWidth"
									indicatorColor="primary"
								>
									<Tab label="Daily" />
									<Tab label="Monthly" />
									<Tab label="Yearly" />
								</Tabs>
							</Box>

							<Box sx={{ flexGrow: 1, position: "relative" }}>
								<TabPanel value={activeTab} index={0}>
									<PeriodComparisonChart
										data={daily_comparison}
										currency={currency}
										period_type="daily"
										height={280}
									/>
								</TabPanel>
								<TabPanel value={activeTab} index={1}>
									<PeriodComparisonChart
										data={monthly_comparison}
										currency={currency}
										period_type="monthly"
										height={280}
									/>
								</TabPanel>
								<TabPanel value={activeTab} index={2}>
									<PeriodComparisonChart
										data={yearly_comparison}
										currency={currency}
										period_type="yearly"
										height={280}
									/>
								</TabPanel>
							</Box>
						</Card>
					</Grow>
				</Grid>
			</Grid>

			{/* Recent Orders */}
			<Grid container spacing={3} mt={0}>
				<Grid size={{ xs: 12 }}>
					<Grow in={true} timeout={2000}>
						<Card>
							<CardContent>
								<Typography variant="h6" gutterBottom color="primary">
									Recent Orders
								</Typography>
								<OrderTable
									orders={orders.slice(0, 10)}
									loading={loading}
									onViewDetail={(order) => setSelectedOrder(order)}
								/>
							</CardContent>
						</Card>
					</Grow>
				</Grid>
			</Grid>

			{selectedOrder && (
				<OrderDetailDialog
					open={!!selectedOrder}
					onClose={() => setSelectedOrder(null)}
					order={selectedOrder}
					onRefundOrder={() => {}}
					onRefundTickets={() => {}}
				/>
			)}
		</Box>
	);
};

export default Statistics;
