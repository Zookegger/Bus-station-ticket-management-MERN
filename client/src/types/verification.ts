/**
 * Client-side type definitions for Verification.
 * Based on server/src/types/verification.ts
 */

/**
 * DTO for email verification operations.
 */
export interface EmailVerificationDTO {
    userId: string;
    email: string;
    username: string;
};
