import type { User } from "./user";

export interface FederatedCredential {
	id?: string;
	userId: string;
	user?: User;
	provider: string; // 'google', 'facebook'
	subject: string; // ID from the provider
}