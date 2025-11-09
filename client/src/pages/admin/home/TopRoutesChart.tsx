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
import { topRoutesData } from "@data/mockData";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);

export const TopRoutesChart = () => {
  const data = topRoutesData.map((r) => ({
    ...r,
    shortRoute: r.route.split(" → ")[0] + " → ...",
  }));

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Top Routes by Revenue
      </Typography>
      <Box sx={{ width: "100%", height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              type="category"
              dataKey="shortRoute"
              tick={{ fontSize: 11 }}
            />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) =>
                topRoutesData.find((r) => r.route.includes(label))?.route
              }
            />
            <Bar dataKey="revenue" fill="#2e7d32" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};
