import { ROOMS, RT_EVENTS } from "@constants/realtime";
import { NotificationAttributes } from "@models/notification";
import {
	DashboardMetricsPayload,
	NotificationPayload,
	SeatPayload,
	TripStatusPayload,
} from "@my_types/realtime";
import { getIO } from "@utils/socket";

const safeEmit = (event: string, room: string, data: any) => {
	try {
		getIO().of("/realtime").to(room).emit(event, data);
	} catch (err) {
		// keep silent in production or use logger
	}
};

export const emitNotification = (payload: NotificationAttributes) => {
	safeEmit(RT_EVENTS.NOTIFICATION_NEW, ROOMS.user(payload.userId), payload);
};

export const emitBulkNotifications = (
	user_ids: string[],
	slimPayloads: NotificationPayload
) => {
	for (const uid of user_ids)
		safeEmit(RT_EVENTS.NOTIFICATION_NEW, ROOMS.user(uid), slimPayloads);
};

export const emitSeatUpdate = (payload: SeatPayload) => {
	if (payload.tripId != null)
		safeEmit(RT_EVENTS.SEAT_UPDATE, ROOMS.trip(payload.tripId), payload);
};

export const emitBulkSeatUpdates = (
	trip_id: number,
	payloads: SeatPayload[]
) => {
	safeEmit(RT_EVENTS.SEAT_BULK, ROOMS.trip(trip_id), payloads);
};

export const emitDashboardMetrics = (payload: DashboardMetricsPayload) => {
	safeEmit(RT_EVENTS.DASHBOARD_METRICS, ROOMS.dashboard, payload);
};

export const emitTripStatus = (payload: TripStatusPayload) => {
	safeEmit(RT_EVENTS.TRIP_STATUS, ROOMS.trip(payload.tripId), payload);
};
