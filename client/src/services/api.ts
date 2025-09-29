// API service layer

import type { ApiResponse } from "../types";
import { APP_CONFIG } from "../constants";

// API client configuration
const API_BASE_URL = APP_CONFIG.apiBaseUrl;

// Default headers
const defaultHeaders = {
  "Content-Type": "application/json",
};

// Create axios-like fetch wrapper
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string, headers: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Get token from localStorage if available
    const token = localStorage.getItem("auth_token");

    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return this.request<T>(url.pathname + url.search, {
      method: "GET",
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL, defaultHeaders);

// Generic API functions
export const api = {
  get: <T>(endpoint: string, params?: Record<string, any>) =>
    apiClient.get<T>(endpoint, params),

  post: <T>(endpoint: string, data?: any) => apiClient.post<T>(endpoint, data),

  put: <T>(endpoint: string, data?: any) => apiClient.put<T>(endpoint, data),

  patch: <T>(endpoint: string, data?: any) =>
    apiClient.patch<T>(endpoint, data),

  delete: <T>(endpoint: string) => apiClient.delete<T>(endpoint),
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// Request interceptor for adding auth token
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
};

// Response interceptor for handling common errors
export const handleResponse = <T>(response: ApiResponse<T>): T => {
  if (!response.success) {
    throw new Error(response.message || "Request failed");
  }
  return response.data;
};
