import { cancelData } from "@data/mockData";
import { Box, Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const data = cancelData.map((d) => ({
  name: d.route,
  value: Math.round((d.cancelled / d.total) * 100),
}));

const COLORS = ["#d32f2f", "#ff9800", "#4caf50"];

export const CancellationRateChart = () => {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Tỷ lệ hủy vé theo tuyến (%)
      </Typography>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
            label={({ value }) => `${value}%`}
          >
            {data.map((_, index) => (
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
