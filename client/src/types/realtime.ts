import type { Notification } from "./notifications";
import type { Seat } from "./seat";
import type { DashboardStats } from "./dashboard";
import type { TripStatus } from "./trip";

export interface NotificationPayload
	extends Pick<
		Notification,
		| "id"
		| "userId"
		| "title"
		| "content"
		| "readAt"
		| "type"
		| "priority"
		| "status"
		| "metadata"
		| "createdAt"
		| "updatedAt"
	> {
	userId: string;
}

export interface SeatPayload
	extends Pick<
		Seat,
		"id" | "number" | "status" | "tripId" | "reservedBy" | "reservedUntil"
	> {}

export interface DashboardMetricsPayload extends DashboardStats {
	generatedAt: string;
}

export interface TripStatusPayload {
	tripId: number;
	status: TripStatus;
	updatedAt: string;
}
