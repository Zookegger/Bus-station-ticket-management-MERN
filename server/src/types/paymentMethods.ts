
/**
 * DTO for creating a payment method.
 * @interface CreatePaymentMethodDTO
 * @property {string} name - The name of the payment method.
 * @property {string} code - The unique code for the payment method.
 * @property {boolean} [isActive] - Whether the payment method is active (defaults to true).
 * @property {any} [configJson] - Configuration data for the payment method.
 */
export interface CreatePaymentMethodDTO {
	name: string;
	code: string;
	isActive?: boolean;
	configJson?: any;
}

/**
 * DTO for updating a payment method.
 * @interface UpdatePaymentMethodDTO
 * @property {string} [name] - The updated name of the payment method.
 * @property {string} [code] - The updated code for the payment method.
 * @property {boolean} [isActive] - Whether the payment method is active.
 * @property {any} [configJson] - Updated configuration data.
 */
export interface UpdatePaymentMethodDTO {
	name?: string;
	code?: string;
	isActive?: boolean;
	configJson?: any;
}

/**
 * DTO for returning payment method data to clients.
 * @interface PaymentMethodResponseDTO
 * @property {string} id - The unique ID of the payment method.
 * @property {string} name - The name of the payment method.
 * @property {string} code - The code of the payment method.
 * @property {boolean} isActive - Whether the payment method is active.
 * @property {any} configJson - The configuration data.
 * @property {string} createdAt - The creation timestamp.
 * @property {string} updatedAt - The last update timestamp.
 */
export interface PaymentMethodResponseDTO {
	id: string;
	name: string;
	code: string;
	isActive: boolean;
	configJson: any;
	createdAt: string;
	updatedAt: string;
}
