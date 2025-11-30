import { Box, Typography } from "@mui/material";
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
import type { PeriodComparisonRecord } from "@my-types/dashboard";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);

interface MonthlyComparisonChartProps {
  data?: PeriodComparisonRecord[];
}

export const MonthlyComparisonChart = ({
  data = [],
}: MonthlyComparisonChartProps) => {
  // Transform data to match chart format
  const chartData = data.map((record) => ({
    month: record.period,
    previous: record.previous,
    current: record.current,
  }));
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        So sánh doanh thu (Tháng này vs Tháng trước)
      </Typography>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip formatter={(v: number) => formatCurrency(v)} />
          <Legend />
          <Bar dataKey="previous" fill="#90a4ae" name="Tháng trước" />
          <Bar dataKey="current" fill="#2e7d32" name="Tháng này" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};
