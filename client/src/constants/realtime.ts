export const REALTIME_NAMESPACE = "/realtime";

/** Socket.io rooms */
export const ROOMS = {
	user: (user_id: string) => `user:${user_id}`,
	trip: (trip_id: number | string) => `trip:${trip_id}`,
	dashboard: "dashboard:admin",
};

/** Outbound events (server -> client) */
export const RT_EVENTS = {
	AUTH_SUCCESS: "authorization_success",
	AUTH_ERROR: "authorization_error",
	NOTIFICATION_NEW: "notification:new",
	NOTIFICATION_BULK: "notification:bulk",
	SEAT_UPDATE: "seat:update",
	SEAT_BULK: "seat:bulk",
	DASHBOARD_METRICS: "dashboard:metrics",
	TRIP_STATUS: "trip:status",
	CRUD_CHANGE: "crud:change",
};

/** Inbound events (client -> server) */
export const IN_EVENTS = {
	ROOM_JOIN: "room:join",
	ROOM_LEAVE: "room:leave",
};

export const WEBSOCKET_CONNECTION_STATES = {
	DISCONNECTED: "disconnected",
	CONNECTING: "connecting",
	CONNECTED: "connected",
	AUTHENTICATED: "authenticated",
	RECONNECTING: "reconnecting",
	ERROR: "error",
};
