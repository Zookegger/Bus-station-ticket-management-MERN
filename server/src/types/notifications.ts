/**
 * Constant object defining the available notification types.
 * @constant {Object.<string, string>}
 * @property {string} BOOKING - Notifications related to ticket bookings.
 * @property {string} PAYMENT - Notifications related to payments.
 * @property {string} TRIP - Notifications related to trips.
 * @property {string} SYSTEM - System-wide notifications.
 * @property {string} PROMOTION - Promotional notifications.
 */
export const NotificationTypes = {
    BOOKING: "booking",
    PAYMENT: "payment",
    TRIP: "trip",
    SYSTEM: "system",
    PROMOTION: "promotion",
} as const;

/**
 * Type representing the possible notification types.
 * @type {string}
 */
export type NotificationType =
    (typeof NotificationTypes)[keyof typeof NotificationTypes];

/**
 * Constant object defining the available notification statuses.
 * @constant {Object.<string, string>}
 * @property {string} UNREAD - The notification has not been read.
 * @property {string} READ - The notification has been read.
 * @property {string} ARCHIVED - The notification has been archived.
 */
export const NotificationStatuses = {
    UNREAD: "unread",
    READ: "read",
    ARCHIVED: "archived",
} as const;

/**
 * Type representing the possible notification statuses.
 * @type {string}
 */
export type NotificationStatus =
    (typeof NotificationStatuses)[keyof typeof NotificationStatuses];

/**
 * Constant object defining the available notification priorities.
 * @constant {Object.<string, string>}
 * @property {string} LOW - Low priority notification.
 * @property {string} MEDIUM - Medium priority notification.
 * @property {string} HIGH - High priority notification.
 */
export const NotificationPriorities = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
} as const;

/**
 * Type representing the possible notification priorities.
 * @type {string}
 */
export type NotificationPriority =
    (typeof NotificationPriorities)[keyof typeof NotificationPriorities];
