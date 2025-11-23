import React, { useMemo } from "react";
import {
	Box,
	Card,
	CardHeader,
	CardContent,
	Typography,
	useTheme,
	Divider,
	Stack,
	Paper,
	Chip,
} from "@mui/material";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import {
	CompareArrows,
	TrendingUp,
	TrendingDown,
	SearchOff,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import type { MonthlyComparisonRecord } from "@my-types/dashboard";
import { formatCurrency } from "@utils/formatting";

interface PeriodComparisonChartProps {
	data: MonthlyComparisonRecord[];
	period_type?: "daily" | "monthly" | "yearly";
	title?: string;
	height?: number;
	currency?: string;
	locale?: string;
}

const PERIOD_LABELS = {
	daily: {
		title: "Daily Revenue Comparison",
		current: "Today",
		previous: "Yesterday",
	},
	monthly: {
		title: "Monthly Revenue Comparison",
		current: "This Month",
		previous: "Last Month",
	},
	yearly: {
		title: "Yearly Revenue Comparison",
		current: "This Year",
		previous: "Last Year",
	},
};

/**
 * Custom Tooltip to show comparative data and % change.
 */
const CustomTooltip = ({ active, payload, label, currency, locale }: any) => {
	if (active && payload && payload.length >= 2) {
		// payload[0] is usually the first bar defined (Previous), payload[1] is Current
		const previous = payload.find((p: any) => p.dataKey === "previous");
		const current = payload.find((p: any) => p.dataKey === "current");

		const prevValue = previous?.value || 0;
		const currValue = current?.value || 0;

		// Calculate percentage change
		let percentChange = 0;
		if (prevValue > 0) {
			percentChange = ((currValue - prevValue) / prevValue) * 100;
		} else if (currValue > 0) {
			percentChange = 100; // 0 to something is 100% growth effectively
		}

		const isPositive = percentChange >= 0;

		return (
			<Paper
				sx={{ p: 1.5, boxShadow: 3, borderRadius: 2 }}
			>
				<Typography variant="subtitle2" fontWeight={600} gutterBottom>
					{label}
				</Typography>
				<Divider sx={{ mb: 1 }} />

				<Stack spacing={1}>
					{/* Current Period */}
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<Typography
							variant="body2"
							color="primary.main"
							fontWeight={500}
						>
							{current?.name}:
						</Typography>
						<Typography variant="body2" fontWeight={700}>
							{formatCurrency(currValue, currency, locale)}
						</Typography>
					</Box>

					{/* Previous Period */}
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<Typography variant="body2" color="text.secondary">
							{previous?.name}:
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{formatCurrency(prevValue, currency, locale)}
						</Typography>
					</Box>

					{/* Growth Indicator */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 0.5,
							bgcolor: isPositive
								? "success.lighter"
								: "error.lighter",
							color: isPositive ? "success.main" : "error.main",
							py: 0.5,
							px: 1,
							borderRadius: 1,
							width: "fit-content",
							alignSelf: "flex-end",
						}}
					>
						{isPositive ? (
							<TrendingUp fontSize="small" />
						) : (
							<TrendingDown fontSize="small" />
						)}
						<Typography variant="caption" fontWeight="bold">
							{Math.abs(percentChange).toFixed(1)}%
						</Typography>
					</Box>
				</Stack>
			</Paper>
		);
	}
	return null;
};

const PeriodComparisonChart: React.FC<PeriodComparisonChartProps> = ({
	data,
	period_type = "monthly",
	title,
	height = 300,
	currency = "USD",
	locale = "en-US",
}) => {
	const theme = useTheme();
	const labels = PERIOD_LABELS[period_type];
	const chart_title = title || labels.title;

	// Transform Data
	const formatted = useMemo(() => {
		return (data || []).map((d) => {
			let label = String(d.period ?? "");
			try {
				const date =
					typeof d.period === "string"
						? parseISO(d.period)
						: new Date(d.period);
				if (!isNaN(date.getTime())) {
					if (period_type === "daily") label = format(date, "dd MMM");
					else if (period_type === "monthly")
						label = format(date, "MMM yyyy");
					else label = format(date, "yyyy");
				}
			} catch (e) {}
			return { ...d, period: label };
		});
	}, [data, period_type]);

	const has_data = formatted.length > 0;

	return (
		<Card
			sx={{
				width: "100%",
				height: "100%",
				boxShadow: 2,
				borderRadius: 2,
				display: "flex",
				flexDirection: "column",
			}}
		>
			<CardHeader
				title={
					<Typography variant="h6" fontWeight={700}>
						{chart_title}
					</Typography>
				}
				subheader={`${labels.current} vs ${labels.previous}`}
				avatar={
					<Box
						sx={{
							bgcolor: theme.palette.primary.main,
							color: "#fff",
							p: 1,
							borderRadius: 1,
							display: "flex",
						}}
					>
						<CompareArrows />
					</Box>
				}
				action={
					has_data && (
						<Chip
							label={period_type.toUpperCase()}
							size="small"
							color="default"
							variant="outlined"
							sx={{ fontSize: "0.7rem" }}
						/>
					)
				}
			/>
			<Divider />

			<CardContent sx={{ flexGrow: 1 }}>
				{!has_data ? (
					<Stack
						alignItems="center"
						justifyContent="center"
						sx={{ height: height, color: "text.secondary" }}
						spacing={2}
					>
						<SearchOff sx={{ fontSize: 48, opacity: 0.5 }} />
						<Typography variant="body1">
							No comparison data available
						</Typography>
					</Stack>
				) : (
					<Box sx={{ width: "100%", height: height }}>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={formatted} barGap={4}>
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
									dy={10}
									width={10}
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
								/>
								<Tooltip
									cursor={{
										fill: theme.palette.action.hover,
									}}
									content={
										<CustomTooltip
											currency={currency}
											locale={locale}
										/>
									}
								/>
								<Legend
									verticalAlign="top"
									align="right"
									height={36}
									iconType="circle"
								/>

								{/* Previous Period - Muted/Gray */}
								<Bar
									dataKey="previous"
									name={labels.previous}
									fill={
										theme.palette.mode === "light"
											? theme.palette.grey[300]
											: theme.palette.grey[700]
									}
									radius={[4, 4, 0, 0]}
									barSize={32}
								/>

								{/* Current Period - Primary Color */}
								<Bar
									dataKey="current"
									name={labels.current}
									fill={theme.palette.primary.main}
									radius={[4, 4, 0, 0]}
									barSize={32}
								/>
							</BarChart>
						</ResponsiveContainer>
					</Box>
				)}
			</CardContent>
		</Card>
	);
};

export default PeriodComparisonChart;
