import React from "react";
import { Box, Typography } from "@mui/material";
import DashboardLayout from "../../../components/layout/DashboardLayout";

const Trip: React.FC = () => {
  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#2E7D32",
            mb: 3,
          }}
        >
          Trip Management
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Manage and monitor all bus trips
        </Typography>
      </Box>
    </DashboardLayout>
  );
};

export default Trip;
