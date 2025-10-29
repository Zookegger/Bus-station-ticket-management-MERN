import { UUID } from "crypto";

/**
 * Defines the shape of the JWT payload.
 * This is the data encoded into the token and available after verification.
 */
export interface JwtPayload {
    /** The unique identifier for the user (UUID). */
    id: UUID;
    /** The role of the user (e.g., 'Admin', 'User'). */
    role: string;
    /** Issued at timestamp. */
    iat?: number;
    /** Expiration timestamp. */
    exp?: number;
}