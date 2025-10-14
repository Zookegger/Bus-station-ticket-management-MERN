/**
 * Verification-related data transfer objects.
 *
 * This module defines interfaces for email verification operations
 * used in the authentication and user verification flow.
 */

/**
 * Data Transfer Object for email verification operations.
 *
 * Contains the necessary information to send verification emails
 * and track verification status for user accounts.
 *
 * @interface EmailVerificationDTO
 * @property {string} userId - Unique identifier of the user being verified
 * @property {string} email - Email address to send verification to
 * @property {string} username - Username associated with the account
 */
export interface EmailVerificationDTO {
    userId: string,
    email: string,
    username: string
};