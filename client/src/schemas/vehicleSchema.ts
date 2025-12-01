import { z } from "zod";
import { VehicleStatus } from "@my-types/vehicle";

export const vehicleSchema = z.object({
	numberPlate: z.string().min(1, "Number plate is required"),
	vehicleTypeId: z.coerce.number().min(1, "Vehicle Type is required"),
	manufacturer: z.string().nullable().optional(),
	model: z.string().nullable().optional(),
	status: z.enum(VehicleStatus).default(VehicleStatus.ACTIVE),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
