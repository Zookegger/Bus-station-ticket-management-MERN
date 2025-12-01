import { z } from "zod";

export const paymentMethodSchema = z.object({
	name: z.string().min(1, "Name is required"),
	code: z.string().min(1, "Code is required"),
	// Make isActive required to match the form's expected type
	isActive: z.boolean(),
	configJson: z.string().refine((val) => {
		try {
			JSON.parse(val);
			return true;
		} catch (e) {
			return false;
		}
	}, "Invalid JSON format"),
});

export type PaymentMethodForm = z.infer<typeof paymentMethodSchema>;
