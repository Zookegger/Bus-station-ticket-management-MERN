/**
 * Client-side type definitions for Payment Methods.
 * Based on server/src/types/paymentMethods.ts
 */

/**
 * DTO for creating a payment method.
 */
export interface CreatePaymentMethodDTO {
	name: string;
	code: string;
	isActive?: boolean;
	configJson?: any;
}

/**
 * DTO for updating a payment method.
 */
export interface UpdatePaymentMethodDTO {
	name?: string;
	code?: string;
	isActive?: boolean;
	configJson?: any;
}

/**
 * DTO for returning payment method data to clients.
 */
export interface PaymentMethodResponseDTO {
	id: string;
	name: string;
	code: string;
	isActive: boolean;
	configJson: any;
	createdAt: string; // ISO Date string
	updatedAt: string; // ISO Date string
}
