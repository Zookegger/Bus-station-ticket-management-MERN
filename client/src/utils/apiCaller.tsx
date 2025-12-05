import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { handleAxiosError } from "./handleError";
import { APP_CONFIG } from "@constants/index";

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
 * Generic API caller using axios with full TypeScript support.
 * 
 * @template T - The expected response data type
 * @template D - The request data type (for POST/PUT/PATCH)
 * 
 * @example
 * // Define your response type
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 * 
 * // Simple GET request with typed response
 * const user: User = await callApi<User>({ 
 *   method: 'GET', 
 *   url: '/api/user/123' 
 * });
 * 
 * @example
 * // POST request with request and response types
 * interface LoginRequest {
 *   email: string;
 *   password: string;
 * }
 * interface LoginResponse {
 *   token: string;
 *   user: User;
 * }
 * 
 * const loginData: LoginResponse = await callApi<LoginResponse, LoginRequest>({
 *   method: 'POST',
 *   url: '/api/auth/login',
 *   data: { email: 'user@example.com', password: 'secret' }
 * });
 * 
 * @example
 * // Using with order data (from your bus ticket system)
 * import type { Order } from '@my-types/order';
 * 
 * const orders: Order[] = await callApi<Order[]>({ 
 *   method: 'GET', 
 *   url: '/api/orders' 
 * });
 * 
 * @example
 * // With query parameters and typed response
 * interface OrderListResponse {
 *   orders: Order[];
 *   total: number;
 *   page: number;
 * }
 * 
 * const orderList: OrderListResponse = await callApi<OrderListResponse>({
 *   method: 'GET',
 *   url: '/api/orders',
 *   params: { page: 1, limit: 10, status: 'CONFIRMED' }
 * });
 * 
 * @example
 * // With cancellation support
 * const controller = new AbortController();
 * 
 * const fetchData = async () => {
 *   try {
 *     const data: SomeType = await callApi<SomeType>({
 *       method: 'GET',
 *       url: '/api/data',
 *       signal: controller.signal
 *     });
 *     console.log(data);
 *   } catch (error) {
 *     if (error.name === 'AbortError') {
 *       console.log('Request was cancelled');
 *     }
 *   }
 * };
 * 
 * // Cancel the request
 * controller.abort();
 * 
 * @example
 * // Return full response with status and headers
 * const response: ApiResponse<Order> = await callApi<Order>({
 *   method: 'POST',
 *   url: '/api/orders',
 *   data: orderData
 * }, { returnFullResponse: true });
 * 
 * console.log(response.status); // 201
 * console.log(response.headers['content-type']);
 * console.log(response.data); // The Order object
 * 
 * @example
 * // File upload with progress tracking
 * interface UploadResponse {
 *   fileUrl: string;
 *   fileId: string;
 * }
 * 
 * const uploadResult: UploadResponse = await callApi<UploadResponse>({
 *   method: 'POST',
 *   url: '/api/upload',
 *   data: formData,
 *   headers: { 'Content-Type': 'multipart/form-data' },
 *   onUploadProgress: (progressEvent) => {
 *     const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
 *     console.log(`Upload progress: ${percent}%`);
 *   }
 * });
 * 
 * @example
 * // Error handling with typed responses
 * try {
 *   const user: User = await callApi<User>({
 *     method: 'GET',
 *     url: '/api/user/invalid-id'
 *   });
 * } catch (error) {
 *   // error is already handled by handleAxiosError
 *   console.error('API Error:', error.message);
 * }
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