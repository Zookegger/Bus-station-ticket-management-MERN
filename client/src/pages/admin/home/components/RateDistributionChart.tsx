import React, { useMemo, useState } from "react";
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
} from "@mui/material";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Legend,
	Tooltip,
	Sector,
} from "recharts";
import { PieChart as PieIcon, SearchOff } from "@mui/icons-material";
import { formatPercent } from "@utils/formatting";
import type { CancellationRecord } from "@my-types/dashboard";

interface RateDistributionChartProps {
	data: CancellationRecord[];
	period_type?: "daily" | "monthly" | "yearly";
	title?: string;
	height?: number;
	colors?: string[];
}

const DEFAULT_COLORS = ["#d32f2f", "#f57c00", "#388e3c", "#1976d2", "#7b1fa2"];

const PERIOD_TITLES = {
	daily: "Daily Cancellation Rate",
	monthly: "Monthly Cancellation Rate",
	yearly: "Yearly Cancellation Rate",
};

/**
 * Custom renderer for the active (hovered) slice.
 */
const renderActiveShape = (props: any) => {
	const {
		cx,
		cy,
		innerRadius,
		outerRadius,
		startAngle,
		endAngle,
		fill,
		payload,
		value,
	} = props;

	return (
		<g>
			<text
				x={cx}
				y={cy}
				dy={-4}
				textAnchor="middle"
				fill="#333"
				style={{ fontSize: "1rem", fontWeight: 600 }}
			>
				{payload.name}
			</text>
			<text
				x={cx}
				y={cy}
				dy={16}
				textAnchor="middle"
				fill="#666"
				style={{ fontSize: "0.8rem" }}
			>
				{`${value}%`}
			</text>
			<Sector
				cx={cx}
				cy={cy}
				innerRadius={innerRadius}
				outerRadius={outerRadius + 8}
				startAngle={startAngle}
				endAngle={endAngle}
				fill={fill}
			/>
			<Sector
				cx={cx}
				cy={cy}
				startAngle={startAngle}
				endAngle={endAngle}
				innerRadius={outerRadius + 10}
				outerRadius={outerRadius + 12}
				fill={fill}
			/>
		</g>
	);
};

/**
 * Custom Tooltip to match MUI styling
 */
const CustomTooltip = ({ active, payload }: any) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<Paper
				sx={{ p: 1.5, boxShadow: 3, borderRadius: 2 }}
			>
				<Typography
					variant="subtitle2"
					fontWeight={600}
					color="primary.main"
				>
					{data.name}
				</Typography>
				<Divider sx={{ my: 1 }} />
				<Stack spacing={0.5}>
					<Box display="flex" justifyContent="space-between">
						<Typography variant="body2" color="text.secondary">
							Rate:
						</Typography>
						<Typography variant="body2" fontWeight="bold">
							{formatPercent(data.value)}
						</Typography>
					</Box>
					<Box display="flex" justifyContent="space-between">
						<Typography variant="body2" color="text.secondary">
							Count:
						</Typography>
						<Typography variant="caption">
							{data.raw.count} / {data.raw.total}
						</Typography>
					</Box>
				</Stack>
			</Paper>
		);
	}
	return null;
};

const RateDistributionChart: React.FC<RateDistributionChartProps> = ({
	data,
	period_type = "monthly",
	title,
	height = 300,
	colors = DEFAULT_COLORS,
}) => {
	const theme = useTheme();
	const [activeIndex, setActiveIndex] = useState(0);

	const chart_title = title || PERIOD_TITLES[period_type];

	const transformed = useMemo(() => {
		return (data || [])
			.map((d) => ({
				name: d.name,
				value: d.total > 0 ? Math.round((d.count / d.total) * 100) : 0,
				raw: d,
			}))
			.filter((item) => item.raw.total > 0);
	}, [data]);

	const has_data = transformed.length > 0;

	const onPieEnter = (_: any, index: number) => {
		setActiveIndex(index);
	};

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
				subheader={`Distribution by category for this ${period_type.replace(
					"ly",
					""
				)}`}
				avatar={<PieIcon color="primary" />}
			/>

			<Divider />

			<CardContent sx={{ flexGrow: 1, p: 2 }}>
				{!has_data ? (
					<Stack
						alignItems="center"
						justifyContent="center"
						sx={{ height: height, color: "text.secondary" }}
						spacing={2}
					>
						<SearchOff sx={{ fontSize: 48, opacity: 0.5 }} />
						<Typography variant="body1">
							No cancellation data available
						</Typography>
					</Stack>
				) : (
					<Box sx={{ width: "100%", height: height }}>
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									// Typecast activeIndex to any to bypass strict React 19 type checking
									{...({ activeIndex } as any)}
									activeShape={renderActiveShape}
									data={transformed}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={80}
									fill={theme.palette.primary.main}
									dataKey="value"
									onMouseEnter={onPieEnter}
									paddingAngle={2}
								>
									{transformed.map((_, index) => (
										<Cell
											key={`cell-${index}`}
											fill={colors[index % colors.length]}
											stroke="none"
										/>
									))}
								</Pie>
								<Tooltip content={<CustomTooltip />} />
								<Legend
									verticalAlign="bottom"
									height={36}
									iconType="circle"
									formatter={(value) => (
										<span
											style={{
												color: theme.palette.text
													.primary,
												fontWeight: 500,
											}}
										>
											{value}
										</span>
									)}
								/>
							</PieChart>
						</ResponsiveContainer>
					</Box>
				)}
			</CardContent>
		</Card>
	);
};

export default RateDistributionChart;
