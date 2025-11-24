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

/**
 * Model attribute interface for PaymentMethod (server-aligned).
 * Mirrors server `PaymentMethod` model attributes used by APIs and lists.
 */
export interface PaymentMethodAttributes {
	id: string;
	name: string;
	code: string;
	isActive: boolean;
	configJson?: any | null;
	createdAt?: Date | string;
	updatedAt?: Date | string;
}

export type PaymentMethodCreationAttributes = Omit<Partial<PaymentMethodAttributes>, 'id'> & Partial<Pick<PaymentMethodAttributes, 'id'>>;
