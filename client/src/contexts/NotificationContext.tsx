import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import { SocketContext } from "./SocketContext";
import { useAuth } from "@hooks/useAuth";
import { RT_EVENTS, ROOMS } from "@constants/realtime";
import type { Notification } from "@my-types/notifications";
import { callApi } from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants";

interface NotificationContextType {
	notifications: Notification[];
	unreadCount: number;
	isLoading: boolean;
	markAsRead: (id: number) => Promise<void>;
	markAllAsRead: () => Promise<void>;
	deleteNotification: (id: number) => Promise<void>;
}

// Provide a safe default so consumers can operate even if the provider
// isn't mounted (useful for certain dev routes or server-side rendering).
const DEFAULT_NOTIFICATION_CONTEXT: NotificationContextType = {
	notifications: [],
	unreadCount: 0,
	isLoading: false,
	markAsRead: async () => {},
	markAllAsRead: async () => {},
	deleteNotification: async () => {},
};

const NotificationContext = createContext<NotificationContextType>(
	DEFAULT_NOTIFICATION_CONTEXT
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// Read SocketContext directly and gracefully handle when it's not provided.
	// This makes NotificationProvider independent of the websocket provider
	// so the app can render without an active socket connection.
	const socketCtx = useContext(SocketContext);
	const socket = socketCtx?.socket ?? null;
	const isConnected = socketCtx?.isConnected ?? false;
	const joinRoom = socketCtx?.joinRoom ?? (() => {});
	const leaveRoom = socketCtx?.leaveRoom ?? (() => {});
	const { isAuthenticated, user } = useAuth();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState<number>(0);
	const [isLoading, setIsLoading] = useState(false);

	// 1. Fetch initial notifications
	const fetchNotifications = useCallback(async () => {
		if (!isAuthenticated) return;
		try {
			setIsLoading(true);
			const res = await callApi({
				method: "GET",
				url: API_ENDPOINTS.NOTIFICATION.BASE,
			});
			// Normalize different possible response shapes from backend
			let payload: any = res;
			if (res && typeof res === "object") {
				if (Array.isArray(res)) payload = res;
				else if (Array.isArray(res.data)) payload = res.data;
				else if (Array.isArray(res.data?.data)) payload = res.data.data;
				else if (Array.isArray(res.rows)) payload = res.rows;
				else payload = [];
			}

			setNotifications(payload);
		} catch (err) {
			console.error("Failed to fetch notifications", err);
		} finally {
			setIsLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		fetchNotifications();
	}, [fetchNotifications]);

	// 2. Listen for Realtime Events
	useEffect(() => {
		if (!socket || !isConnected || !isAuthenticated || !user) return;

		// Join user-specific room so server can emit to it
		try {
			joinRoom(ROOMS.user(user.id));
		} catch (err) {
			console.error("Failed to join notification room", err);
		}

		const handleNewNotification = (newNotification: Notification) => {
			setNotifications((prev) => [newNotification, ...prev]);
		};

		socket.on(RT_EVENTS.NOTIFICATION_NEW, handleNewNotification);

		return () => {
			try {
				leaveRoom(ROOMS.user(user.id));
			} catch (err) {
				// ignore
			}
			socket.off(RT_EVENTS.NOTIFICATION_NEW, handleNewNotification);
		};
	}, [socket, isConnected, isAuthenticated, user, joinRoom, leaveRoom]);

	useEffect(() => {
		setUnreadCount(
			notifications.filter((n) => n.status === "unread").length
		);
	}, [notifications]);

	// 3. Actions
	const markAsRead = async (id: number) => {
		try {
			await callApi({
				method: "PUT",
				url: API_ENDPOINTS.NOTIFICATION.READ(id),
			});
			setNotifications((prev) =>
				prev.map((n) =>
					n.id === id
						? {
								...n,
								status: "read",
								readAt: new Date(),
						  }
						: n
				)
			);
		} catch (err) {
			console.error(err);
		}
	};

	const markAllAsRead = async () => {
		try {
			await callApi({
				method: "PUT",
				url: API_ENDPOINTS.NOTIFICATION.READ_ALL,
			});
			setNotifications((prev) =>
				prev.map((n) => ({
					...n,
					status: "read",
					readAt: new Date(),
				}))
			);
		} catch (err) {
			console.error(err);
		}
	};

	const deleteNotification = async (id: number) => {
		try {
			await callApi({
				method: "DELETE",
				url: API_ENDPOINTS.NOTIFICATION.DELETE(id),
			});
			setNotifications((prev) => prev.filter((n) => n.id !== id));
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				isLoading,
				markAsRead,
				markAllAsRead,
				deleteNotification,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
};

export const useNotifications = () => {
	return useContext(NotificationContext);
};
