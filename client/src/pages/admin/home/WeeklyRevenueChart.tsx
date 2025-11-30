import { Box, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
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

// Convert daily data to weekly data by grouping by day of week
const convertToWeeklyData = (dailyData: DailyRevenueRecord[]) => {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyMap = new Map<string, number>();

  // Initialize with 0
  daysOfWeek.forEach((day) => weeklyMap.set(day, 0));

  // Group daily data by day of week
  dailyData.forEach((record) => {
    const date = new Date(record.period);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
    if (weeklyMap.has(dayOfWeek)) {
      weeklyMap.set(dayOfWeek, weeklyMap.get(dayOfWeek)! + record.value);
    }
  });

  return daysOfWeek.map((day) => ({
    day,
    revenue: weeklyMap.get(day) || 0,
  }));
};

interface WeeklyRevenueChartProps {
  dailyData?: DailyRevenueRecord[];
}

export const WeeklyRevenueChart = ({
  dailyData = [],
}: WeeklyRevenueChartProps) => {
  const weeklyData = convertToWeeklyData(dailyData);
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Doanh thu theo ngày trong tuần
      </Typography>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={weeklyData}
          margin={{ top: 10, right: 10, left: 50, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 11 }}
            width={70}
          />
          <Tooltip formatter={(v: number) => formatCurrency(v)} />
          <Bar dataKey="revenue" fill="#2e7d32" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};
