// Authentication service

import { api, handleApiError, setAuthToken } from "./api";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";
import type { User } from "../types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Authentication service class
class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      const { user, token, refreshToken } = response.data;

      // Store tokens
      setAuthToken(token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      return { user, token, refreshToken };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      );
      const { user, token, refreshToken } = response.data;

      // Store tokens
      setAuthToken(token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      return { user, token, refreshToken };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear stored data
      setAuthToken(null);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await api.post<{ token: string }>(
        API_ENDPOINTS.AUTH.REFRESH
      );
      const { token } = response.data;

      setAuthToken(token);
      return token;
    } catch (error) {
      // If refresh fails, logout user
      this.logout();
      throw new Error("Session expired. Please login again.");
    }
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put<User>(
        API_ENDPOINTS.USERS.PROFILE,
        userData
      );
      const updatedUser = response.data;

      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reset password request
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post("/auth/forgot-password", { email });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post("/auth/reset-password", { token, newPassword });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
