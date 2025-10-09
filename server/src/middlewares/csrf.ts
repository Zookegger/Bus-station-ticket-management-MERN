/**
 * CSRF Protection Configuration and Utilities
 *
 * Provides Double Submit Cookie pattern CSRF protection for Express.js applications.
 * This implementation follows the OWASP recommended pattern where a token is stored
 * in both a cookie (automatically sent by browser) and a custom header (manually
 * added by frontend), and the server validates that both tokens match.
 *
 * @module csrfMiddleware
 * @see {@link https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie} OWASP Double Submit Cookie
 */

import { doubleCsrf } from "csrf-csrf";
import { Request, Response } from "express";
import { isAdmin } from "./auth";

/**
 * Configuration object for Double CSRF protection
 *
 * @typedef {Object} DoubleCsrfConfig
 * @property {Function} getSecret - Function to retrieve the secret for token signing
 * @property {Function} getSessionIdentifier - Function to identify user sessions
 * @property {string} cookieName - Name of the CSRF token cookie
 * @property {Object} cookieOptions - Options for the CSRF token cookie
 * @property {number} size - Size of generated tokens in bits
 * @property {string[]} ignoredMethods - HTTP methods that skip CSRF protection
 * @property {Function} getCsrfTokenFromRequest - Function to extract token from request
 */

/**
 * Double CSRF protection utilities configuration
 *
 * Configures the CSRF protection system with secure defaults and session management.
 * This creates a CSRF token system that:
 * 1. Generates cryptographically secure tokens
 * 2. Stores tokens in httpOnly cookies for security
 * 3. Validates tokens on state-changing requests
 * 4. Supports session-based token management
 *
 * @constant {DoubleCsrfConfig}
 *
 * @example
 * // Frontend must include CSRF token in headers:
 * // headers: { 'X-CSRF-Token': tokenFromCookie }
 *
 * @property {Function} getSecret - Retrieves secret for token signing
 *   @param {Request} req - Express request object
 *   @returns {string} Secret key for token signing
 *
 * @property {Function} getSessionIdentifier - Identifies user sessions
 *   @param {Request} req - Express request object
 *   @returns {string} Session identifier (user ID, IP, or 'anonymous')
 *
 * @property {string} cookieName - CSRF token cookie name
 *   @value "__Host-psifi.x-csrf-token" - Uses __Host- prefix for additional security
 *
 * @property {Object} cookieOptions - Cookie configuration options
 *   @property {boolean} httpOnly - Prevents client-side JavaScript access
 *   @property {boolean} secure - Only sent over HTTPS in production
 *   @property {string} sameSite - "strict" prevents cross-site requests
 *   @property {string} path - Cookie path ("/" for entire domain)
 *
 * @property {number} size - Token size in bits
 *   @value 64 - 64-bit tokens (8 characters)
 *
 * @property {string[]} ignoredMethods - HTTP methods that skip CSRF
 *   @value ["GET", "HEAD", "OPTIONS"] - Safe methods don't need protection
 *
 * @property {Function} getCsrfTokenFromRequest - Extracts token from request
 *   @param {Request} req - Express request object
 *   @returns {string|undefined} CSRF token from 'x-csrf-token' header
 */
export const doubleCsrfUtilities = doubleCsrf({
	getSecret: (req) =>
		req?.secret ||
		process.env.CSRF_SECRET ||
		"default-secret-change-in-production",
	getSessionIdentifier: (req) =>
		(req as any).user?.id || req.ip || "anonymous", // Identifies the session (use user ID if authenticated, fallback to IP)
	cookieName: "__Host-psifi.x-csrf-token",
	cookieOptions: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		path: "/",
	},
	size: 64, // The size of the generated tokens in bits
	ignoredMethods: ["GET", "HEAD", "OPTIONS"], // A list of request methods that will not be protected.
	getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"], // A function that returns the token from the request
});

/**
 * Core CSRF protection middleware and utilities
 *
 * These are the main exports used throughout the application for CSRF protection.
 *
 * @namespace csrfExports
 */
export const { doubleCsrfProtection, generateCsrfToken, validateRequest } =
	doubleCsrfUtilities;

/**
 * Pre-configured CSRF protection route middleware
 *
 * Combines admin authentication with CSRF protection for secure admin routes.
 * Use this middleware array for routes that require both admin privileges and
 * CSRF protection.
 *
 * @constant {Function[]} csrfProtectionRoute
 *
 * @example
 * // Apply to admin routes:
 * app.post('/api/admin/vehicle-types', csrfProtectionRoute, createVehicleType);
 *
 * @returns {Function[]} Array containing [isAdmin, doubleCsrfProtection] middleware
 */
export const csrfProtectionRoute = [isAdmin, doubleCsrfProtection];

/**
 * Generates and returns a CSRF token
 *
 * Creates a new CSRF token, sets it in the response cookie, and returns the token
 * value for the client to use in subsequent requests. The frontend should call
 * this endpoint once when the application loads to get the initial token.
 *
 * @function getCsrfToken
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {string} The generated CSRF token
 *
 * @example
 * // Frontend usage:
 * // 1. Call GET /api/csrf-token on app load
 * // 2. Store the returned token
 * // 3. Include in all state-changing requests: headers: { 'X-CSRF-Token': token }
 *
 * @example
 * // Route setup:
 * app.get('/api/csrf-token', (req, res) => {
 *   const token = getCsrfToken(req, res);
 *   res.json({ csrfToken: token });
 * });
 */
export const getCsrfToken = (req: Request, res: Response): string => {
	return generateCsrfToken(req, res);
};

/**
 * Validates a CSRF token from the request
 *
 * Manually checks if the current request contains a valid CSRF token. This is useful
 * for routes that need custom validation logic or conditional CSRF protection.
 *
 * @function isValidCsrfToken
 *
 * @param {Request} req - Express request object
 * @returns {boolean} True if the CSRF token is valid, false otherwise
 *
 * @example
 * // Manual validation in controller:
 * app.post('/api/payment', (req, res) => {
 *   if (!isValidCsrfToken(req)) {
 *     return res.status(403).json({ error: 'Invalid CSRF token' });
 *   }
 *   // Process payment...
 * });
 *
 * @example
 * // Conditional validation:
 * if (req.user.role === 'admin' && !isValidCsrfToken(req)) {
 *   return res.status(403).json({ error: 'Admin CSRF validation failed' });
 * }
 */
export const isValidCsrfToken = (req: Request): boolean => {
	return validateRequest(req);
};
