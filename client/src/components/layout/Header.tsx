import React, { useState } from "react";
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	Container,
	Box,
	Menu,
	MenuItem,
	Avatar,
	Skeleton,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { APP_CONFIG, ROUTES } from "@constants/index";
import { useAuth } from "@hooks/useAuth";
import { AccountBox, Logout, Window } from "@mui/icons-material";
import buildAvatarUrl from "@utils/avatarImageHelper";

const Header: React.FC = () => {
	const { isAuthenticated, isAdmin, user, logout, isLoading } = useAuth();

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const menuOpen = Boolean(anchorEl);

	const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

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
					<Box flex={1} />
					<Box>
						{isLoading ? (
							<Skeleton
								variant="rectangular"
								width={120}
								height={40}
								sx={{
									bgcolor: "rgba(255, 255, 255, 0.2)",
									borderRadius: 1,
								}}
							/>
						) : isAuthenticated && user ? (
							<>
								<Button
									onClick={handleMenuClick}
									color="inherit"
									sx={{
										textTransform: "none",
									}}
								>
									<Box
										display="flex"
										justifyContent={"center"}
										alignItems={"center"}
									>
										<Avatar
											src={
												buildAvatarUrl(user.avatar) ??
												""
											}
											alt={user.firstName}
											sx={{
												width: "32px",
												height: "32px",
											}}
										/>
										<Typography sx={{ mx: 1 }}>
											{user.firstName ?? user.userName}
										</Typography>
									</Box>
								</Button>
								<Menu
									anchorEl={anchorEl}
									open={menuOpen}
									onClose={handleMenuClose}
									anchorOrigin={{
										vertical: "bottom",
										horizontal: "center",
									}}
									transformOrigin={{
										vertical: "top",
										horizontal: "center",
									}}
									slotProps={{
										paper: { style: { width: 150 } },
									}}
								>
									<MenuItem
										onClick={handleMenuClose}
										component={RouterLink}
										to={ROUTES.PROFILE}
									>
										<AccountBox sx={{ marginRight: 1 }} />
										Profile
									</MenuItem>
									{isAdmin && (
										<MenuItem
											onClick={handleMenuClose}
											component={RouterLink}
											to={ROUTES.DASHBOARD_HOME}
										>
											<Window sx={{ marginRight: 1 }} />
											Dashboard
										</MenuItem>
									)}
									<MenuItem
										onClick={async () => {
											handleMenuClose();
											await logout();
										}}
									>
										<Logout sx={{ marginRight: 1 }} />
										Logout
									</MenuItem>
								</Menu>
							</>
						) : (
							<>
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
							</>
						)}
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
};

export default Header;
