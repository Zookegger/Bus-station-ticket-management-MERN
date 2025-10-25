import { PaymentMethod, PaymentMethodCreationAttributes } from "@models/paymentMethod";

/**
 * Lists all active payment methods.
 * This is for the frontend to display available payment options to the user at checkout.
 * @returns {Promise<PaymentMethod[]>} A list of active payment methods.
 */
export const listActivePaymentMethods = async(): Promise<{rows: PaymentMethod[] | null, count: number}> => {
    return await PaymentMethod.findAndCountAll({where: {isActive: true}, order: [["name", "ASC"]]});
}

/**
 * Retrieves a single payment method by its unique code.
 * Used by the backend to get the configuration needed to process a payment.
 * @param {string} code - The unique code of the payment method (e.g., 'MOMO', 'VNPAY').
 * @returns {Promise<PaymentMethod | null>} The payment method object or null if not found.
 */
export const getPaymentMethodByCode = async (code: string): Promise<PaymentMethod | null> => {
    return await PaymentMethod.findOne({where: {code}});
}

/**
 * Retrieves a single payment method by its unique ID.
 * Used by the backend to get the configuration needed to process a payment.
 * @param {string} id - The unique UUID of the payment method.
 * @returns {Promise<PaymentMethod | null>} The payment method object or null if not found.
 */
export const getPaymentMethodById = async (id: string): Promise<PaymentMethod | null> => {
    return await PaymentMethod.findByPk(id);
}

// =================================================================
// ADMIN-ONLY FUNCTIONS
// =================================================================

/**
 * Lists all payment methods, including inactive ones. For admin panel usage.
 * @returns {Promise<PaymentMethod[]>} A complete list of payment methods.
 */
export const listAllPaymentMethods = async (): Promise<{rows: PaymentMethod[] | null, count: number}> => {
    return await PaymentMethod.findAndCountAll({ order: [["name", "ASC"]] });
}

/**
 * Creates a new payment method. For admin use.
 * @param {PaymentMethodCreationAttributes} data - The data for the new payment method.
 * @returns {Promise<PaymentMethod>} The newly created payment method.
 */
export const createPaymentMethod = async (data: PaymentMethodCreationAttributes): Promise<PaymentMethod> => {
    return PaymentMethod.create(data);
}

/**
 * Updates an existing payment method. For admin use.
 * @param {string} id - The UUID of the payment method to update.
 * @param {Partial<PaymentMethodCreationAttributes>} data - The fields to update.
 * @returns {Promise<PaymentMethod | null>} The updated payment method, or null if not found.
 */
export const updatePaymentMethod = async (id: string, data: Partial<PaymentMethodCreationAttributes>): Promise<PaymentMethod | null> => {
    const method = await PaymentMethod.findByPk(id);
    if (method) {
        return method.update(data);
    }
    return null;
}

/**
 * Deletes a payment method. For admin use.
 * @param {string} id - The UUID of the payment method to delete.
 * @returns {Promise<void>}
 */
export const deletePaymentMethod = async (id: string): Promise<void> => {
    const method = await PaymentMethod.findByPk(id);
    if (method) {
        await method.destroy();
    }
    throw { status: 404, message: `Cannot find payment method with id: ${id}`};
}