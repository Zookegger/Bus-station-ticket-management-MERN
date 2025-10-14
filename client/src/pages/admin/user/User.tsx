import React from "react";
import { Box, Typography } from "@mui/material";
import DashboardLayout from "../../../components/layout/DashboardLayout";

const User: React.FC = () => {
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
          User Management
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Manage system users and permissions
        </Typography>
      </Box>
    </DashboardLayout>
  );
};

export default User;
