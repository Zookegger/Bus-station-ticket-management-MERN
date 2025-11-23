import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { handleAxiosError } from "./handleError";
import { APP_CONFIG } from "@constants";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || APP_CONFIG.apiBaseUrl;
axios.defaults.withCredentials = true;

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface CallApiProps<D = any> {
	method: HttpMethod;
	url: string;
	data?: D;
	params?: Record<string, any>;
	headers?: Record<string, string>;
	timeout?: number;
	// New: More flexibility
	signal?: AbortSignal; // For request cancellation
	responseType?: AxiosRequestConfig["responseType"]; // blob, arraybuffer, etc.
	onUploadProgress?: (progressEvent: any) => void;
	onDownloadProgress?: (progressEvent: any) => void;
	withCredentials?: boolean; // For cookies/auth
}

export interface ApiResponse<T> {
	data: T;
	status: number;
	headers: Record<string, any>;
}

/**
 * Generic API caller using axios.
 * 
 * @example
 * // Simple usage
 * const user = await callApi({ method: 'GET', url: '/api/user' });
 * 
 * @example
 * // With cancellation
 * const controller = new AbortController();
 * callApi({ method: 'GET', url: '/api/data', signal: controller.signal });
 * controller.abort(); // Cancel request
 * 
 * @example
 * // Return full response
 * const { data, status } = await callApi({ 
 *   method: 'POST', 
 *   url: '/api/login', 
 *   data: { email, password } 
 * }, { returnFullResponse: true });
 */
export async function callApi<T = any, D = any>(
	opts: CallApiProps<D>,
	options?: { returnFullResponse?: boolean }
): Promise<T | ApiResponse<T>> {
	const config: AxiosRequestConfig = {
		method: opts.method,
		url: opts.url,
		data: opts.data,
		params: opts.params,
		headers: opts.headers,
		timeout: opts.timeout,
		signal: opts.signal,
		responseType: opts.responseType,
		onUploadProgress: opts.onUploadProgress,
		onDownloadProgress: opts.onDownloadProgress,
		withCredentials: opts.withCredentials,
	};

	try {
		const res: AxiosResponse<T> = await axios.request<T>(config);
		
		if (options?.returnFullResponse) {
			return {
				data: res.data,
				status: res.status,
				headers: res.headers,
			};
		}
		
		return res.data;
	} catch (err) {
		throw handleAxiosError(err);
	}
}

export default callApi;