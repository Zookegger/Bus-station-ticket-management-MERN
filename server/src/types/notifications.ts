export const NotificationTypes = {
    BOOKING: "booking",
    PAYMENT: "payment",
    TRIP: "trip",
    SYSTEM: "system",
    PROMOTION: "promotion",
} as const;

export type NotificationType =
    (typeof NotificationTypes)[keyof typeof NotificationTypes];

export const NotificationStatuses = {
    UNREAD: "unread",
    READ: "read",
    ARCHIVED: "archived",
} as const;

export type NotificationStatus =
    (typeof NotificationStatuses)[keyof typeof NotificationStatuses];

export const NotificationPriorities = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
} as const;

export type NotificationPriority =
    (typeof NotificationPriorities)[keyof typeof NotificationPriorities];
