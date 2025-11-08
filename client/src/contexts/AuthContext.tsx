import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import type { User } from "@my-types/user";
import { AuthContext } from "./AuthContext.context";
import { API_ENDPOINTS, CSRF_CONFIG, ROUTES } from "@constants";
import type { LoginDTO, LoginResponse } from "@my-types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [csrfToken, setCsrfToken] = useState<string | null>(null);

	// This interceptor automatically adds the CSRF token to state-changing requests.
	useEffect(() => {
		/* --- Axios Request Interceptor for CSRF Token --- */
		const requestInterceptor = axios.interceptors.request.use(
			(config) => {
				const methodRequiringCsrf = ["post", "put", "patch", "delete"];
				const method = (config.method ?? "").toLowerCase();

				if (csrfToken && methodRequiringCsrf.includes(method)) {
					config.headers = config.headers || {};
					config.headers[CSRF_CONFIG.HEADER_NAME] = csrfToken;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		// Automatically refreshes expired access tokens when any API call receives a 401 (Unauthorized) error, allowing the user to stay logged in without manual intervention.
		const responseInterceptor = axios.interceptors.response.use(
			(response) => response, // Pass through successful responses
			async (err) => {
				// Guard against errors without a config object
				if (!err.config) {
					return Promise.reject(err);
				}

				const originalRequest = err.config;
				const requestUrl = originalRequest.url || "";
				// Check if the error is 401, the request was not for refreshing, and we haven't retried yet
				if (err.response?.status === 401 && !originalRequest._retry) {
					// NEVER attempt refresh for these endpoints:
					// 1. Login endpoint - invalid credentials, not an expired token
					// 2. Refresh endpoint - refresh itself failed, session is dead
					// 3. Public endpoints - no session expected
					const no_retry_endpoints = [
						API_ENDPOINTS.AUTH.LOGIN,
						API_ENDPOINTS.AUTH.REFRESH,
						API_ENDPOINTS.AUTH.REGISTER,
						API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
						API_ENDPOINTS.AUTH.RESET_PASSWORD,
						API_ENDPOINTS.AUTH.ME,
						API_ENDPOINTS.AUTH.CSRF_TOKEN,
					];

					const should_not_retry = no_retry_endpoints.some(
						(endpoint) => requestUrl.includes(endpoint)
					);

					// If we shouldn't retry OR we've already retried this request, reject immediately
					if (should_not_retry || originalRequest._retry) {
						// If refresh itself failed, clear auth state and redirect
						setUser(null);
						setCsrfToken(null);
						if (requestUrl.includes(API_ENDPOINTS.AUTH.REFRESH)) {
							window.location.href = ROUTES.LOGIN;
						}
						return Promise.reject(err);
					}

					originalRequest._retry = true; // Mark that we've retried this request
					try {
						await axios.post(API_ENDPOINTS.AUTH.REFRESH);
						return axios(originalRequest);
					} catch (refreshErr) {
						setUser(null);
						setCsrfToken(null);
						console.error("Session expired. Please log in again.");
						window.location.href = ROUTES.LOGIN;
						return Promise.reject(refreshErr);
					} finally {
						setIsLoading(false);
					}
				}
				// For all other errors (400, 403, 500, etc.), reject immediately
				// This allows the calling function's catch block to handle it
				return Promise.reject(err);
			}
		);

		// Clean up the interceptor when the component unmounts
		return () => {
			axios.interceptors.request.eject(requestInterceptor);
			axios.interceptors.response.eject(responseInterceptor);
		};
	}, [csrfToken]); // Re-attach if csrfToken ever changes

	// --- Initial Authentication Check ---
	// On component mount, check if the user has a valid session cookie.
	useEffect(() => {
		const verifyUserSession = async () => {
			try {
				// Check if user has a valid session cookie
				const response = await axios.get(API_ENDPOINTS.AUTH.ME);

				// Validate response exists
				if (!response || !response.data)
					throw new Error("No response received from server");
				
				// Extract user and CSRF token from response
				const user_response = response.data.user;
				const csrf_response = response.data.csrfToken;

				console.log(user_response);
				console.log(csrf_response);

				// Validate user data exists before setting state
				if (!user_response) {
					throw new Error("User data is missing from response")
				}
				
				// Validate CSRF token exists
				if (!csrf_response) {
					throw new Error("CSRF token is missing from response")
				}

				// Update authentication state
                setUser(user_response);
                setCsrfToken(csrf_response);

				if (!user) {
					throw new Error("Missing User data");
				}

				if (!csrfToken) {
					throw new Error("Missing CSRF Token");
				}

			} catch (err) {
				// A 401 error here means the user is not logged in.
				// No need to do anything, user state is already null.
				console.log(err ?? "No active session found.");
			} finally {
				setIsLoading(false);
			}
		};

		verifyUserSession();
	}, []);

	/**
	 * Logs in a user and returns the user object, CSRF token, and a success message.
	 *
	 * @param {LoginDTO} login_dto - The user's credentials (login and password).
	 * @returns {Promise<LoginResponse>} A promise that resolves with the user, csrfToken, and message.
	 * @throws {AxiosError} Throws an Axios error if the API call fails (400, 401, 500, etc.).
	 */
	const login = async (login_dto: LoginDTO): Promise<LoginResponse> => {
		try {
			const response = await axios.post(
				API_ENDPOINTS.AUTH.LOGIN,
				{
					login: login_dto.login,
					password: login_dto.password,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
					timeout: 7000,
					timeoutErrorMessage: "Connection timeout, try again",
				}
			);

			// On success, extract user and csrfToken from the response data.
			const { user, csrfToken, message } = response.data;

			// Update the global state with the new user and CSRF token.
			setUser(user);
			setCsrfToken(csrfToken);

			return { user, csrfToken, message };
		} catch (err) {
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async (): Promise<void> => {
		try {
			const response = await axios.post("/auth/logout");
			if (response.status === 200) {
				setUser(null);
				setCsrfToken(null);
			}
		} catch (err) {
			console.error("Logout failed:", err);
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Whether a user is currently authenticated.
	 * @returns {boolean} True if user is logged in, false otherwise
	 */
	const isAuthenticated = user !== null;

	/**
	 * Whether the current user has admin privileges.
	 * @returns {boolean} True if user is an admin, false otherwise
	 */
	const isAdmin = user?.role === "Admin";

	return (
		<AuthContext.Provider
			value={{ user, login, logout, isLoading, isAdmin, isAuthenticated }}
		>
			{children}
		</AuthContext.Provider>
	);
};
