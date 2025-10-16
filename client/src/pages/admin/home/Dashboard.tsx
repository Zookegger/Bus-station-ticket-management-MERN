import React from "react";
import { Box, Typography } from "@mui/material";

const Home: React.FC = () => {
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
				Home
			</Typography>

			<Typography variant="body1" color="text.secondary">
				Welcome to the Bus Station Management System
			</Typography>
		</Box>
	);
};

export default Home;
