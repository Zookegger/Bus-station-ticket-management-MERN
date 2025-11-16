import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { handleAxiosError } from "./handleError";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface CallApiProps {
	method: HttpMethod;
	url: string;
	data?: any; // request body for POST/PUT
	params?: Record<string, any>; // query params for GET
	headers?: Record<string, string>;
	timeout?: number;
}

/**
 * Generic API caller using axios. Returns `response.data`.
 *
 * Example:
 * await callApi({ method: 'POST', url: '/api/login', data: { email, password } })
 */
export async function callApi<T = any>(opts: CallApiProps): Promise<T> {
	const config: AxiosRequestConfig = {
		method: opts.method,
		url: opts.url,
		data: opts.data,
		params: opts.params,
		headers: opts.headers,
		timeout: opts.timeout,
	};

	try {
		const res = await axios.request<T>(config);
		return res.data;
	} catch (err) {
		// Re-throw so callers can handle or inspect the axios error
		throw handleAxiosError(err);
	}
}

export default callApi;
