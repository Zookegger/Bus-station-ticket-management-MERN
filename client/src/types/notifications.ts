/**
 * Client-side type definitions for Notifications.
 * Based on server/src/types/notifications.ts
 */

export type NotificationType = "booking" | "payment" | "trip" | "system" | "promotion";

export type NotificationStatus = "unread" | "read" | "archived";

export type NotificationPriority = "low" | "medium" | "high";

/**
 * Represents a notification object on the client-side.
 */
export interface Notification {
    id: string; // UUID
    userId: string; // UUID
    type: NotificationType;
    title: string;
    message: string;
    status: NotificationStatus;
    priority: NotificationPriority;
    readAt?: string | null; // ISO Date string
    createdAt: string; // ISO Date string
    updatedAt: string; // ISO Date string
}
