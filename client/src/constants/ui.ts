import type { Pagination } from "@my-types/types";

/**
 * Available theme modes for UI styling.
 */
export const THEMES = {
	LIGHT: "light",
	DARK: "dark",
	AUTO: "auto",
} as const;

/**
 * Supported language codes for internationalization (i18n).
 */
export const LANGUAGES = {
	EN: "en",
	VI: "vi",
} as const;

/**
 * Pagination defaults and options for lists and data tables.
 */
export const PAGINATION: Pagination = {
	DEFAULT_PAGE: 1,
	DEFAULT_LIMIT: 10,
	LIMIT_OPTIONS: [5, 10, 20, 50],
} as const;

/**
 * Material-UI Chip color options for status indicators.
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
