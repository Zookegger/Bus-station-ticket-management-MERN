import React from "react";
import { Box, Typography } from "@mui/material";

const User: React.FC = () => {
  return (
    
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
  );
};

export default User;
