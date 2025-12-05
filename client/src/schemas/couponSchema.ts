import { z } from "zod";
import { CouponType } from "@my-types";

export const couponSchema = z.object({
	title: z.string().min(1, "Title is required"),
	code: z.string().min(1, "Code is required"),
	type: z.nativeEnum(CouponType),
	value: z.coerce.number().min(0, "Value must be non-negative"),
	startPeriod: z.coerce.date(),
	endPeriod: z.coerce.date(),
	maxUsage: z.coerce.number().min(1, "Max usage must be at least 1"),
	isActive: z.boolean().default(true),
	description: z.string().optional(),
}).refine((data) => data.endPeriod >= data.startPeriod, {
	message: "End date cannot be before start date",
	path: ["endPeriod"],
});

export type CouponFormData = z.infer<typeof couponSchema>;
