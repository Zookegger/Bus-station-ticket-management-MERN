import { Gender, Role } from "@my-types";
import { z } from "zod";

export const userSchema = z.object({
	email: z.email("Invalid email address"),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	userName: z.string().min(3, "Username must be at least 3 characters"),
	address: z.string().optional().nullable(),
	gender: z.enum(Gender).optional().nullable(),
	dateOfBirth: z.date().optional().nullable(),
	phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
	role: z.enum(Role),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.optional(), // Optional for edit, required for create usually, but we can handle that with refinement or separate schemas if needed. For now, optional to support edit.
});

export type UserForm = z.infer<typeof userSchema>;

export const profileSchema = userSchema.pick({
	firstName: true,
	lastName: true,
	phoneNumber: true,
	address: true,
	gender: true,
	dateOfBirth: true,
});

export type ProfileForm = z.infer<typeof profileSchema>;
