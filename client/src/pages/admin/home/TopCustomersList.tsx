import {
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Chip,
} from "@mui/material";
import { vipData } from "@data/mockData";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);

export const TopCustomersList = () => {
  const sortedData = [...vipData].sort((a, b) => b.total - a.total);
  const maxValue = Math.max(...sortedData.map((d) => d.total));

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "#2e7d32";
      case 1:
        return "#1976d2";
      case 2:
        return "#f9a825";
      default:
        return "#666";
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Top 5 khách hàng VIP
      </Typography>

      <List
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {sortedData.map((customer, index) => (
          <ListItem key={index} disablePadding sx={{ px: 2, py: 1.5 }}>
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: getRankColor(index),
                  width: 40,
                  height: 40,
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {getInitials(customer.name)}
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {customer.name}
                  </Typography>
                  {index < 3 && (
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      sx={{
                        bgcolor: getRankColor(index) + "22",
                        color: getRankColor(index),
                        fontWeight: 600,
                        fontSize: 10,
                      }}
                    />
                  )}
                </Box>
              }
              secondary={
                <>
                  {/* DÙNG <> THAY <Box> ĐỂ TRÁNH LỖI <div> IN <p> */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Doanh thu
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {formatCurrency(customer.total)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(customer.total / maxValue) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "#e0e0e0",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: getRankColor(index),
                      },
                    }}
                  />
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
