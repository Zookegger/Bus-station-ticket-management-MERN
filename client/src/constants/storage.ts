import type { StorageKeys } from "@my-types";

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
