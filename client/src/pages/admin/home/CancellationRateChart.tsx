import { Box, Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { CancellationRecord } from "@my-types/dashboard";

const COLORS = ["#d32f2f", "#ff9800", "#4caf50"];

interface CancellationRateChartProps {
  data?: CancellationRecord[];
}

export const CancellationRateChart = ({
  data = [],
}: CancellationRateChartProps) => {
  const chartData = data.map((d) => ({
    name: d.name,
    value: d.total > 0 ? Math.round((d.count / d.total) * 100) : 0,
  }));
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Tỷ lệ hủy vé theo tuyến (%)
      </Typography>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
            label={({ value }) => `${value}%`}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};
