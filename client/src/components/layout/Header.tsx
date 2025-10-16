import React from "react";
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	Container,
	Box,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { APP_CONFIG, ROUTES } from "@constants";

const Header: React.FC = () => {
	return (
		<AppBar position="sticky" sx={{ bgcolor: "success.main" }}>
			<Container maxWidth={false}>
				<Toolbar disableGutters>
					<Typography
						variant="h5"
						component={RouterLink}
						to={ROUTES.HOME}
						sx={{
							color: "#fff",
							textDecoration: "none",
							fontWeight: 700,
						}}
					>
						{APP_CONFIG.name}
					</Typography>
					<Box sx={{ flexGrow: 1 }} />
					<Button
						color="inherit"
						component={RouterLink}
						to={ROUTES.LOGIN}
						size="small"
					>
						Login
					</Button>
					<Button
						color="inherit"
						component={RouterLink}
						to={ROUTES.REGISTER}
						size="small"
					>
						Register
					</Button>
				</Toolbar>
			</Container>
		</AppBar>
	);
};

export default Header;
