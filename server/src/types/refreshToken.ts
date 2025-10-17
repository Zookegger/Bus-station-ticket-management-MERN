/**
 * Metadata about the device/session where the refresh token was issued.
 *
 * Typically derived from the request's headers (User-Agent) and IP address.
 * Useful for tracking sessions, limiting concurrent logins, and detecting anomalies.
 *
 * @property {string} userAgent - The client’s User-Agent string (browser, OS, device).
 * @property {string} ipAddress - The client’s IP address (IPv4 or IPv6).
 */
export type deviceInfo = {
	userAgent: string;
	ipAddress: string;
};