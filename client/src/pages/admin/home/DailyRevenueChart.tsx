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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);

const CustomTooltip = ({ active, payload }: any) => {
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
          {formatCurrency(payload[0].value)}
        </Typography>
      </Box>
    );
  }
  return null;
};

interface DailyRevenueChartProps {
  data?: DailyRevenueRecord[];
}

export const DailyRevenueChart = ({ data = [] }: DailyRevenueChartProps) => {
  const chartData = data.map((d) => ({
    date: d.period,
    revenue: d.value,
    formatted: formatCurrency(d.value),
  }));

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Daily Revenue Trend
      </Typography>
      <Box sx={{ width: "100%", height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#666" }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12, fill: "#666" }}
              axisLine={false}
              tickLine={false}
              width={80} // ← Đảm bảo đủ chỗ cho label dài
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1976d2"
              fill="url(#dailyGradient)"
              strokeWidth={2.5}
              dot={{ fill: "#1976d2", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};
