import React, { useState } from "react";
import {
	Box,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
	IconButton,
	Tooltip,
	Button,
	Menu,
	type StackProps,
	MenuItem,
	Skeleton,
	Avatar,
	Stack,
	Badge,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
	Home as HomeIcon,
	DirectionsCar as CarIcon,
	DirectionsBus as BusIcon,
	LocationOn as MapPinIcon,
	Person as PersonIcon,
	Settings as SettingsIcon,
	Menu as MenuIcon,
	Window as WindowIcon,
	AccountCircle as AccountIcon,
	KeyboardArrowDown as ArrowDownIcon,
	CardGiftcard,
	AccountBox,
	Logout,
	Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { APP_CONFIG, ROUTES } from "@constants/index";
import { useAuth } from "@hooks/useAuth";
import { useNotifications } from "@contexts/NotificationContext";
import buildAvatarUrl from "@utils/avatarImageHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket } from "@fortawesome/free-solid-svg-icons";
import { NotificationPopper } from "@components/common";
import type { Notification } from "@my-types";

const TicketIcon: React.FC = () => <FontAwesomeIcon icon={faTicket} />;

const menuItemsData: SidebarMenuItem[] = [
	{
		id: 1,
		label: "Dashboard",
		icon: "dashboard",
		tips: "View dashboard overview, key metrics, and recent activities",
		path: "/dashboard/home",
	},
	{
		id: 2,
		label: "Vehicle",
		icon: "car",
		tips: "Add, edit, and manage vehicles, vehicle types, and their assignments",
		path: "/dashboard/vehicle",
	},
	{
		id: 3,
		label: "Trip",
		icon: "map",
		tips: "Plan, schedule, and monitor bus trips, including driver assignments",
		path: "/dashboard/trip",
	},
	{
		id: 4,
		label: "User",
		icon: "person",
		tips: "Manage user accounts, roles, permissions, and access controls",
		path: "/dashboard/user",
	},
	{
		id: 5,
		label: "Order",
		icon: "ticket",
		tips: "View and manage customer orders, bookings, and payment statuses",
		path: "/dashboard/order",
	},
	{
		id: 6,
		label: "Coupon",
		icon: "coupon",
		tips: "Create, edit, and manage discount coupons for promotions",
		path: "/dashboard/coupon",
	},
	{
		id: 7,
		label: "System",
		icon: "gear",
		tips: "Configure system settings, maintenance, and administrative options",
		path: "/dashboard/system",
	},
];

interface SidebarMenuItem {
	id: number;
	label: string;
	icon: string;
	tips: string;
	path: string | null;
}

const iconMap: { [key: string]: React.ComponentType } = {
	dashboard: WindowIcon,
	car: CarIcon,
	bus: BusIcon,
	map: MapPinIcon,
	ticket: TicketIcon,
	person: PersonIcon,
	coupon: CardGiftcard,
	gear: SettingsIcon,
};

interface SidebarProps {
	onToggle?: (collapsed: boolean) => void;
}

interface PositionedMenuProps {
	isCollapsed: boolean;
	sx?: StackProps["sx"];
}

const PositionedMenu: React.FC<PositionedMenuProps> = ({ isCollapsed, sx }) => {
	const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
	const navigate = useNavigate();
	let notifications: Notification[] = [];
	let unreadCount = 0;
	let notifLoading = false;
	let markAsRead = async (_id: number) => {};
	let markAllAsRead = async () => {};
	let deleteNotification = async (_id: number) => {};

	// useNotifications throws when provider is not mounted. Guard it so the sidebar
	// doesn't crash if NotificationProvider isn't mounted (useful in some dev routes).
	try {
		const ctx = useNotifications();
		notifications = ctx.notifications;
		unreadCount = ctx.unreadCount;
		notifLoading = ctx.isLoading;
		markAsRead = ctx.markAsRead;
		markAllAsRead = ctx.markAllAsRead;
		deleteNotification = ctx.deleteNotification;
	} catch (err) {
		// Provider not mounted — keep safe defaults and no-op methods
	}
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	const handleClick = (e: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = async () => {
		await logout();

		if (isAuthenticated) {
			console.error("Unable to logout of session");
			return;
		}
		navigate("/login");
	};

	if (authLoading) {
		return <Skeleton />;
	}

	return (
		<Stack direction={"row"} sx={{ ...sx }}>
			{!isCollapsed ? (
				<>
					<Button
						fullWidth
						sx={{
							color: "rgba(255, 255, 255, 0.51)",
							"&:hover": {
								backgroundColor: "rgba(255, 255, 255, 0.05)",
							},
							"&:active": {
								backgroundColor: "rgba(255, 255, 255, 0.05)",
							},
							justifyContent: isCollapsed ? "center" : "flex-end",
							gap: 1,
						}}
						size="small"
						aria-controls={
							open ? "demo-positioned-menu" : undefined
						}
						aria-haspopup="true"
						aria-expanded={open ? "true" : undefined}
						onClick={handleClick}
					>
						{user?.avatar ? (
							<Avatar
								src={buildAvatarUrl(user.avatar) ?? ""}
								alt={user.firstName}
								sx={{
									width: "32px",
									height: "32px",
								}}
							/>
						) : (
							<AccountIcon />
						)}

						<Typography
							sx={{
								color: "white",
								textTransform: "capitalize",
							}}
						>
							{user?.fullName ?? user?.firstName ?? "undefined"}
						</Typography>
						{!isCollapsed && (
							<>
								<ArrowDownIcon
									sx={{
										color: "white",
										transform: open
											? "rotate(180deg)"
											: "rotate(0deg)", // Rotate 180 degrees when open
										transition: "transform 0.25s ease", // Smooth rotation animation
									}}
								/>
							</>
						)}
					</Button>
					<Menu
						anchorEl={anchorEl}
						open={open}
						onClose={handleMenuClose}
						anchorOrigin={{
							vertical: "top",
							horizontal: "center",
						}}
						transformOrigin={{
							vertical: "top",
							horizontal: "center",
						}}
						slotProps={{
							paper: {
								sx: {
									width: "250px",
									maxWidth: "200px",
									marginTop: -4,
								},
							},
						}}
					>
						<MenuItem
							onClick={handleMenuClose}
							sx={{
								color: "black",
								"&:hover": {
									backgroundColor: "rgba(255, 255, 255, 0.1)",
								},
							}}
							component={RouterLink}
							to={ROUTES.PROFILE}
						>
							<AccountBox sx={{ marginRight: 1 }} />
							Profile
						</MenuItem>
						<MenuItem
							onClick={handleMenuClose}
							component={RouterLink}
							to={ROUTES.HOME}
						>
							<HomeIcon sx={{ marginRight: 1 }} />
							Home
						</MenuItem>
						<MenuItem
							onClick={async () => {
								handleMenuClose();
								await handleLogout();
							}}
							sx={{
								color: "black",
								"&:hover": {
									backgroundColor: "rgba(255, 255, 255, 0.1)",
								},
							}}
						>
							<Logout sx={{ marginRight: 1 }} />
							Logout
						</MenuItem>
					</Menu>

					<NotificationPopper
						notifications={notifications}
						onMarkAsRead={markAsRead}
						onMarkAllAsRead={markAllAsRead}
						onDelete={deleteNotification}
						loading={notifLoading}
						placement="top"
					>
						<IconButton>
							<Badge badgeContent={unreadCount} color="error">
								<NotificationsIcon sx={{ color: "#fff" }} />
							</Badge>
						</IconButton>
					</NotificationPopper>
				</>
			) : user?.avatar ? (
				<>
					<Button
						fullWidth
						sx={{
							color: "rgba(255, 255, 255, 0.51)",
							"&:hover": {
								backgroundColor: "rgba(255, 255, 255, 0.05)",
							},
							"&:active": {
								backgroundColor: "rgba(255, 255, 255, 0.05)",
							},
							justifyContent: isCollapsed ? "center" : "flex-end",
							gap: 1,
						}}
						size="small"
						aria-controls={
							open ? "demo-positioned-menu" : undefined
						}
						aria-haspopup="true"
						aria-expanded={open ? "true" : undefined}
						onClick={handleClick}
					>
						<Avatar
							src={buildAvatarUrl(user.avatar) ?? ""}
							alt={user.firstName}
							sx={{
								width: "32px",
								height: "32px",
							}}
						/>
					</Button>

					<Menu
						anchorEl={anchorEl}
						open={open}
						onClose={handleMenuClose}
						anchorOrigin={{
							vertical: "top",
							horizontal: "center",
						}}
						transformOrigin={{
							vertical: "top",
							horizontal: "center",
						}}
						slotProps={{
							paper: {
								sx: {
									width: "250px",
									maxWidth: "200px",
									marginTop: -4,
								},
							},
						}}
					>
						<MenuItem
							onClick={handleMenuClose}
							sx={{
								color: "black",
								"&:hover": {
									backgroundColor: "rgba(255, 255, 255, 0.1)",
								},
							}}
							component={RouterLink}
							to={ROUTES.PROFILE}
						>
							<AccountBox sx={{ marginRight: 1 }} />
							Profile
						</MenuItem>
						<MenuItem
							onClick={handleMenuClose}
							component={RouterLink}
							to={ROUTES.HOME}
						>
							<HomeIcon sx={{ marginRight: 1 }} />
							Home
						</MenuItem>
						<MenuItem
							onClick={async () => {
								handleMenuClose();
								await handleLogout();
							}}
							sx={{
								color: "black",
								"&:hover": {
									backgroundColor: "rgba(255, 255, 255, 0.1)",
								},
							}}
						>
							<Logout sx={{ marginRight: 1 }} />
							Logout
						</MenuItem>
					</Menu>
				</>
			) : (
				<AccountIcon />
			)}
		</Stack>
	);
};

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [isCollapsed, setIsCollapsed] = useState(false);

	const handleMenuClick = (path: string | null) => {
		if (path) navigate(path);
	};

	const toggleSidebar = () => {
		const newCollapsedState = !isCollapsed;
		setIsCollapsed(newCollapsedState);
		onToggle?.(newCollapsedState);
	};

	return (
		<Box
			sx={{
				width: isCollapsed ? "70px" : "220px",
				height: "100vh",
				backgroundColor: "#2E7D32",
				color: "white",
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				left: 0,
				top: 0,
				zIndex: 1000,
				transition: "width 0.3s ease",
			}}
		>
			{/* Header with logo and menu button */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: isCollapsed ? "center" : "space-between",
					p: 2,
					borderBottom: "3px solid rgba(255, 255, 255, 0.1)",
				}}
			>
				{!isCollapsed && (
					<Typography
						variant="h6"
						sx={{
							fontWeight: "bold",
							color: "white",
						}}
					>
						{APP_CONFIG.name || "Placeholder app name"}
					</Typography>
				)}
				<IconButton
					onClick={toggleSidebar}
					sx={{
						color: "white",
					}}
				>
					<MenuIcon />
				</IconButton>
			</Box>

			{/* Navigation Menu */}
			<List sx={{ flexGrow: 1, pt: 2 }}>
				{menuItemsData.map((item: SidebarMenuItem) => {
					const IconComponent = iconMap[item.icon];
					const isActive = location.pathname === item.path;

					return (
						<React.Fragment key={item.id}>
							<ListItem disablePadding sx={{ px: 2, mb: 0.5 }}>
								<Tooltip
									title={
										<Typography variant="body2">
											{item.tips}
										</Typography>
									}
									placement="right"
									id={item.id.toString()}
									slotProps={{}}
								>
									<ListItemButton
										onClick={() =>
											handleMenuClick(item.path)
										}
										sx={{
											borderRadius: 1,
											backgroundColor: isActive
												? "rgba(255, 255, 255, 0.1)"
												: "transparent",
											"&:hover": {
												backgroundColor:
													"rgba(255, 255, 255, 0.05)",
											},
											justifyContent: isCollapsed
												? "center"
												: "flex-start",
											minHeight: 48,
											p: 0,
										}}
									>
										<ListItemIcon
											sx={{
												color: "white",
												minWidth: isCollapsed
													? "auto"
													: 40,
												justifyContent: "center",
											}}
										>
											{IconComponent && <IconComponent />}
										</ListItemIcon>
										{!isCollapsed && (
											<>
												<ListItemText
													primary={item.label}
													sx={{
														"& .MuiListItemText-primary":
															{
																color: "white",
																fontWeight:
																	isActive
																		? "bold"
																		: "normal",
															},
													}}
												/>
											</>
										)}
									</ListItemButton>
								</Tooltip>
							</ListItem>
						</React.Fragment>
					);
				})}
			</List>

			{/* Account Section */}
			<PositionedMenu
				isCollapsed={isCollapsed}
				sx={{
					color: "white",
					display: "inline-flex",
					alignItems: "center",
					minWidth: isCollapsed ? "auto" : 40,
					py: 1,
					justifyContent: "center",
					borderTop: "3px solid rgba(255, 255, 255, 0.1)",
				}}
			/>
		</Box>
	);
};

export default Sidebar;
