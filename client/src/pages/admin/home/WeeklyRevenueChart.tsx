import { weeklyData } from "@data/mockData";
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);

export const WeeklyRevenueChart = () => {
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
