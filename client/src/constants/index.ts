import type {
	AppConfig,
	ApiEndpoints,
	StorageKeys,
	Pagination,
	ValidationRules,
} from "@my-types/types";

/**
 * Application configuration object containing static and environment-based settings.
 *
 * @type {AppConfig}
 * @remarks
 * - `name` and `apiBaseUrl` are sourced from environment variables (`VITE_APP_NAME`, `VITE_API_BASE_URL`) with fallbacks for development.
 * - This config is loaded at build time and should not contain sensitive data, as it's client-side.
 * - For production, ensure `VITE_API_BASE_URL` is set to a secure HTTPS endpoint.
 */
export const APP_CONFIG: AppConfig = {
	name: import.meta.env.VITE_APP_NAME || "Default App",
	version: "1.0.0",
	description: "Fast, easy, and secure bus ticket booking",
	author: "EasyRide Team",
	apiBaseUrl:
		import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api",
} as const;

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
	DASHBOARD_HOME: "/dashboard/home",
	DASHBOARD_VEHICLE: "/dashboard/vehicle",
	DASHBOARD_VEHICLE_TYPE: "/dashboard/vehicle-type",
	DASHBOARD_TRIP: "/dashboard/trip",
	DASHBOARD_USER: "/dashboard/user",
	DASHBOARD_SYSTEM: "/dashboard/system",
	PROFILE: "/profile",
	VERIFY_EMAIL: "/verify-email",
	SETTINGS: "/settings",
	LOGIN: "/login",
	REGISTER: "/register",
	NOT_FOUND: "/404",
	PRIVACY_POLICY: "/privacy",
} as const;

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
	AUTH: {
		LOGIN: "/auth/login",
		REGISTER: "/auth/register",
		LOGOUT: "/auth/logout",
		REFRESH: "/auth/refresh",
		FORGOT_PASSWORD: "/auth/forgot-password",
		VERIFY_EMAIL: "/auth/verify-email",
		RESET_PASSWORD: "/auth/reset-password",
		ME: "/auth/me",
		CSRF_TOKEN: "/auth/csrf-token"
	},
	USERS: {
		BASE: "/users",
		PROFILE: "/users/profile",
		UPDATE_PROFILE: "/users/update-profile",
	},
	VEHICLE: {
		BASE: "/vehicles",
		SEARCH: "/vehicles/search",
		BY_ID: "/vehicles/:id"
	},
	VEHICLE_TYPE: {
		BASE: "/vehicle-types",
		SEARCH: "/vehicle-types/search",
		BY_ID: "/vehicle-types/:id"
	},
	TRIP: {
		BASE: "/trips",
		SEARCH: "/trips/search",
		BY_ID: "/trips/:id"
	},
	DRIVER: {
		BASE: "/drivers",
		SEARCH: "/drivers/search",
		BY_ID: "/drivers/:id"
	},
	LOCATION: {
		BASE: "/locations",
		SEARCH: "/locations/search",
		BY_ID: "/locations/:id",
		BY_COORDINATES: "/locations/:lat/:lon"
	},
	ROUTE: {
		BASE: "/routes",
		SEARCH: "/routes/search",
		BY_ID: "/routes/:id"
	},
	SEAT: {
		BASE: "/seats",
		BY_ID: "/seats/:id"
	},
} as const;

/**
 * Local storage keys for persisting app state.
 * @constant STORAGE_KEYS:
 * @remarks Namespace to reduce collision risks (e.g., localStorage.setItem('easyride_auth_token', ...))
 *
 * @type {StorageKeys}
 * @example
 *   localStorage.setItem(STORAGE_KEYS.TOKEN, jwtToken);
 *   const user = localStorage.getItem(STORAGE_KEYS.USER);
 */
export const STORAGE_KEYS: StorageKeys = {
	TOKEN: "easyride_auth_token", // Prefixed
	USER: "easyride_user_data",
	THEME: "easyride_theme_preference",
	LANGUAGE: "easyride_language_preference",
} as const;

/**
 * Available theme modes for UI styling.
 *
 * @type {{ readonly LIGHT: "light"; readonly DARK: "dark"; readonly AUTO: "auto" }}
 * @remarks
 * - `AUTO` typically follows system preference (prefers-color-scheme media query).
 * - Persist selection via localStorage with STORAGE_KEYS.THEME.
 */
export const THEMES = {
	LIGHT: "light",
	DARK: "dark",
	AUTO: "auto",
} as const;

/**
 * Supported language codes for internationalization (i18n).
 *
 * @type {{ readonly EN: "en"; readonly VI: "vi" }}
 * @remarks
 * - Defaults to 'en'; switch via localStorage with STORAGE_KEYS.LANGUAGE.
 * - Integrate with libraries like react-i18next for full i18n support.
 */
export const LANGUAGES = {
	EN: "en",
	VI: "vi",
} as const;

/**
 * Pagination defaults and options for lists and data tables.
 *
 * @type {Pagination}
 * @remarks
 * - Use LIMIT_OPTIONS for UI dropdowns.
 * - Server-side pagination should align with these for consistency.
 */
export const PAGINATION: Pagination = {
	DEFAULT_PAGE: 1,
	DEFAULT_LIMIT: 10,
	LIMIT_OPTIONS: [5, 10, 20, 50],
} as const;

/**
 * Client-side validation rules for form inputs.
 *
 * @type {ValidationRules}
 * @remarks
 * - These are for UX validation only; always re-validate on the server.
 * - EMAIL_REGEX is a basic pattern—consider libraries like validator.js for advanced checks.
 * @example
 *   const isValidEmail = VALIDATION_RULES.EMAIL_REGEX.test(email);
 */
export const VALIDATION_RULES: ValidationRules = {
	EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	PASSWORD_MIN_LENGTH: 8,
	NAME_MIN_LENGTH: 2,
	NAME_MAX_LENGTH: 50,
} as const;

/**
 * Material-UI Chip color options for status indicators.
 *
 * @remarks
 * - Used for consistent status color mapping across components.
 * - Matches Material-UI Chip component's color prop values.
 * @example
 *   const color = CONSTANTS.CHIP_COLORS.SUCCESS; // "success"
 */
export const CHIP_COLORS = {
	DEFAULT: "default",
	PRIMARY: "primary",
	SECONDARY: "secondary",
	ERROR: "error",
	INFO: "info",
	SUCCESS: "success",
	WARNING: "warning",
} as const;
