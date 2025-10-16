import React from "react";
import { Box, Typography } from "@mui/material";

const System: React.FC = () => {
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
          System Settings
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Configure system settings and preferences
        </Typography>
      </Box>
  );
};

export default System;
