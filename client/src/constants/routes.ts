/**
 * Application route paths for navigation.
 *
 * @type {{ readonly HOME: "/"; readonly DASHBOARD: "/dashboard"; readonly PROFILE: "/profile"; readonly SETTINGS: "/settings"; readonly LOGIN: "/login"; readonly REGISTER: "/register"; readonly NOT_FOUND: "/404" }}
 * @remarks
 * - These are relative paths used with React Router or similar.
 * - Ensure all routes are protected appropriately (e.g., auth guards for DASHBOARD).
 */
export const ROUTES = {
	HOME: "/",
	SEAT_BOOKING: "/book",
	DASHBOARD_HOME: "/dashboard/home",
	DASHBOARD_VEHICLE: "/dashboard/vehicle",
	DASHBOARD_VEHICLE_TYPE: "/dashboard/vehicle-type",
	DASHBOARD_TRIP: "/dashboard/trip",
	DASHBOARD_USER: "/dashboard/user",
	DASHBOARD_SYSTEM: "/dashboard/system",
	CHECK_IN: "/check-in/:orderId",
	PROFILE: "/user/profile",
	VERIFY_EMAIL: "/verify-email",
	SETTINGS: "/settings",
	LOGIN: "/login",
	REGISTER: "/register",
	NOT_FOUND: "/404",
	PRIVACY_POLICY: "/privacy",
} as const;
