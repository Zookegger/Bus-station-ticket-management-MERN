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
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
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

const menuItemsData: MenuItem[] = [
	{
		id: 1,
		label: "Home",
		icon: "home",
		path: "/dashboard/home",
	},
	{
		id: 2,
		label: "Vehicle",
		icon: "car",
		path: "/dashboard/vehicle",
	},
	{
		id: 3,
		label: "Trip",
		icon: "map-pin",
		path: "/dashboard/trip",
	},
	{
		id: 4,
		label: "User",
		icon: "person",
		path: "/dashboard/user",
	},
	{
		id: 5,
		label: "Coupon",
		icon: "coupon",
		path: "/dashboard/coupon",
	},
	{
		id: 6,
		label: "System",
		icon: "gear",
		path: "/dashboard/system",
	},
];

interface MenuItem {
	id: number;
	label: string;
	icon: string;
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
					borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
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
									title={isCollapsed ? item.label : ""}
									placement="right"
								>
									<ListItemButton
										onClick={() => handleMenuClick(item.path)}
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
																fontWeight: isActive
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
			<Box
				sx={{
					borderTop: "1px solid rgba(255, 255, 255, 0.1)",
					p: 2,
				}}
			>
				<Tooltip title={isCollapsed ? "Account" : ""} placement="right">
					<ListItemButton
						sx={{
							borderRadius: 1,
							"&:hover": {
								backgroundColor: "rgba(255, 255, 255, 0.05)",
							},
							justifyContent: isCollapsed
								? "center"
								: "flex-start",
							minHeight: 48,
						}}
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
									primary="Account"
									sx={{
										"& .MuiListItemText-primary": {
											color: "white",
										},
									}}
								/>
								<ArrowDownIcon sx={{ color: "white" }} />
							</>
						)}
					</ListItemButton>
				</Tooltip>
			</Box>
		</Box>
	);
};

export default Sidebar;
