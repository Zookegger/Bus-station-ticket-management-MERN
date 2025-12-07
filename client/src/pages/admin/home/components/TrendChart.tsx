import React, { useMemo, useRef } from "react";
import {
	Box,
	Typography,
	Card,
	CardContent,
	CardHeader,
	useTheme,
	Divider,
	Stack,
} from "@mui/material";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { ShowChart, SearchOff } from "@mui/icons-material"; // Icon for trend
import type { DailyRevenueRecord } from "@my-types/dashboard";
import { formatCurrency } from "@utils/formatting";
import { format, parseISO } from "date-fns";

interface TrendChartProps {
	data: DailyRevenueRecord[];
	period_type?: "daily" | "monthly" | "yearly";
	title?: string;
	height?: number;
	currency?: string;
	locale?: string;
	color?: string;
	/** Optional component to render in the header (e.g., DateRangeFilter) */
	extra?: React.ReactNode;
}

const CustomTooltip = ({ active, payload, label, currency, locale }: any) => {
	if (active && payload?.[0]) {
		return (
			<Box
				sx={{
					bgcolor: "background.paper",
					boxShadow: 3,
					color: "text.primary",
					p: 1.5,
					borderRadius: 2,
					minWidth: 150,
					border: 1,
					borderColor: "divider",
				}}
			>
				<Typography
					variant="caption"
					color="text.secondary"
					mb={0.5}
					display="block"
				>
					{label}
				</Typography>
				<Typography
					variant="subtitle2"
					fontWeight={700}
					color="primary.main"
				>
					{formatCurrency(payload[0].value, currency, locale)}
				</Typography>
			</Box>
		);
	}
	return null;
};

const TrendChart: React.FC<TrendChartProps> = ({
	data,
	period_type = "daily",
	title = "Revenue Trend", // Default generic title
	height = 300, // Increased default for better visibility
	currency = "VNĐ",
	locale = "en-US",
	color = "#2e7d32", // Matched your green theme
	extra,
}) => {
	const theme = useTheme();
	const hasData = Array.isArray(data) && data.length > 0;
	const gradientIdRef = useRef(
		`trendGradient-${Math.random().toString(36).slice(2, 9)}`
	);

	const formattedData = useMemo(() => {
		return (data || []).map((d) => {
			let label = String(d.period ?? "");
			try {
				const date =
					typeof d.period === "string"
						? parseISO(d.period)
						: new Date(d.period);
				if (!isNaN(date.getTime())) {
					label = format(date, "dd MMM");
				}
			} catch (e) {}
			return { ...d, period: label };
		});
	}, [data, period_type]);

	return (
		<Card
			sx={{
				width: "100%",
				height: "100%",
				boxShadow: 2,
				borderRadius: 2,
				display: "flex",
				flexDirection: "column",
				flex: 1,
			}}
		>
			<CardHeader
				title={
					<Typography variant="h6" fontWeight={700}>
						{title}
					</Typography>
				}
				subheader="Income over selected period"
				avatar={
					<Box
						sx={{
							color: "primary.main",
							borderRadius: 1,
							display: "flex",
							opacity: 0.2,
						}}
					>
						<ShowChart fontSize="large" />
					</Box>
				}
				action={extra}
				slotProps={{
					action: {
						sx: {
							alignSelf: "stretch",
						},
					},
				}}
			/>
			<Divider />

			<CardContent sx={{ flexGrow: 1, p: 2, minHeight: height }}>
				{!hasData ? (
					<Stack
						alignItems="center"
						justifyContent="center"
						sx={{ height: "100%", color: "text.secondary" }}
						spacing={2}
					>
						<SearchOff sx={{ fontSize: 48, opacity: 0.5 }} />
						<Typography variant="body1">
							No revenue data for this period
						</Typography>
					</Stack>
				) : (
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart
							data={formattedData}
							margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
						>
							<defs>
								<linearGradient
									id={gradientIdRef.current}
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="5%"
										stopColor={color}
										stopOpacity={0.2}
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
								stroke={theme.palette.divider}
								vertical={false}
							/>
							<XAxis
								dataKey="period"
								tick={{
									fontSize: 12,
									fill: theme.palette.text.secondary,
								}}
								axisLine={false}
								tickLine={false}
								interval="preserveStartEnd"
								minTickGap={30}
								dy={10}
							/>
							<YAxis
								tickFormatter={(v) =>
									formatCurrency(v, currency, locale)
								}
								tick={{
									fontSize: 12,
									fill: theme.palette.text.secondary,
								}}
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
								strokeWidth={3}
								fill={`url(#${gradientIdRef.current})`}
								activeDot={{ r: 6, strokeWidth: 0 }}
							/>
						</AreaChart>
					</ResponsiveContainer>
				)}
			</CardContent>
		</Card>
	);
};

export default TrendChart;
