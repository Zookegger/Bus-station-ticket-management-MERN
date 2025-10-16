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
  Collapse,
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
  KeyboardArrowRight as ArrowRightIcon,
} from "@mui/icons-material";
import menuItemsData from "@data/menuItems.json";
import { APP_CONFIG } from "@constants/index";

interface SubMenuItem {
  id: number;
  label: string;
  icon: string;
  path: string;
  active: boolean;
}

interface MenuItem {
  id: number;
  label: string;
  icon: string;
  path: string | null;
  active: boolean;
  hasSubmenu?: boolean;
  submenu?: SubMenuItem[];
}

const iconMap: { [key: string]: React.ComponentType } = {
  home: HomeIcon,
  car: CarIcon,
  bus: BusIcon,
  "map-pin": MapPinIcon,
  person: PersonIcon,
  gear: SettingsIcon,
};

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<number[]>([]);

  const handleMenuClick = (
    path: string | null,
    hasSubmenu?: boolean,
    itemId?: number
  ) => {
    if (hasSubmenu && itemId) {
      // Toggle dropdown
      setOpenDropdowns((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      );
    } else if (path) {
      navigate(path);
    }
  };

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onToggle?.(newCollapsedState);
  };

  return (
    <Box
      sx={{
        width: isCollapsed ? "70px" : "250px",
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
          const isDropdownOpen = openDropdowns.includes(item.id);
          const hasActiveSubmenu = item.submenu?.some(
            (subItem) => location.pathname === subItem.path
          );

          return (
            <React.Fragment key={item.id}>
              <ListItem disablePadding sx={{ px: 2, mb: 0.5 }}>
                <Tooltip
                  title={isCollapsed ? item.label : ""}
                  placement="right"
                >
                  <ListItemButton
                    onClick={() =>
                      handleMenuClick(item.path, item.hasSubmenu, item.id)
                    }
                    sx={{
                      borderRadius: 1,
                      backgroundColor:
                        isActive || hasActiveSubmenu
                          ? "rgba(255, 255, 255, 0.1)"
                          : "transparent",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                      },
                      justifyContent: isCollapsed ? "center" : "flex-start",
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
                      {IconComponent && <IconComponent />}
                    </ListItemIcon>
                    {!isCollapsed && (
                      <>
                        <ListItemText
                          primary={item.label}
                          sx={{
                            "& .MuiListItemText-primary": {
                              color: "white",
                              fontWeight:
                                isActive || hasActiveSubmenu
                                  ? "bold"
                                  : "normal",
                            },
                          }}
                        />
                        {item.hasSubmenu &&
                          (isDropdownOpen ? (
                            <ArrowDownIcon sx={{ color: "white" }} />
                          ) : (
                            <ArrowRightIcon sx={{ color: "white" }} />
                          ))}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>

              {/* Submenu */}
              {item.hasSubmenu && item.submenu && (
                <Collapse
                  in={isDropdownOpen && !isCollapsed}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.submenu.map((subItem) => {
                      const SubIconComponent = iconMap[subItem.icon];
                      const isSubActive = location.pathname === subItem.path;

                      return (
                        <ListItem
                          key={subItem.id}
                          disablePadding
                          sx={{ px: 2, mb: 0.5, pl: 4 }}
                        >
                          <Tooltip
                            title={isCollapsed ? subItem.label : ""}
                            placement="right"
                          >
                            <ListItemButton
                              onClick={() => handleMenuClick(subItem.path)}
                              sx={{
                                borderRadius: 1,
                                backgroundColor: isSubActive
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "transparent",
                                "&:hover": {
                                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                                },
                                justifyContent: isCollapsed
                                  ? "center"
                                  : "flex-start",
                                minHeight: 40,
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  color: "white",
                                  minWidth: isCollapsed ? "auto" : 32,
                                  justifyContent: "center",
                                }}
                              >
                                {SubIconComponent && <SubIconComponent />}
                              </ListItemIcon>
                              {!isCollapsed && (
                                <ListItemText
                                  primary={subItem.label}
                                  sx={{
                                    "& .MuiListItemText-primary": {
                                      color: "white",
                                      fontWeight: isSubActive
                                        ? "bold"
                                        : "normal",
                                      fontSize: "0.9rem",
                                    },
                                  }}
                                />
                              )}
                            </ListItemButton>
                          </Tooltip>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
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
              justifyContent: isCollapsed ? "center" : "flex-start",
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
