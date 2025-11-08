/**
 * Client-side type definitions for Refresh Tokens.
 * Based on server/src/types/refreshToken.ts
 */

/**
 * Metadata about the device/session where the refresh token was issued.
 */
export interface DeviceInfo {
	userAgent: string;
	ipAddress: string;
}
