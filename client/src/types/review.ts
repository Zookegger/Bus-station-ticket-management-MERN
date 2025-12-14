import type { User } from "./user";
import type { Trip } from "./trip";

export interface Review {
	id: number;
	userId: string;
	tripId: number;
	rating: number;
	comment?: string;
	createdAt: string;
	updatedAt: string;
	user?: User;
	trip?: Trip;
}

export interface CreateReviewDTO {
	tripId: number;
	rating: number;
	comment?: string;
}
