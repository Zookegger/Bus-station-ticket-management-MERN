import type { AppConfig } from "@my-types/types";

export const CSRF_CONFIG = {
    COOKIE_NAME:
        import.meta.env.NODE_ENV === "production"
            ? "__Host-psifi.x-csrf-token"
            : "psifi.x-csrf-token",
    HEADER_NAME: "x-csrf-token",
} as const;

/**
 * Application configuration object containing static and environment-based settings.
 */
export const APP_CONFIG: AppConfig = {
    name: import.meta.env.VITE_APP_NAME || "Default App",
    version: "1.0.0",
    description: "Fast, easy, and secure bus ticket booking",
    author: "EasyRide Team",
    apiBaseUrl:
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api",
    serverBaseUrl:
        import.meta.env.VITE_SERVER_BASE_URL || "http://127.0.0.1:5000",
} as const;