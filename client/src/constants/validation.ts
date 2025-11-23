import type { ValidationRules } from "@my-types/types";

/**
 * Client-side validation rules for form inputs.
 */
export const VALIDATION_RULES: ValidationRules = {
	EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	PASSWORD_MIN_LENGTH: 8,
	NAME_MIN_LENGTH: 2,
	NAME_MAX_LENGTH: 50,
} as const;
