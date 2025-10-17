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
 *
 * == CSRF PROTECTION FLOW ==
 *
 * 1. USER AUTHENTICATION (JWT):
 *    - Client sends POST /api/auth/login with credentials
 *    - Server validates and returns JWT token
 *    - Client stores JWT in localStorage/cookies
 *
 * 2. CSRF TOKEN GENERATION:
 *    - Client calls GET /api/auth/csrf-token (requires JWT auth)
 *    - Server generates CSRF token and:
 *      - Sets HTTP-only cookie: "__Host-psifi.x-csrf-token" (auto-sent by browser)
 *      - Returns token in JSON for manual header inclusion
 *    - Token is tied to authenticated user session via req.user.id
 *
 * 3. ADMIN OPERATIONS (State-Changing Requests):
 *    - Client sends POST/PUT/DELETE to admin routes with BOTH:
 *      - Authorization: Bearer <jwt> (authentication)
 *      - X-CSRF-Token: <csrf-token> (manual header)
 *    - Server validates:
 *      - JWT is valid + user has admin role (isAdmin middleware)
 *      - CSRF token in header matches cookie token (doubleCsrfProtection)
 *    - If both pass, request proceeds
 *
 * 4. SECURITY FEATURES:
 *    - Double Submit: Token must be in both cookie (automatic) and header (manual)
 *    - Session-Tied: Tokens linked to authenticated user (req.user.id)
 *    - Secure Cookie: __Host- prefix ensures host-only, secure transmission
 *    - SameSite: "strict" prevents cross-site requests
 *    - HttpOnly: Prevents client-side JavaScript access
 *
 * 5. FRONTEND IMPLEMENTATION EXAMPLE:
 *    ```javascript
 *    // After login, store JWT
 *    const jwt = loginResponse.data.token;
 *    localStorage.setItem('jwt', jwt);
 *
 *    // Get CSRF token
 *    const csrfResponse = await fetch('/api/auth/csrf-token', {
 *      headers: { 'Authorization': `Bearer ${jwt}` }
 *    });
 *    const { csrfToken } = await csrfResponse.json();
 *
 *    // Use both for admin requests
 *    await fetch('/api/locations', {
 *      method: 'POST',
 *      headers: {
 *        'Authorization': `Bearer ${jwt}`,
 *        'X-CSRF-Token': csrfToken,
 *        'Content-Type': 'application/json'
 *      },
 *      body: JSON.stringify(locationData)
 *    });
 *    ```
 *
 * 6. MIDDLEWARE ORDER:
 *    - csrfProtectionRoute = [isAdmin, doubleCsrfProtection]
 *    - isAdmin runs first: verifies JWT → sets req.user
 *    - doubleCsrfProtection runs second: uses req.user.id for session identification
 *
 * 7. PROTECTION SCOPE:
 *    - Applied to: POST/PUT/DELETE admin routes (state-changing operations)
 *    - Not applied to: GET/HEAD/OPTIONS (safe methods), auth routes (public)
 *    - Global protection removed: CSRF applied per-route, not globally
 */

import { doubleCsrf } from "csrf-csrf";
import { Request, Response } from "express";
import { authenticateJwt, isAdmin } from "./auth";

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
	// Use the __Host- prefix only in production where Secure cookies are expected.
	// Browsers require the Secure attribute for __Host- cookies; during local
	// development (HTTP) the cookie would be ignored by the browser which
	// causes CSRF validation to fail because the cookie is never sent back.
	cookieName:
		process.env.NODE_ENV === "production"
			? "__Host-psifi.x-csrf-token"
			: "psifi.x-csrf-token",
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
export const csrfProtectionRoute = [authenticateJwt, isAdmin, doubleCsrfProtection];

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
