import { z } from "zod";

const emptyToNullString = z.union([z.string(), z.null(), z.undefined()])
	.transform((val) => {
		if (val === "" || val === null || val === undefined) return null;
		return val;
	})
	.pipe(z.string().nullable());

const numericInput = z.union([z.string(), z.number(), z.null(), z.undefined()]);

const preprocessNumberOptional = numericInput
	.transform((val) => {
		if (val === "" || val === null || val === undefined) return null;
		if (typeof val === "string") {
			const n = Number(val);
			return Number.isNaN(n) ? val : n;
		}
		return val;
	})
	.pipe(z.number().int().nullable());

export const vehicleTypeSchema = z.object({
	name: z.string().min(1, "Name is required"),
	price: preprocessNumberOptional.optional().refine((v) => v === null || v === undefined || v >= 0, { message: "Price must be non-negative" }),
	totalFloors: preprocessNumberOptional.optional().refine((v) => v === null || v === undefined || (Number.isInteger(v) && v >= 1), { message: "Must have at least 1 floor" }),
	totalSeats: preprocessNumberOptional.optional().refine((v) => v === null || v === undefined || (Number.isInteger(v) && v >= 0), { message: "Total seats must be non-negative" }),
	seatLayout: emptyToNullString.optional().refine(
		(val) => {
			if (!val) return true;
			try {
				JSON.parse(val);
				return true;
			} catch {
				return false;
			}
		},
		{ message: "Invalid JSON format for seat layout" }
	),
});

export type VehicleTypeFormData = z.infer<typeof vehicleTypeSchema>;
