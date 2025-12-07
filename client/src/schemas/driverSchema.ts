import { DriverStatus, Gender, LicenseClass } from "@my-types";
import { z } from "zod";

/**
 * Normalises optional text inputs by mapping blank strings to null.
 * @param {unknown} arg - Raw value received from the form.
 * @returns {unknown} Null when the input is blank, otherwise the original value.
 */
const nullableStringPreprocess = (arg: unknown): unknown => {
	if (typeof arg === "string" && arg.trim().length === 0) {
		return null;
	}
	return arg;
};

/**
 * Normalises required inputs by mapping blank strings to undefined so Zod raises required errors.
 * @param {unknown} arg - Raw value received from the form.
 * @returns {unknown} Undefined when the input is blank, otherwise the original value.
 */
const requiredFieldPreprocess = (arg: unknown): unknown => {
	if (typeof arg === "string" && arg.trim().length === 0) {
		return undefined;
	}
	return arg;
};

/** Optional date schema that respects blank input as null. */
const optionalDateSchema = z.preprocess(
	nullableStringPreprocess,
	z.coerce.date().nullable().optional()
);

/**
 * Builds a required date schema with consistent error messaging.
 * @param {string} label - Friendly label for the date field.
 * @returns {z.ZodType<Date>} Schema enforcing a valid date selection.
 */
const createRequiredDateSchema = (label: string): z.ZodType<Date> =>
	z.preprocess(
		(arg: unknown) => {
			// Normalize blank strings to undefined so z.date reports required errors
			const preprocessed = requiredFieldPreprocess(arg);
			// If it's a non-empty string, attempt to coerce to a Date object
			if (typeof preprocessed === "string") {
				return new Date(preprocessed);
			}
			// Pass through other types (Date, undefined, null, etc.)
			return preprocessed;
		},
		z
			.date({
				message: `${label} is required`,
			})
			.refine((value) => !Number.isNaN(value.getTime()), {
				message: `${label} is required`,
			})
	);

/** Required license category schema ensuring a selection is made. */
const licenseCategorySchema = z.preprocess(
	requiredFieldPreprocess,
	z.nativeEnum(LicenseClass, {
		message: "License class is required",
	})
);

export const driverSchema = z.object({
	gender: z.nativeEnum(Gender).default(Gender.OTHER),
	fullname: z.string().trim().min(1, "Full name is required"),
	email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
	phoneNumber: z.string().trim().min(1, "Phone number is required").regex(/^[0-9+\-\s()]{10,16}$/, "Invalid phone number format"),
	citizenId: z.string().trim().min(1, "Citizen ID is required"),
	address: z.preprocess(nullableStringPreprocess, z.string().trim().nullable().optional()),
	dateOfBirth: createRequiredDateSchema("Date of birth"),
	hiredAt: optionalDateSchema,
	licenseNumber: z.string().trim().min(1, "License number is required"),
	licenseCategory: licenseCategorySchema,
	licenseIssueDate: createRequiredDateSchema("Issue date"),
	licenseExpiryDate: createRequiredDateSchema("Expiry date"),
	issuingAuthority: z.string().trim().min(1, "Issuing authority is required"),
	status: z.nativeEnum(DriverStatus).default(DriverStatus.ACTIVE),
	avatar: z.any().optional(),
});

export type DriverFormData = z.infer<typeof driverSchema>;
