/**
 * Real-time event emission service for Socket.IO.
 *
 * Provides safe emission of events to specific rooms with error handling and logging.
 * Handles notifications, seat updates, dashboard metrics, trip status changes, and CRUD operations.
 */

import { ROOMS, RT_EVENTS } from "@constants/realtime";
import { NotificationAttributes } from "@models/notification";
import {
	DashboardMetricsPayload,
	NotificationPayload,
	SeatPayload,
	TripStatusPayload,
} from "@my_types/realtime";
import logger from "@utils/logger";
import { getIO } from "@utils/socket";

/**
 * Safely emits a Socket.IO event to a room with error handling.
 *
 * @param event - The event name to emit
 * @param room - The room name to emit to
 * @param data - The data payload to send
 */
const safeEmit = (event: string, room: string, data: any) => {
	try {
		logger.debug("Event:", event);
		logger.debug("Room:", room);
		logger.debug("Data:", data);
		getIO().of("/realtime").to(room).emit(event, data);
	} catch (err) {
		// keep silent in production or use logger
		logger.error("[Socket error]:", err);
	}
};

/**
 * Emits a new notification event to a specific user.
 *
 * @param payload - The notification attributes to emit
 */
export const emitNotification = (payload: NotificationAttributes) => {
	safeEmit(RT_EVENTS.NOTIFICATION_NEW, ROOMS.user(payload.userId), payload);
};

/**
 * Emits bulk notification events to multiple users.
 *
 * @param user_ids - Array of user IDs to notify
 * @param slimPayloads - The notification payload data
 */
export const emitBulkNotifications = (
	user_ids: string[],
	slimPayloads: NotificationPayload
) => {
	for (const uid of user_ids)
		safeEmit(RT_EVENTS.NOTIFICATION_NEW, ROOMS.user(uid), slimPayloads);
};

/**
 * Emits a seat update event for a specific trip.
 *
 * @param payload - The seat update payload containing trip and seat data
 */
export const emitSeatUpdate = (payload: SeatPayload) => {
	if (payload.tripId != null)
		safeEmit(RT_EVENTS.SEAT_UPDATE, ROOMS.trip(payload.tripId), payload);
};

/**
 * Emits bulk seat update events for a trip.
 *
 * @param trip_id - The trip ID for the room
 * @param payloads - Array of seat update payloads
 */
export const emitBulkSeatUpdates = (
	trip_id: number,
	payloads: SeatPayload[]
) => {
	safeEmit(RT_EVENTS.SEAT_BULK, ROOMS.trip(trip_id), payloads);
};

/**
 * Emits dashboard metrics update to admin dashboard.
 *
 * @param payload - The dashboard metrics payload
 */
export const emitDashboardMetrics = (payload: DashboardMetricsPayload) => {
	safeEmit(RT_EVENTS.DASHBOARD_METRICS, ROOMS.dashboard, payload);
};

/**
 * Emits trip status change event.
 *
 * @param payload - The trip status payload
 */
export const emitTripStatus = (payload: TripStatusPayload) => {
	safeEmit(RT_EVENTS.TRIP_STATUS, ROOMS.trip(payload.tripId), payload);
};

/**
 * Emits CRUD change events to admin dashboard.
 *
 * @param entity - The entity type (e.g., 'trip_assignment')
 * @param action - The CRUD action ('create', 'update', 'delete')
 * @param data - The change data payload
 * @param actor - Optional actor information (id and name)
 */
export const emitCrudChange = (
	entity: string,
	action: "create" | "update" | "delete",
	data: any,
	actor?: { id: string; name: string }
) => {
	// Broadcast to all admins (using dashboard room as admin room)
	safeEmit(RT_EVENTS.CRUD_CHANGE, ROOMS.dashboard, {
		entity,
		action,
		data,
		actor,
		timestamp: new Date(),
	});
};

