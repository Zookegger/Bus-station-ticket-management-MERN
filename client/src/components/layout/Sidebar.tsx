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
	type BoxProps,
	Menu,
	MenuItem,
} from "@mui/material";
import { useNavigate, useLocation, redirect } from "react-router-dom";
import {
	Home as HomeIcon,
	DirectionsCar as CarIcon,
	DirectionsBus as BusIcon,
	LocationOn as MapPinIcon,
	Person as PersonIcon,
	Settings as SettingsIcon,
	Menu as MenuIcon,
	AccountCircle as AccountIcon,
	KeyboardArrowDown as ArrowDownIcon,
	CardGiftcard,
} from "@mui/icons-material";
import { APP_CONFIG } from "@constants/index";
import { useAuth } from "@hooks/useAuth";

const menuItemsData: MenuItem[] = [
	{
		id: 1,
		label: "Home",
		icon: "home",
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
		icon: "map-pin",
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
		label: "Coupon",
		icon: "coupon",
		tips: "Create, edit, and manage discount coupons for promotions",
		path: "/dashboard/coupon",
	},
	{
		id: 6,
		label: "System",
		icon: "gear",
		tips: "Configure system settings, maintenance, and administrative options",
		path: "/dashboard/system",
	},
];

interface MenuItem {
	id: number;
	label: string;
	icon: string;
	tips: string;
	path: string | null;
}

const iconMap: { [key: string]: React.ComponentType } = {
	home: HomeIcon,
	car: CarIcon,
	bus: BusIcon,
	"map-pin": MapPinIcon,
	person: PersonIcon,
	coupon: CardGiftcard,
	gear: SettingsIcon,
};

interface SidebarProps {
	onToggle?: (collapsed: boolean) => void;
}

interface PositionedMenuProps {
	isCollapsed: boolean;
	sx?: BoxProps["sx"];
}

const PositionedMenu: React.FC<PositionedMenuProps> = ({ isCollapsed, sx }) => {
	const { user, logout, isAuthenticated, isLoading } = useAuth();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	const handleClick = (e: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = async () => {
		await logout();
		console.log("Loading: ", isLoading);
		console.log("Authenticated: ",isAuthenticated);
		console.log("User: ",user);

		if (isAuthenticated) {
			console.error("Unable to logout of session");
			return;
		}
		redirect("/login");
	}

	return (
		<Box sx={{ ...sx }}>
			<Button
				sx={{
					py: 1,
					px: "8px",
					"&:hover": {
						backgroundColor: "rgba(255, 255, 255, 0.05)",
					},
					justifyContent: isCollapsed ? "center" : "flex-start",
				}}
				aria-controls={open ? "demo-positioned-menu" : undefined}
				aria-haspopup="true"
				aria-expanded={open ? "true" : undefined}
				onClick={handleClick}
				fullWidth
			>
				<ListItemIcon
					sx={{
						color: "white",
						minWidth: isCollapsed ? "auto" : 40,
						justifyContent: "center",
					}}
				>
					<AccountIcon />
				</ListItemIcon>
				{!isCollapsed && (
					<>
						<ListItemText
							primary={`${user?.firstName}`}
							sx={{
								"& .MuiListItemText-primary": {
									color: "white",
								},
							}}
						/>
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
				onClose={handleClose}
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
							width: "150px",
							maxWidth: "200px",
							marginTop: -4,
						},
					},
				}}
			>
				<MenuItem
					onClick={handleClose}
					sx={{
						color: "black",
						"&:hover": {
							backgroundColor: "rgba(255, 255, 255, 0.1)",
						},
					}}
				>
					Profile
				</MenuItem>
				<MenuItem
					onClick={async () => {
						handleClose();
						await handleLogout();
					}}
					sx={{
						color: "black",
						"&:hover": {
							backgroundColor: "rgba(255, 255, 255, 0.1)",
						},
					}}
				>
					Logout
				</MenuItem>
			</Menu>
		</Box>
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
				width: isCollapsed ? "70px" : "200px",
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
				{menuItemsData.map((item: MenuItem) => {
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
												{/* submenu removed */}
											</>
										)}
									</ListItemButton>
								</Tooltip>
							</ListItem>
							{/* submenu removed */}
						</React.Fragment>
					);
				})}
			</List>

			{/* Account Section */}

			<PositionedMenu
				isCollapsed={isCollapsed}
				sx={{
					borderTop: "3px solid rgba(255, 255, 255, 0.1)",
				}}
			/>
		</Box>
	);
};

export default Sidebar;
