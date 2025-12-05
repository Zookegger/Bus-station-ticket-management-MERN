import { useEffect } from "react";
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
	const { socket, joinRoom, leaveRoom } = useSocket();

	useEffect(() => {
		if (!socket) return;

		joinRoom(ROOMS.dashboard);

		const handleCrudChange = (payload: any) => {
			const entities = Array.isArray(entity) ? entity : [entity];
			
			// If entity filter is provided, check if payload matches
			if (entity && !entities.includes(payload.entity)) return;

			// Trigger refresh
			if (onRefresh) onRefresh();

			// Notify
			if (onNotify) {
				const actionText = payload.action === 'create' ? 'created' : payload.action === 'update' ? 'updated' : 'deleted';
				const msg = `${payload.entity} ${actionText} by ${
					payload.actor?.name || "System"
				}`;
				onNotify(msg, "info");
			}
		};

		socket.on(RT_EVENTS.CRUD_CHANGE, handleCrudChange);

		return () => {
			socket.off(RT_EVENTS.CRUD_CHANGE, handleCrudChange);
			leaveRoom(ROOMS.dashboard);
		};
	}, [socket, joinRoom, leaveRoom, JSON.stringify(entity), onRefresh, onNotify]);
};
