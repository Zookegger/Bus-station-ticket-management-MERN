# API Documentation

This document provides an overview of the Bus Station Ticket Management System API endpoints.

## Base URL

```text
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```text
Authorization: Bearer <your_jwt_token>
```

## CSRF (Double-Submit Cookie) Protection

This API uses a double-submit cookie CSRF protection pattern for state-changing requests (POST/PUT/DELETE) on admin routes. The server:

- Sets an HttpOnly cookie containing the CSRF token when you call `GET /api/auth/csrf-token` (the cookie is sent automatically by the browser).
- Returns the same token in the JSON response body so the client can add it to the `X-CSRF-Token` request header for subsequent requests.

Short flow:

1. Login and obtain a JWT via `POST /api/auth/login`.
2. Call `GET /api/auth/csrf-token` with header `Authorization: Bearer <accessToken>`.
    - Server sets a CSRF cookie (dev: `psifi.x-csrf-token`, prod: `__Host-psifi.x-csrf-token`) and returns `{ csrfToken: "<token>" }`.
3. For state-changing requests include both:
    - `Authorization: Bearer <accessToken>`
    - `X-CSRF-Token: <token-from-json>`
      The CSRF cookie will be sent automatically by the browser. Server validates header token matches cookie token.

Important notes:

- Do NOT copy-paste truncated tokens from the terminal. The token can be long; extract it programmatically (Postman test script, jq, etc.).
- The cookie is HttpOnly — the client reads the token from the JSON response, not from the cookie.
- In development the cookie name does not use the `__Host-` prefix (so it works on HTTP). In production the cookie name uses `__Host-` and requires HTTPS.

Examples

fetch (browser)

```javascript
// after you have accessToken
const csrfResp = await fetch("/api/auth/csrf-token", {
 headers: { Authorization: `Bearer ${accessToken}` },
});
const { csrfToken } = await csrfResp.json();

await fetch("/api/vehicle-types", {
 method: "POST",
 headers: {
  Authorization: `Bearer ${accessToken}`,
  "X-CSRF-Token": csrfToken,
  "Content-Type": "application/json",
 },
 body: JSON.stringify({ name: "Mini Bus", maxCapacity: 20 }),
});
```

curl (scripted)

```bash
# Login and capture access token (extract manually or with jq)
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"123456789"}' \
  http://localhost:5000/api/auth/login > /tmp/login.json
ACCESS_TOKEN=$(jq -r .accessToken /tmp/login.json)

# Get CSRF token and store cookies
curl -s -c /tmp/csrf_cookies.txt -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:5000/api/auth/csrf-token > /tmp/csrf.json
CSRF_TOKEN=$(jq -r .csrfToken /tmp/csrf.json)

# Use cookie jar and header token for protected POST
curl -i -b /tmp/csrf_cookies.txt -X POST http://localhost:5000/api/vehicle-types \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","maxCapacity":40}'
```

Postman (quick)

- Create an environment variable `accessToken` and `csrfToken`.
- Request 1 (Login): `POST {{baseUrl}}/api/auth/login` — store `accessToken` in Tests tab:

    ```js
    const body = pm.response.json();
    pm.environment.set("accessToken", body.accessToken);
    ```

- Request 2 (Get CSRF): `GET {{baseUrl}}/api/auth/csrf-token` with header `Authorization: Bearer {{accessToken}}`.
    In Tests tab:

    ```js
    const body = pm.response.json();
    pm.environment.set("csrfToken", body.csrfToken);
    ```

    Confirm cookie appears in Postman's cookie jar for the host.

- Request 3 (Protected POST): include headers:
  - `Authorization: Bearer {{accessToken}}`
  - `X-CSRF-Token: {{csrfToken}}`
        Make sure Postman will send cookies from the cookie jar (it does by default for that host).

Troubleshooting

- 401 on `GET /api/auth/csrf-token`: missing or invalid JWT; include `Authorization: Bearer <token>`.
- 403 on state-changing request: header token does not match cookie token — re-fetch CSRF token and ensure you use the full token value (programmatically) as `X-CSRF-Token`.
- Cookie missing in browser: ensure you are calling GET `/api/auth/csrf-token` from the same host/origin and that the cookie name is valid for your environment (dev uses `psifi.x-csrf-token`, production uses `__Host-psifi.x-csrf-token` and requires HTTPS).

Optional debug route (dev only): the server includes a temporary debug endpoint at `POST /api/debug/csrf-check` which returns the header and cookie values the server received and whether validation passed. It requires `Authorization`.

## Key Endpoints

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Vehicles

- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create new vehicle (Admin only)
- `PUT /api/vehicles/:id` - Update vehicle (Admin only)
- `DELETE /api/vehicles/:id` - Delete vehicle (Admin only)

### Vehicle Types

- `GET /api/vehicle-types` - Get all vehicle types
- `GET /api/vehicle-types/:id` - Get vehicle type by ID
- `POST /api/vehicle-types` - Create new vehicle type (Admin only)
- `PUT /api/vehicle-types/:id` - Update vehicle type (Admin only)
- `DELETE /api/vehicle-types/:id` - Delete vehicle type (Admin only)

### Trips

- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get trip by ID
- `POST /api/trips` - Create new trip (Admin only)
- `PUT /api/trips/:id` - Update trip (Admin only)
- `DELETE /api/trips/:id` - Delete trip (Admin only)

### Tickets

- `GET /api/tickets` - Get user tickets
- `GET /api/tickets/:id` - Get ticket by ID
- `POST /api/tickets` - Book new ticket
- `PUT /api/tickets/:id/cancel` - Cancel ticket

### Locations

- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get location by ID
- `POST /api/locations` - Create new location (Admin only)
- `PUT /api/locations/:id` - Update location (Admin only)
- `DELETE /api/locations/:id` - Delete location (Admin only)

### Users (Admin only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Notifications

- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/:id` - Get notification by ID
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/broadcast` - Send broadcast notification (Admin only)

### Admin Dashboard & Statistics

- `GET /api/admin/stats` - Get real-time system statistics (Admin only)
- `GET /api/admin/stats/overview` - Get dashboard overview metrics (Admin only)
- `GET /api/admin/stats/revenue` - Get revenue statistics (Admin only)
- `GET /api/admin/stats/bookings` - Get booking statistics over time (Admin only)
- `GET /api/admin/stats/users` - Get user registration statistics (Admin only)
- `GET /api/admin/stats/vehicles` - Get vehicle utilization statistics (Admin only)

## Response Format

All API responses follow this general structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "error": "Error message if success is false"
}
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate limited to prevent abuse. Rate limits vary by endpoint type.

## WebSocket Events (Planned)

Real-time features will be implemented using WebSocket connections:

- Seat availability updates
- Trip status changes
- Live notifications

## Detailed API Documentation

For complete API documentation with request/response examples, refer to the Swagger/OpenAPI specifications in the server code or check the route files in `server/src/routes/`.
