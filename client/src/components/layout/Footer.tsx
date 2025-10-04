import React from "react";
import { Container, Box, Typography, IconButton, Grid } from "@mui/material";
import { APP_CONFIG } from "@constants/index";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();
	const emailAddress = import.meta.env.VITE_APP_EMAIL_ADDRESS || "email@example.com";

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
								reserved. <Link to='/privacy' style={{ color: "inherit" }}>Privacy Policy</Link>
							</Typography>
							<Box
								display="flex"
								justifyContent={{
									xs: "flex-start",
									md: "flex-end",
								}}
								gap={2}
							>
								<IconButton size="small" color="inherit">
									<a href={`#`} color="inherit" style={{ color: "inherit", textDecoration: "none"}}><i className="fab fa-facebook"></i></a>
								</IconButton>
								<IconButton size="small" color="inherit">
									<a href={`#`} color="inherit" style={{ color: "inherit", textDecoration: "none"}}><i className="fab fa-linkedin"></i></a>
								</IconButton>
								<IconButton size="small" color="inherit">
									<a href={`mailto:${emailAddress}`} color="inherit" style={{ color: "inherit", textDecoration: "none"}}><i className="fas fa-envelope"></i></a>
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
