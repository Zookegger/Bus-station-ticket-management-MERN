import { comparisonData } from "@data/mockData";
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);

export const MonthlyComparisonChart = () => {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        So sánh doanh thu (Tháng này vs Tháng trước)
      </Typography>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={comparisonData} margin={{ left: 60 }}>
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
