/**
 * DataGridPageLayout component.
 * Provides a consistent admin page layout for pages that include a title,
 * optional action bar (buttons / filters), and main content (typically a DataGrid wrapped in Paper).
 * Mirrors the spacing and heading styles used in `CouponPage` for visual consistency.
 */
import React from "react";
import { Box, Typography } from "@mui/material";

/**
 * Props for DataGridPageLayout.
 * @property {string} title - Page title displayed at top.
 * @property {React.ReactNode} actionBar - Optional action bar rendered above content (e.g., buttons).
 * @property {React.ReactNode} children - Main page content (e.g., a Paper containing a Grid/DataGrid).
 */
export interface DataGridPageLayoutProps {
  /** Page title displayed at top */
  title: string;
  /** Optional action bar rendered above content (e.g., buttons / filters) */
  actionBar?: React.ReactNode;
  /** Main page content */
  children: React.ReactNode;
}

/**
 * DataGridPageLayout: wraps admin pages with standardized heading and spacing.
 * Replicates CouponPage method: header box with bold green title, then content box.
 * This keeps all admin pages visually aligned.
 */
const DataGridPageLayout: React.FC<DataGridPageLayoutProps> = ({ title, actionBar, children }) => {
  // Render the layout: header with title, followed by main content area containing action bar + children
  return (
    <Box>
      {/* Header section with title */}
      <Box sx={{ p: 3, paddingBottom: 0 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "#2E7D32" }}
        >
          {title}
        </Typography>
      </Box>
      {/* Content wrapper with uniform padding */}
      <Box p="24px">
        {/* Optional action bar (buttons / filters) */}
        {actionBar && <Box sx={{ mb: 2 }}>{actionBar}</Box>}
        {/* Page children (Grid/Paper/etc) */}
        {children}
      </Box>
    </Box>
  );
};

export default DataGridPageLayout;
