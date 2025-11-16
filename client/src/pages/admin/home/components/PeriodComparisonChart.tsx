import { Box, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
  daily: { title: "Daily Revenue Comparison (Today vs Yesterday)", current: "Today", previous: "Yesterday" },
  monthly: { title: "Monthly Revenue Comparison (This Month vs Last Month)", current: "This Month", previous: "Last Month" },
  yearly: { title: "Yearly Revenue Comparison (This Year vs Last Year)", current: "This Year", previous: "Last Year" },
};

/**
 * PeriodComparisonChart compares current vs previous period revenues.
 */
const PeriodComparisonChart: React.FC<PeriodComparisonChartProps> = ({
  data,
  period_type = "monthly",
  title,
  height = 220,
  currency = "USD",
  locale = "en-US",
}) => {
  const has_data = Array.isArray(data) && data.length > 0;
  const labels = PERIOD_LABELS[period_type];
  const chart_title = title || labels.title;

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        {chart_title}
      </Typography>
      <ResponsiveContainer width="100%" height={height}>
        {has_data ? (
          <BarChart data={data} margin={{ left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis tickFormatter={(v: number) => formatCurrency(v, currency, locale)} />
            <Tooltip formatter={(v: number) => formatCurrency(v, currency, locale)} />
            <Legend />
            <Bar dataKey="previous" fill="#90a4ae" name={labels.previous} />
            <Bar dataKey="current" fill="#2e7d32" name={labels.current} />
          </BarChart>
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <Typography variant="body2" color="text.secondary">
              No data available
            </Typography>
          </Box>
        )}
      </ResponsiveContainer>
    </Box>
  );
};

export default PeriodComparisonChart;