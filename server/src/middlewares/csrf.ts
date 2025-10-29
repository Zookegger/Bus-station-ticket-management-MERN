/**
 * CSRF Protection Configuration using Signed Double-Submit Cookie Pattern
 *
 * Implements the HMAC Based Token Pattern for CSRF protection in Express.js.
 * This is a more secure version of the Double Submit Cookie pattern.
 *
 * @module csrfMiddleware
 * @see {@link https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#hmac-based-token-pattern} OWASP Signed Double-Submit Cookie
 *
 * == SECURE CSRF PROTECTION FLOW ==
 *
 * 1. USER AUTHENTICATION (HTTP-Only Cookies):
 *    - Client sends POST /api/auth/login with credentials.
 *    - Server validates, sets secure `httpOnly` cookies for `accessToken` and `refreshToken`.
 *    - Server's response includes user data and a `csrfToken` in the JSON body.
 *    - The `double-csrf` library automatically sets a separate, secure, `httpOnly` cookie
 *      containing the CSRF **secret** (the signature).
 *
 * 2. CLIENT-SIDE TOKEN HANDLING:
 *    - The client receives the `csrfToken` from the login response body.
 *    - It MUST store this token (e.g., in memory, like in a Redux/Context store).
 *    - The browser automatically handles the `httpOnly` auth and CSRF secret cookies.
 *
 * 3. PROTECTED OPERATIONS (State-Changing Requests):
 *    - Client sends a POST/PUT/DELETE request.
 *    - The browser automatically attaches the `httpOnly` cookies.
 *    - The client's code MUST manually add the `X-CSRF-Token` header, using the
 *      public token it received and stored from the login response.
 *
 * 4. SERVER-SIDE VERIFICATION:
 *    - The `authenticateJwt` middleware validates the `accessToken` from the cookie.
 *    - The `doubleCsrfProtection` middleware then:
 *      a. Reads the public token from the `X-CSRF-Token` header.
 *      b. Reads the secret from the `httpOnly` CSRF cookie.
 *      c. Verifies that the public token is validly signed by the secret.
 *    - If both checks pass, the request proceeds.
 *
 * 5. SECURITY FEATURES:
 *    - Signed Double-Submit: An attacker cannot forge a token because they cannot access
 *      the `httpOnly` secret cookie needed to create a valid signature.
 *    - Session-Tied: Tokens are linked to the authenticated user's session.
 *    - Secure Cookie Prefixes: `__Host-` prefix ensures cookies are sent only from the origin server over HTTPS.
 *    - `httpOnly`: The most critical cookies (auth tokens, CSRF secret) are inaccessible to client-side scripts.
 *
 * 6. FRONTEND IMPLEMENTATION EXAMPLE:
 *    ```javascript
 *    // After login, store the csrfToken from the response body
 *    const loginResponse = await fetch('/api/auth/login', { method: 'POST', body: ... });
 *    const { csrfToken } = await loginResponse.json();
 *    // Store csrfToken in memory (e.g., a global variable or state management)
 *    window.csrfToken = csrfToken;
 *
 *    // For subsequent state-changing requests:
 *    await fetch('/api/orders', {
 *      method: 'POST',
 *      headers: {
 *        'X-CSRF-Token': window.csrfToken, // Manually attach the token
 *        'Content-Type': 'application/json'
 *      },
 *      body: JSON.stringify(orderData)
 *    });
 *    ```
 *
 * 7. PROTECTION SCOPE:
 *    - Applied to all state-changing routes (POST, PUT, DELETE, PATCH) that rely on cookie-based authentication.
 *    - Not needed for unauthenticated GET requests.
 */

import { doubleCsrf } from "csrf-csrf";
import { Request, Response } from "express";
import { authenticateJwt, isAdmin, optionalAuthenticateJwt } from "./auth";
import { CSRF_CONFIG } from "@constants/security";

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
		req?.secret || CSRF_CONFIG.SECRET,
	getSessionIdentifier: (req) =>
		(req as any).user?.id || req.ip || "anonymous", // Identifies the session (use user ID if authenticated, fallback to IP)
	// Use the __Host- prefix only in production where Secure cookies are expected.
	// Browsers require the Secure attribute for __Host- cookies; during local
	// development (HTTP) the cookie would be ignored by the browser which
	// causes CSRF validation to fail because the cookie is never sent back.
	cookieName:
		CSRF_CONFIG.COOKIE_NAME,
	cookieOptions: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		path: "/",
	},
	size: 64, // The size of the generated tokens in bits
	ignoredMethods: ["GET", "HEAD", "OPTIONS"], // A list of request methods that will not be protected.
	getCsrfTokenFromRequest: (req) => req.headers[CSRF_CONFIG.HEADER_NAME], // A function that returns the token from the request
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
export const csrfAdminProtectionRoute = [authenticateJwt, isAdmin, doubleCsrfProtection];

/**
 * Pre-configured CSRF protection route middleware
 *
 * Combines authentication with CSRF protection for secure routes.
 * Use this middleware array for routes that require authentication and
 * CSRF protection but not necessarily admin privileges.
 *
 * @constant {Function[]} csrfProtectionRoute
 *
 * @example
 * // Apply to authenticated routes:
 * app.post('/api/bookings', csrfProtectionRoute, createBooking);
 *
 * @returns {Function[]} Array containing [authenticateJwt, doubleCsrfProtection] middleware
 */
export const csrfUserProtectionRoute = [authenticateJwt, doubleCsrfProtection];

/**
 * Pre-configured CSRF protection route for both guests and authenticated users.
 *
 * Combines optional authentication with CSRF protection. This is ideal for
 * routes like order creation where both logged-in users and guests can perform
 * the action. The `getSessionIdentifier` will fall back to the user's IP if
 * no user is authenticated, ensuring session integrity for all.
 *
 * @constant {Function[]} csrfGuestOrUserProtectionRoute
 *
 * @example
 * // Apply to a public-facing POST route:
 * orderRoutes.post('/', csrfGuestOrUserProtectionRoute, createOrder);
 *
 * @returns {Function[]} Array containing [optionalAuthenticateJwt, doubleCsrfProtection] middleware
 */
export const csrfGuestOrUserProtectionRoute = [optionalAuthenticateJwt, doubleCsrfProtection];

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
