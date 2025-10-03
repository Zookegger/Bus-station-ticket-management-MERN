import React from "react";
import { Container, Box, Typography, IconButton, Grid } from "@mui/material";
import { APP_CONFIG } from "@constants/index";

const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();

	return (
		<Box
			component="footer"
			sx={{
				bgcolor: "success.main",
				color: "#fff",
				py: 4,
				mt: "auto",
				width: "100%",
			}}
		>
			<Container>
				<Grid container spacing={2} alignItems="center">
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="h6">{APP_CONFIG.name}</Typography>
						<Typography variant="body2" sx={{ m: 0 }}>
							{APP_CONFIG.description}
						</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Box textAlign={{ xs: "left", md: "right" }}>
							<Typography variant="body2" sx={{ mb: 1 }}>
								© {currentYear} {APP_CONFIG.author}. All rights
								reserved. Privacy Policy
							</Typography>
							<Box
								display="flex"
								justifyContent={{
									xs: "flex-start",
									md: "flex-end",
								}}
								gap={1.5}
							>
								<IconButton size="small" color="inherit">
									<i className="fab fa-facebook"></i>
								</IconButton>
								<IconButton size="small" color="inherit">
									<i className="fab fa-linkedin"></i>
								</IconButton>
								<IconButton size="small" color="inherit">
									<i className="fas fa-envelope"></i>
								</IconButton>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
};

export default Footer;
