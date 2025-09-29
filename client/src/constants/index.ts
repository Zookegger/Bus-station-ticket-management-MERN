// Application constants

export const APP_CONFIG = {
  name: "EasyRide",
  version: "1.0.0",
  description: "Fast, easy, and secure bus ticket booking",
  author: "EasyRide Team",
  apiBaseUrl: "http://localhost:3001/api",
} as const;

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  LOGIN: "/login",
  REGISTER: "/register",
  NOT_FOUND: "/404",
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  USERS: {
    BASE: "/users",
    PROFILE: "/users/profile",
  },
} as const;

export const STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "user_data",
  THEME: "theme_preference",
  LANGUAGE: "language_preference",
} as const;

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  AUTO: "auto",
} as const;

export const LANGUAGES = {
  EN: "en",
  VI: "vi",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [5, 10, 20, 50],
} as const;

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;
