import React from "react";
import { Box } from "@mui/material";

const AdminLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <Box sx={{ minHeight: "100vh", width: "100%" }}>{children}</Box>;
};

export default AdminLayout;
