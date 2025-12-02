import type { ApiEndpoints } from "@my-types";

/**
 * API endpoint paths for backend interactions.
 * Relative paths are fine (concat with apiBaseUrl); avoid full URLs here.
 *
 * @type {ApiEndpoints}
 * @remarks
 * - Construct full URLs as `${APP_CONFIG.apiBaseUrl}${API_ENDPOINTS.AUTH.LOGIN}`.
 * - All endpoints assume RESTful conventions; adjust for GraphQL if needed.
 */
export const API_ENDPOINTS: ApiEndpoints = {
	UPLOADS: {
		AVATARS: (url: string) => `/uploads/avatars/${url}`,
		COUPONS: (url: string) => `/uploads/coupons/${url}`,
	},
	AUTH: {
		LOGIN: "/auth/login",
		REGISTER: "/auth/register",
		LOGOUT: "/auth/logout",
		REFRESH: "/auth/refresh",
		FORGOT_PASSWORD: "/auth/forgot-password",
		VERIFY_EMAIL: "/auth/verify-email",
		RESET_PASSWORD: "/auth/reset-password",
		RESET_PASSWORD_WITH_TOKEN: "/auth/reset-password/:token",
		CHANGE_PASSWORD: "/auth/change-password",
		CHANGE_PASSWORD_WITH_ID: "/auth/change-password/:id",
		ME: "/auth/me",
		CSRF_TOKEN: "/auth/csrf-token",
		CSRF_VERIFY: "/auth/csrf-token",
	},
	USERS: {
		BASE: "/users",
		PROFILE: (id: string) => `/users/profile/${id}`,
		VERIFY_EMAIL: (id: string) => `/users/profile/verify-email/${id}`,
		CHANGE_EMAIL: (id: string) => `/users/profile/change-email/${id}`,
		DELETE_PROFILE: (id: string) => `/users/profile/${id}`,
		UPDATE_PROFILE: (id: string) => `/users/profile/${id}`,
		ADMIN_UPDATE: (id: string) => `/users/${id}`,
		ADMIN_DELETE: (id: string) => `/users/${id}`,
		WEBSOCKET_AUTH: (id: string) => `/users/websocket-token/${id}`
	},
	VEHICLE: {
		BASE: "/vehicles",
		SEARCH: "/vehicles/search",
		BY_ID: "/vehicles/:id",
		CREATE: "/vehicles",
		UPDATE: (id: number) => `/vehicles/${id}`,
		DELETE: (id: number) => `/vehicles/${id}`,
	},
	VEHICLE_TYPE: {
		BASE: "/vehicle-types",
		SEARCH: "/vehicle-types/search",
		BY_ID: "/vehicle-types/:id",
		CREATE: "/vehicle-types",
		UPDATE: (id: number) => `/vehicle-types/${id}`,
		DELETE: (id: number) => `/vehicle-types/${id}`,
	},
	TRIP: {
		BASE: "/trips",
		SEARCH: "/trips/search",
		BY_ID: (id: number) => `/trips/${id}`,
		CREATE: "/trips",
		UPDATE: (id: number) => `/trips/${id}`,
		DELETE: (id: number) => `/trips/${id}`,
		ASSIGN_DRIVER: "/trips/:id/assign-driver",
		AUTO_ASSIGN_DRIVER: "/trips/:id/auto-assign",
		UNASSIGN_DRIVER: "/trips/:id/assign-driver",
	},
	DRIVER: {
		BASE: "/drivers",
		SEARCH: "/drivers/search",
		BY_ID: "/drivers/:id",
		CREATE: "/drivers",
		UPDATE: (id: number) => `/drivers/${id}`,
		DELETE: (id: number) => `/drivers/${id}`,
		SCHEDULE: "/drivers/:id/schedule",
	},
	LOCATION: {
		BASE: "/locations",
		SEARCH: "/locations/search",
		BY_ID: "/locations/:id",
		BY_COORDINATES: "/locations/:lat/:lon",
		CREATE: "/locations",
		UPDATE: (id: number) => `/locations/${id}`,
		DELETE: (id: number) => `/locations/${id}`,
	},
	ROUTE: {
		BASE: "/routes",
		BY_ID: "/routes/:id",
		CREATE: "/routes",
		UPDATE: (id: number) => `/routes/${id}`,
		DELETE: (id: number) => `/routes/${id}`,
	},
	COUPON: {
		BASE: "/coupons",
		SEARCH: "/coupons",
		BY_ID: "/coupons/:id",
		BY_CODE: (code: string) => `/coupons/code/${code}`,
		ADD: "/coupons",
		UPDATE: (id: number) => `/coupons/${id}`,
		DELETE: (id: number) => `/coupons/${id}`,
		PREVIEW: "/coupons/preview",
	},
	SEAT: {
		BASE: "/seats",
		BY_ID: (id: number) => `/seats/${id}`,
		BY_TRIP_ID: (tripId: number) => `/seats/seat-by-trip/${tripId}`,
		UPDATE: "/seats/:id",
	},
	PAYMENT_METHOD: {
		BASE: "/payment-methods",
		BY_CODE: "/payment-methods/code/:code",
		ALL: "/payment-methods/all",
		ACTIVE: "/payment-methods/active",
		CREATE: "/payment-methods",
		UPDATE: (id: number) => `/payment-methods/${id}`,
		DELETE: (id: number) => `/payment-methods/${id}`,
	},
	ORDER: {
		BASE: "/orders",
		CREATE: "/orders",
		BY_ID: "/orders/:id",
		BY_USER: "/orders/user/:id",
		BY_GUEST: "/orders/guest",
		REFUND: "/orders/:id/refund",
	},
	SETTINGS: {
		BASE: "/settings",
		UPDATE: "/settings/:key",
	},
	CHECKIN: {
		VERIFY: "/check-in/:orderId",
	},
	NOTIFICATION: {
		BASE: "/notifications",
		READ_ALL: "/notifications/read-all",
		READ: (id: number) => `/notifications/${id}/read`,
		DELETE: (id: number) => `/notifications/${id}`,
	},
	DEBUG: {
		TRIGGER_PAYMENT_CLEANUP: "/debug/trigger-payment-cleanup",
		PAYMENT_QUEUE_STATS: "/debug/payment-queue-stats",
		TEST_WEBSOCKET: "/debug/test-websocket",
		WEBSOCKET_STATS: "/debug/websocket-stats",
	},
	ADMIN: {
		BASE: "/admin/users",
		ADD: "/admin/users",
		UPDATE: (id: string) => `/admin/users/${id}`,
		DELETE: (id: string) => `/admin/users/${id}`,
	}
} as const;
