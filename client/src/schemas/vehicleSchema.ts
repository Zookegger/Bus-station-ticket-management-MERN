import { z } from "zod";
import { VehicleStatus } from "@my-types/vehicle";

export const vehicleSchema = z.object({
	numberPlate: z.string().min(1, "Number plate is required"),
	// Allow string input for vehicleTypeId which will be coerced to number
	vehicleTypeId: z.preprocess((val) => {
		// Treat empty string as undefined so it fails the `.min(1)` check
		if (typeof val === "string") {
			if (val.trim() === "") return undefined;
			const n = Number(val);
			return Number.isNaN(n) ? val : n;
		}
		return val;
	}, z.number().min(1, "Vehicle Type is required")),
	manufacturer: z.string().nullable().optional(),
	model: z.string().nullable().optional(),
	status: z.enum(VehicleStatus).default(VehicleStatus.ACTIVE),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
export type VehicleInput = z.input<typeof vehicleSchema>;
