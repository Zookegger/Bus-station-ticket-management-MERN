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
	IconButton,
	Badge,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { APP_CONFIG, ROUTES } from "@constants/index";
import { useAuth } from "@hooks/useAuth";
import {
	AccountBox as AccountBoxIcon,
	Login as LoginIcon,
	PersonAdd as RegisterIcon,
	Logout as LogoutIcon,
	Notifications as NotificationsIcon,
	Window as WindowIcon,
	ShoppingBasket,
	Star as StarIcon,
} from "@mui/icons-material";
import buildImgUrl from "@utils/imageHelper";
import { useNotifications } from "@contexts/NotificationContext";
import { NotificationPopper } from "@components/common";
import { Stack } from "@mui/system";

const Header: React.FC = () => {
	const { isAuthenticated, isAdmin, user, logout, isLoading } = useAuth();
	let notifications = [] as any[];
	let deleteNotification = async (_id: number) => {};
	let markAllAsRead = async () => {};
	let markAsRead = async (_id: number) => {};
	let unreadCount = 0;
	let notifLoading = false;

	try {
		const notifCtx = useNotifications();
		notifications = notifCtx.notifications;
		deleteNotification = notifCtx.deleteNotification;
		markAllAsRead = notifCtx.markAllAsRead;
		markAsRead = notifCtx.markAsRead;
		unreadCount = notifCtx.unreadCount;
		notifLoading = notifCtx.isLoading;
	} catch (err) {
		// NotificationProvider not mounted — fall back to safe defaults
	}

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
					<Stack direction={"row"} gap={isAuthenticated && user ? 0 : 1}>
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
												buildImgUrl(user.avatar) ??
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
										<AccountBoxIcon
											sx={{ marginRight: 1 }}
										/>
										Profile
									</MenuItem>
									<MenuItem
										onClick={handleMenuClose}
										component={RouterLink}
										to={ROUTES.USER_ORDERS}
									>
										<ShoppingBasket
											sx={{ marginRight: 1 }}
										/>
										Orders
									</MenuItem>
									<MenuItem
										onClick={handleMenuClose}
										component={RouterLink}
										to={ROUTES.USER_REVIEWS}
									>
										<StarIcon
											sx={{ marginRight: 1 }}
										/>
										Reviews
									</MenuItem>
									{isAdmin && (
										<MenuItem
											onClick={handleMenuClose}
											component={RouterLink}
											to={ROUTES.DASHBOARD_HOME}
										>
											<WindowIcon
												sx={{ marginRight: 1 }}
											/>
											Dashboard
										</MenuItem>
									)}
									<MenuItem
										onClick={async () => {
											handleMenuClose();
											await logout();
										}}
									>
										<LogoutIcon sx={{ marginRight: 1 }} />
										Logout
									</MenuItem>
								</Menu>

								<NotificationPopper
									notifications={notifications}
									loading={notifLoading}
									onMarkAsRead={markAsRead}
									onMarkAllAsRead={markAllAsRead}
									onDelete={deleteNotification}
								>
									<IconButton color="inherit" size="large">
										<Badge
											badgeContent={unreadCount}
											color="error"
										>
											<NotificationsIcon />
										</Badge>
									</IconButton>
								</NotificationPopper>
							</>
						) : (
							<>
								<Button
									color="inherit"
									component={RouterLink}
									to={ROUTES.LOGIN}
									size="small"
									className="hvr-icon-grow"
									startIcon={
										<LoginIcon className="hvr-icon" />
									}
								>
									Login
								</Button>
								<Button
									color="inherit"
									component={RouterLink}
									to={ROUTES.REGISTER}
									size="small"
									className="hvr-icon-grow"
									startIcon={
										<RegisterIcon className="hvr-icon" />
									}
								>
									Register
								</Button>
							</>
						)}
					</Stack>
				</Toolbar>
			</Container>
		</AppBar>
	);
};

export default Header;
