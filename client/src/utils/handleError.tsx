import { isAxiosError } from "axios";

/**
 * Represents normalized Axios error data for UI or logging utilities.
 */
export interface AxiosErrorPayload {
    readonly message: string;
    readonly status_code?: number;
    readonly field_errors?: Record<string, string>;
    readonly raw?: unknown;
}

/**
 * Normalizes unknown exceptions thrown by Axios into a predictable payload.
 * @param {unknown} err - Thrown error instance.
 * @param {string} [fallback_message="Failed to load data."] - Message used when none is provided by the server.
 * @returns {AxiosErrorPayload} Normalized error details ready for UI consumption.
 */
export const handleAxiosError = (
    err: unknown,
    fallback_message = "Failed to load data."
): AxiosErrorPayload => {
    if (isAxiosError(err)) {
        const status_code = err.response?.status;
        const response_data = (err.response?.data ?? {}) as {
            message?: unknown;
            // Express-validator returns an array of errors { msg, param/path, ... }
            // Other endpoints may return an object map of field -> message or array of messages
            errors?: Record<string, string | string[]> | Array<{ msg?: string; path?: string; param?: string; [k: string]: any }>;
        };
        const response_message =
            typeof response_data.message === "string" && response_data.message.trim().length > 0
                ? response_data.message
                : err.message;
        const message = response_message && response_message.length > 0 ? response_message : fallback_message;
        let field_errors: Record<string, string> | undefined;

        if (response_data.errors) {
            // If errors is an array (express-validator), map by path/param -> msg
            if (Array.isArray(response_data.errors)) {
                const aggregated: Record<string, string> = {};
                (response_data.errors as Array<any>).forEach((item) => {
                    const key = item.path ?? item.param ?? item.field ?? "";
                    const msg = item.msg ?? item.message ?? String(item);
                    if (key) {
                        // If multiple errors for same field, append
                        aggregated[key] = aggregated[key] ? `${aggregated[key]} ${msg}` : msg;
                    }
                });
                field_errors = Object.keys(aggregated).length > 0 ? aggregated : undefined;
            } else {
                const aggregated_errors = Object.entries(response_data.errors as Record<string, string | string[]>).reduce<Record<string, string>>(
                    (accumulator, [field_key, field_value]) => {
                        if (typeof field_value === "string" && field_value.trim().length > 0) {
                            accumulator[field_key] = field_value;
                        } else if (Array.isArray(field_value)) {
                            const serialized = field_value.filter((item) => typeof item === "string").join(" ").trim();
                            if (serialized.length > 0) {
                                accumulator[field_key] = serialized;
                            }
                        }
                        return accumulator;
                    },
                    {}
                );

                field_errors = Object.keys(aggregated_errors).length > 0 ? aggregated_errors : undefined;
            }
        }

        return {
            message,
            status_code,
            field_errors,
            raw: err.response?.data,
        };
    }

    if (err instanceof Error) {
        return {
            message: err.message && err.message.length > 0 ? err.message : fallback_message,
        };
    }

    return {
        message: fallback_message,
    };
};