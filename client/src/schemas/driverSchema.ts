import { DriverStatus, Gender } from "@my-types";
import { z } from "zod";

// Helper to convert empty strings to null for date fields
const datePreprocess = (arg: unknown) => {
	if (typeof arg === "string" && arg === "") return null;
	return arg;
};

// Schema for date fields: accepts string/date/null, transforms to Date object or null
const dateSchema = z.preprocess(
	datePreprocess,
	z.coerce.date().nullable().optional()
);

export const driverSchema = z.object({
	gender: z
		.enum(Gender)
		.default(Gender.OTHER),
	fullname: z.string().min(1, "Full name is required"),
	email: z
		.string()
		.email("Invalid email address")
		.nullable()
		.optional()
		.or(z.literal("").transform(() => null)),
	phoneNumber: z
		.string()
		.min(1, "Phone number is required")
		.regex(/^[0-9+\-\s()]{10,16}$/, "Invalid phone number format"),
	citizenId: z
		.string()
		.nullable()
		.optional()
		.or(z.literal("").transform(() => null)),
	address: z
		.string()
		.nullable()
		.optional()
		.or(z.literal("").transform(() => null)),
	dateOfBirth: dateSchema,
	hiredAt: dateSchema,
	licenseNumber: z.string().min(1, "License number is required"),
	licenseCategory: z
		.enum(["B1", "B2", "C", "D", "E", "F", "FC"])
		.nullable()
		.optional()
		.or(z.literal("").transform(() => null)),
	licenseIssueDate: dateSchema,
	licenseExpiryDate: dateSchema,
	issuingAuthority: z
		.string()
		.nullable()
		.optional()
		.or(z.literal("").transform(() => null)),
	isActive: z.boolean().default(true),
	status: z.enum(DriverStatus).default(DriverStatus.ACTIVE),
	isSuspended: z.boolean().default(false),
	avatar: z.any().optional(),
});

export type DriverFormData = z.infer<typeof driverSchema>;
