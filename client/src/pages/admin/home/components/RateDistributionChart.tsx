import { Box, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatPercent } from "@utils/formatting";
import type { CancellationRecord } from "@my-types/dashboard";

interface RateDistributionChartProps {
  data: CancellationRecord[];
  period_type?: "daily" | "monthly" | "yearly";
  title?: string;
  height?: number;
  colors?: string[];
}

const DEFAULT_COLORS = ["#d32f2f", "#ff9800", "#4caf50", "#1976d2", "#6a1b9a"];

const PERIOD_TITLES = {
  daily: "Daily Cancellation Rate (%)",
  monthly: "Monthly Cancellation Rate (%)",
  yearly: "Yearly Cancellation Rate (%)",
};

/**
 * RateDistributionChart shows percentage distribution per category.
 */
const RateDistributionChart: React.FC<RateDistributionChartProps> = ({
  data,
  period_type = "monthly",
  title,
  height = 220,
  colors = DEFAULT_COLORS,
}) => {
  const chart_title = title || PERIOD_TITLES[period_type];
  const transformed = (data || []).map((d) => ({
    name: d.name,
    value: d.total > 0 ? Math.round((d.count / d.total) * 100) : 0,
  }));
  const has_data = transformed.length > 0;

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        {chart_title}
      </Typography>
      <ResponsiveContainer width="100%" height={height}>
        {has_data ? (
          <PieChart>
            <Pie
              data={transformed}
              cx="50%"
              cy="50%"
              outerRadius={70}
              fill="#8884d8"
              dataKey="value"
              label={({ value }) => formatPercent(value)}
            >
              {transformed.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatPercent(value)} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
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

export default RateDistributionChart;