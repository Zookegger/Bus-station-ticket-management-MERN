# API Documentation

This document provides an overview of the Bus Station Ticket Management System API endpoints.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Key Endpoints

### Authentication

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