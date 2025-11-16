import { Box, Typography } from "@mui/material";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import type { DailyRevenueRecord } from "@my-types/dashboard";
import { formatCurrency } from "@utils/formatting";

interface TrendChartProps {
	/** Array of trend records (fetched). */
	data: DailyRevenueRecord[];
	/** * The type of period being displayed.
	 * This determines the default title.
	 * @default 'daily'
	 */
	period_type?: "daily" | "monthly" | "yearly";
	/** Optional title override. */
	title?: string;
	/** Chart height (default 220). */
	height?: number;
	/** Currency code (default 'USD'). */
	currency?: string;
	/** Locale for currency formatting (default 'en-US'). */
	locale?: string;
	/** Color for the area gradient and line (default '#1976d2'). */
	color?: string;
}

/**
 * A map of default titles based on the period type.
 */
const PERIOD_TITLES = {
	daily: "Daily Trend",
	monthly: "Monthly Trend",
	yearly: "Yearly Trend",
};

/** Custom tooltip content for the trend chart. */
const CustomTooltip = ({ active, payload, currency, locale }: any) => {
	if (active && payload?.[0]) {
		return (
			<Box
				sx={{
					bgcolor: "rgba(0,0,0,0.85)",
					color: "#fff",
					p: 1,
					borderRadius: 1,
				}}
			>
				<Typography variant="body2">
					{formatCurrency(payload[0].value, currency, locale)}
				</Typography>
			</Box>
		);
	}
	return null;
};

/**
 * TrendChart component.
 * Renders a versatile area chart for daily, monthly, or yearly trends.
 */
const TrendChart: React.FC<TrendChartProps> = ({
	data,
	period_type = "daily",
	title,
	height = 220,
	currency = "USD",
	locale = "en-US",
	color = "#1976d2",
}) => {
	const hasData = Array.isArray(data) && data.length > 0;

	// Use the custom title if provided, otherwise use the dynamic default
	const chartTitle = title || PERIOD_TITLES[period_type];

	// Unique ID for the gradient definition
	const gradientId = `trendGradient-${period_type}`;

	return (
		<Box>
			<Typography variant="subtitle2" fontWeight={600} gutterBottom>
				{chartTitle}
			</Typography>
			<Box sx={{ width: "100%", height }}>
				<ResponsiveContainer width="100%" height="100%">
					{hasData ? (
						<AreaChart data={data}>
							<defs>
								<linearGradient
									id={gradientId}
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="5%"
										stopColor={color}
										stopOpacity={0.8}
									/>
									<stop
										offset="95%"
										stopColor={color}
										stopOpacity={0}
									/>
								</linearGradient>
							</defs>

							<CartesianGrid
								strokeDasharray="3 3"
								stroke="#e0e0e0"
							/>

							<XAxis
								dataKey="period"
								tick={{ fontSize: 12, fill: "#666" }}
								axisLine={false}
								tickLine={false}
							/>

							<YAxis
								tickFormatter={(v: number) =>
									formatCurrency(v, currency, locale)
								}
								tick={{ fontSize: 12, fill: "#666" }}
								axisLine={false}
								tickLine={false}
								width={80}
							/>

							<Tooltip
								content={
									<CustomTooltip
										currency={currency}
										locale={locale}
									/>
								}
							/>

							<Area
								type="monotone"
								dataKey="value"
								stroke={color}
								fill={`url(#${gradientId})`}
								strokeWidth={2.5}
								dot={{ fill: color, r: 4 }}
								activeDot={{ r: 6 }}
							/>
						</AreaChart>
					) : (
						<Box
							display="flex"
							alignItems="center"
							justifyContent="center"
							height="100%"
						>
							<Typography variant="body2" color="text.secondary">
								No data available
							</Typography>
						</Box>
					)}
				</ResponsiveContainer>
			</Box>
		</Box>
	);
};

export default TrendChart;