import { useEffect, useRef } from "react";
import { useSocket } from "@contexts/SocketContext";
import { ROOMS, RT_EVENTS } from "@constants/realtime";

interface UseAdminRealtimeProps {
	entity?: string | string[]; // Can listen to one or multiple entities
	onRefresh?: () => void;
	onNotify?: (message: string, severity?: "success" | "info" | "warning" | "error") => void;
}

export const useAdminRealtime = ({
	entity,
	onRefresh,
	onNotify,
}: UseAdminRealtimeProps) => {
	const { socket, isConnected, joinRoom, leaveRoom } = useSocket();
	
	// Use refs to keep callbacks stable in the effect
	const onRefreshRef = useRef(onRefresh);
	const onNotifyRef = useRef(onNotify);

	useEffect(() => {
		onRefreshRef.current = onRefresh;
		onNotifyRef.current = onNotify;
	}, [onRefresh, onNotify]);

	useEffect(() => {
		if (!socket || !isConnected) return;

		joinRoom(ROOMS.dashboard);

		const handleCrudChange = (payload: any) => {
			const entities = Array.isArray(entity) ? entity : [entity];
			
			// If entity filter is provided, check if payload matches
			if (entity && !entities.includes(payload.entity)) return;

			// Trigger refresh
			if (onRefreshRef.current) onRefreshRef.current();

			// Notify
			if (onNotifyRef.current) {
				const actionText = payload.action === 'create' ? 'created' : payload.action === 'update' ? 'updated' : 'deleted';
				const formattedEntity = payload.entity.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
				const msg = `${formattedEntity} ${actionText} by ${
					payload.actor?.name || "System"
				}`;
				onNotifyRef.current(msg, "info");
			}
		};

		socket.on(RT_EVENTS.CRUD_CHANGE, handleCrudChange);

		return () => {
			socket.off(RT_EVENTS.CRUD_CHANGE, handleCrudChange);
			leaveRoom(ROOMS.dashboard);
		};
	}, [socket, isConnected, joinRoom, leaveRoom, JSON.stringify(entity)]);
};
