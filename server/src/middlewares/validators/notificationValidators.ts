/**
 * Notification validation rules.
 * Uses express-validator and follows project validator patterns.
 */
import { body, param, query } from "express-validator";
import {
  NotificationTypes,
  NotificationPriorities,
  NotificationStatuses,
} from "@my_types/notifications";

/**
 * Validation for creating a notification.
 */
export const createNotificationValidation = [
  body("userId")
    .notEmpty()
    .withMessage("userId is required")
    .isUUID()
    .withMessage("userId must be a valid UUID"),
  body("title")
    .notEmpty()
    .withMessage("title is required")
    .isString()
    .withMessage("title must be a string")
    .isLength({ max: 255 })
    .withMessage("title must be at most 255 characters"),
  body("content")
    .optional()
    .isString()
    .withMessage("content must be a string"),
  body("type")
    .optional()
    .isIn(Object.values(NotificationTypes) as string[])
    .withMessage(`type must be one of: ${Object.values(NotificationTypes).join(", ")}`),
  body("priority")
    .optional()
    .isIn(Object.values(NotificationPriorities) as string[])
    .withMessage(`priority must be one of: ${Object.values(NotificationPriorities).join(", ")}`),
  body("metadata").optional(),
];

/**
 * Validation for listing/getting notifications (query params).
 */
export const getUserNotificationsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be an integer >= 1"),
  query("per_page")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("per_page must be an integer between 1 and 100"),
  query("status")
    .optional()
    .isIn(Object.values(NotificationStatuses) as string[])
    .withMessage(`status must be one of: ${Object.values(NotificationStatuses).join(", ")}`),
];

/**
 * Validation for marking a single notification as read.
 */
export const markAsReadValidation = [
  param("id").isInt().withMessage("id must be a valid notification integer id"),
];

/**
 * Validation for deleting a notification.
 */
export const deleteNotificationValidation = [
  param("id").isInt().withMessage("id must be a valid notification integer id"),
];

export default {
  createNotificationValidation,
  getUserNotificationsValidation,
  markAsReadValidation,
  deleteNotificationValidation,
};
