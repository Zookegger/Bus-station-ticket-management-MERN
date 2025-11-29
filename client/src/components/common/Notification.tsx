import React, { useState, useRef } from "react";
import {
	Popper,
	Paper,
	ClickAwayListener,
	List,
	ListItem,
	ListItemText,
	ListItemIcon,
	Typography,
	Badge,
	IconButton,
	Box,
	Divider,
	Button,
	CircularProgress,
	Portal,
	type PopperPlacementType,
} from "@mui/material";
import {
	Notifications as NotificationsIcon,
	NotificationsNone as NotificationsNoneIcon,
	Done as DoneIcon,
	Delete as DeleteIcon,
	Close as CloseIcon,
} from "@mui/icons-material";
import type { Notification } from "@my-types/notifications";
import { useNotifications } from "@contexts/NotificationContext";

interface NotificationPopperProps {
	/**
	 * The trigger element that opens the popper
	 */
	children: React.ReactElement;
	/**
	 * Array of notifications to display
	 */
	notifications?: Notification[];
	/**
	 * Loading state for notifications
	 */
	loading?: boolean;
	/**
	 * Callback when a notification is marked as read
	 */
	onMarkAsRead?: (notificationId: number) => void;
	/**
	 * Callback when a notification is deleted
	 */
	onDelete?: (notificationId: number) => void;
	/**
	 * Callback when all notifications are marked as read
	 */
	onMarkAllAsRead?: () => void;
	/**
	 * Maximum height of the popper
	 */
	maxHeight?: number;
	/**
	 * Width of the popper
	 */
	width?: number;
	/**
	 * Placement of the popper
	 */
	placement?: PopperPlacementType;
}

/**
 * Reusable notification popper component that can be anchored to any trigger element.
 * Uses MUI Popper with Portal for proper positioning outside the DOM tree.
 *
 * @example
 * ```tsx
 * <NotificationPopper
 *   notifications={notifications}
 *   onMarkAsRead={handleMarkAsRead}
 *   onDelete={handleDelete}
 * >
 *   <IconButton>
 *     <Badge badgeContent={unreadCount} color="error">
 *       <NotificationsIcon />
 *     </Badge>
 *   </IconButton>
 * </NotificationPopper>
 * ```
 */
const NotificationPopper: React.FC<NotificationPopperProps> = ({
	children,
	notifications,
	loading = false,
	onMarkAsRead,
	onDelete,
	onMarkAllAsRead,
	maxHeight = 400,
	width = 350,
	placement = "bottom"
}) => {
	const [open, setOpen] = useState(false);
	const anchorRef = useRef<HTMLDivElement>(null);

	const handleToggle = () => {
		setOpen((prevOpen) => !prevOpen);
	};

	const handleClose = (event: Event | React.SyntheticEvent) => {
		if (
			anchorRef.current &&
			anchorRef.current.contains(event.target as HTMLElement)
		) {
			return;
		}
		setOpen(false);
	};

	// If parent didn't pass notifications/handlers, try to use context.
	let ctxNotifications: Notification[] | null = null;
	let ctxLoading: boolean | null = null;
	let ctxMarkAsRead: ((id: number) => Promise<void>) | null = null;
	let ctxMarkAllAsRead: (() => Promise<void>) | null = null;
	let ctxDeleteNotification: ((id: number) => Promise<void>) | null = null;

	try {
		const ctx = useNotifications();
		ctxNotifications = ctx.notifications;
		ctxLoading = ctx.isLoading;
		ctxMarkAsRead = ctx.markAsRead;
		ctxMarkAllAsRead = ctx.markAllAsRead;
		ctxDeleteNotification = ctx.deleteNotification;
	} catch (err) {
		// Provider not mounted — fall back to props only
	}

	const effectiveNotifications = notifications ?? ctxNotifications ?? [];
	const effectiveLoading = loading || ctxLoading || false;
	const effectiveOnMarkAsRead = onMarkAsRead ?? (ctxMarkAsRead ?? (() => Promise.resolve()));
	const effectiveOnDelete = onDelete ?? (ctxDeleteNotification ?? (() => Promise.resolve()));
	const effectiveOnMarkAllAsRead = onMarkAllAsRead ?? (ctxMarkAllAsRead ?? (() => Promise.resolve()));

	const handleMarkAsRead = (notificationId: number) => {
		effectiveOnMarkAsRead(notificationId);
	};

	const handleDelete = (notificationId: number) => {
		effectiveOnDelete(notificationId);
	};

	const handleMarkAllAsRead = () => {
		effectiveOnMarkAllAsRead();
	};

	const unreadCount = effectiveNotifications.filter(
		(n) => n.status === "unread"
	).length;

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "error";
			case "medium":
				return "warning";
			case "low":
			default:
				return "info";
		}
	};

	const getTypeIcon = (type: string) => {
		// You can customize icons based on notification type
		switch (type) {
			case "BOOKING":
				return <NotificationsIcon fontSize="small" />;
			case "PAYMENT":
				return <NotificationsIcon fontSize="small" />;
			case "TRIP":
				return <NotificationsIcon fontSize="small" />;
			case "SYSTEM":
				return <NotificationsIcon fontSize="small" />;
			case "PROMOTION":
				return <NotificationsIcon fontSize="small" />;
			default:
				return <NotificationsIcon fontSize="small" />;
		}
	};

	return (
		<>
			<div ref={anchorRef} onClick={handleToggle}>
				{React.cloneElement(children, {
					"aria-describedby": open
						? "notification-popper"
						: undefined,
				} as any)}
			</div>

			<Portal>
				<Popper
					id="notification-popper"
					open={open}
					anchorEl={anchorRef.current}
					role={undefined}
					placement={placement}
					modifiers={[
						{
							name: "flip",
							enabled: true,
							options: {
								altBoundary: true,
								rootBoundary: "document",
								padding: 8,
							},
						},
						{
							name: "preventOverflow",
							enabled: true,
							options: {
								altAxis: true,
								altBoundary: true,
								tether: true,
								rootBoundary: "document",
								padding: 8,
							},
						},
					]}
					sx={{
						zIndex: 1000,
					}}
				>
					<ClickAwayListener onClickAway={handleClose}>
						<Paper
							sx={{
								width,
								maxHeight,
								overflow: "auto",
								boxShadow: (theme) => theme.shadows[8],
								border: 1,
								borderColor: "divider",
								zIndex: 2000,
							}}
						>
							{/* Header */}
							<Box
								sx={{
									p: 2,
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									borderBottom: 1,
									borderColor: "divider",
								}}
							>
								<Typography variant="h6" component="div">
									Notifications
									{unreadCount > 0 && (
										<Badge
											badgeContent={unreadCount}
											color="error"
											sx={{ ml: 1 }}
										/>
									)}
								</Typography>
								<Box>
									{unreadCount > 0 && (
										<Button
											size="small"
											onClick={handleMarkAllAsRead}
											sx={{ mr: 1 }}
										>
											Mark all read
										</Button>
									)}
									<IconButton
										size="small"
										onClick={handleClose}
									>
										<CloseIcon />
									</IconButton>
								</Box>
							</Box>

							{/* Content */}
							{effectiveLoading ? (
								<Box
									sx={{
										display: "flex",
										justifyContent: "center",
										p: 3,
									}}
								>
									<CircularProgress size={24} />
								</Box>
							) : effectiveNotifications.length === 0 ? (
								<Box sx={{ p: 3, textAlign: "center" }}>
									<NotificationsNoneIcon
										sx={{
											fontSize: 48,
											color: "text.secondary",
											mb: 1,
										}}
									/>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										No notifications
									</Typography>
								</Box>
							) : (
								<List sx={{ py: 0 }}>
									{effectiveNotifications.map((notification, index) => (
											<React.Fragment
												key={notification.id}
											>
												<ListItem
													sx={{
														py: 1.5,
														px: 2,
														"&:hover": {
															backgroundColor:
																"action.hover",
														},
														backgroundColor:
															notification.status ===
															"unread"
																? "action.selected"
																: "transparent",
													}}
												>
													<ListItemIcon
														sx={{ minWidth: 40 }}
													>
														<Badge
															color={getPriorityColor(
																notification.priority
															)}
															variant="dot"
															invisible={
																notification.status ===
																"read"
															}
														>
															{getTypeIcon(
																notification.type
															)}
														</Badge>
													</ListItemIcon>
													<ListItemText
														primary={
															<Typography
																variant="subtitle2"
																sx={{
																	fontWeight:
																		notification.status ===
																		"unread"
																			? "bold"
																			: "normal",
																}}
															>
																{
																	notification.title
																}
															</Typography>
														}
														secondary={
															<Box>
																<Typography
																	variant="body2"
																	color="text.secondary"
																	sx={{
																		display:
																			"-webkit-box",
																		WebkitLineClamp: 2,
																		WebkitBoxOrient:
																			"vertical",
																		overflow:
																			"hidden",
																		lineHeight: 1.3,
																	}}
																>
																	{
																		notification.content
																	}
																</Typography>
																<Typography
																	variant="caption"
																	color="text.secondary"
																	sx={{
																		mt: 0.5,
																	}}
																>
																	{notification.createdAt
																		? new Date(
																				notification.createdAt
																		  ).toLocaleDateString()
																		: ""}
																</Typography>
															</Box>
														}
													/>
													<Box
														sx={{
															display: "flex",
															gap: 0.5,
														}}
													>
														{notification.status ===
															"unread" && (
															<IconButton
																size="small"
																onClick={() =>
																	handleMarkAsRead(
																		notification.id
																	)
																}
																sx={{ p: 0.5 }}
															>
																<DoneIcon fontSize="small" />
															</IconButton>
														)}
														<IconButton
															size="small"
															onClick={() =>
																handleDelete(
																	notification.id
																)
															}
															sx={{ p: 0.5 }}
														>
															<DeleteIcon fontSize="small" />
														</IconButton>
													</Box>
												</ListItem>
												{index < effectiveNotifications.length - 1 && <Divider />}
											</React.Fragment>
										)
									)}
								</List>
							)}
						</Paper>
					</ClickAwayListener>
				</Popper>
			</Portal>
		</>
	);
};

export default NotificationPopper;
