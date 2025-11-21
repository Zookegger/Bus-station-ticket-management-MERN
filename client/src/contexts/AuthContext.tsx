import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import type { User } from "@my-types/user";
import { AuthContext } from "./AuthContext.context";
import { API_ENDPOINTS, CSRF_CONFIG, ROUTES } from "@constants";
import type {
	LoginDTO,
	LoginResponse,
	RegisterDTO,
	RegisterResponse,
} from "@my-types/auth";
import { handleAxiosError } from "@utils/handleError";

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
						API_ENDPOINTS.AUTH.LOGOUT,
						API_ENDPOINTS.AUTH.REFRESH,
						API_ENDPOINTS.AUTH.REGISTER,
						API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
						API_ENDPOINTS.AUTH.RESET_PASSWORD,
						API_ENDPOINTS.AUTH.RESET_PASSWORD_WITH_TOKEN,
						API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
						API_ENDPOINTS.AUTH.CHANGE_PASSWORD_WITH_ID,
						API_ENDPOINTS.AUTH.VERIFY_EMAIL,
						API_ENDPOINTS.AUTH.ME,
						API_ENDPOINTS.AUTH.CSRF_TOKEN,
						API_ENDPOINTS.AUTH.CSRF_VERIFY,
					];

					const trimmed_url = requestUrl.split("?")[0];
					const should_not_retry = no_retry_endpoints.some(
						(endpoint) => {
							const normalized_endpoint = endpoint.split("/:")[0];
							return trimmed_url.includes(normalized_endpoint);
						}
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
				const csrfResponse = await axios.get(
					API_ENDPOINTS.AUTH.CSRF_TOKEN
				);
				const csrf_token = csrfResponse.data.csrfToken;

				if (!csrf_token) {
					throw new Error("CSRF token is missing from response");
				}

				// Set CSRF token for all users (authenticated or not)
				setCsrfToken(csrf_token);

				try {
					const userResponse = await axios.get(API_ENDPOINTS.AUTH.ME);

					// Validate response exists
					if (!userResponse || !userResponse.data?.user)
						throw new Error("User data is missing from response");

					// Update authentication state
					setUser(userResponse.data.user);
				} catch (userErr) {
					// User not logged in (401) - that's fine, they can be a guest
					// CSRF token is already set above
					console.log("No active session found (guest user)");
				}
			} catch (err) {
				// A 401 error here means the user is not logged in.
				// No need to do anything, user state is already null.
				console.error(err ?? "No active session found.");
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
				login_dto,
				{
					headers: {
						"Content-Type": "application/json",
					},
					timeout: 7000,
					timeoutErrorMessage: "Connection timeout, try again",
				}
			);

			// On success, extract user and csrfToken from the response data.
			const { user, message } = response.data;

			const csrfResponse = await axios.get(API_ENDPOINTS.AUTH.CSRF_TOKEN);
			const csrfToken = csrfResponse.data.csrfToken;

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

	const deleteAccount = async (): Promise<boolean> => {
		if (user) {
			try {
				const response = await axios.delete(
					API_ENDPOINTS.USERS.DELETE_PROFILE(user.id)
				);
				if (response.status === 200) {
					setCsrfToken(null);
					setUser(null);
					// ✅ After deleting accouunt, get a fresh CSRF token for guest session
					try {
						const csrfResponse = await axios.get(
							API_ENDPOINTS.AUTH.CSRF_TOKEN
						);
						setCsrfToken(csrfResponse.data.csrfToken);
					} catch (csrfErr) {
						// If we can't get a new token, clear it
						setCsrfToken(null);
						console.error(
							"Failed to get CSRF token after logout:",
							csrfErr
						);
					}
				}
				return true;
			} catch (err) {
				const message = handleAxiosError(err);
				console.error("Logout failed:", message);
				return false;
			} finally {
				setIsLoading(false);
			}
		}
		return false;
	};

	const logout = async (): Promise<void> => {
		try {
			const response = await axios.post(API_ENDPOINTS.AUTH.LOGOUT);
			if (response.status === 200) {
				setUser(null);

				// ✅ After logout, get a fresh CSRF token for guest session
				try {
					const csrfResponse = await axios.get(
						API_ENDPOINTS.AUTH.CSRF_TOKEN
					);
					setCsrfToken(csrfResponse.data.csrfToken);
				} catch (csrfErr) {
					// If we can't get a new token, clear it
					setCsrfToken(null);
					console.error(
						"Failed to get CSRF token after logout:",
						csrfErr
					);
				}
			}
		} catch (err) {
			const message = handleAxiosError(err);
			console.error("Logout failed:", message);
		} finally {
			setIsLoading(false);
		}
	};

	const register = async (
		register_dto: RegisterDTO
	): Promise<RegisterResponse> => {
		try {
			const response = await axios.post(
				API_ENDPOINTS.AUTH.REGISTER,
				register_dto,
				{
					headers: {
						"Content-Type": "application/json",
					},
					timeout: 7000,
					timeoutErrorMessage: "Connection timeout, try again",
				}
			);

			// On success, extract user and csrfToken from the response data.
			const { user, message } = response.data;

			if (!response.data.csrfToken || !user) {
				console.log("Registration failed: ", response.data);
				throw new Error(
					"Registration failed: Invalid server response."
				);
			}

			const csrfResponse = await axios.get(API_ENDPOINTS.AUTH.CSRF_TOKEN);
			const csrfToken = csrfResponse.data.csrfToken;

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

	const loginWithGoogle = () => {
		window.location.href = `${API_BASE_URL}/auth/google`;
	};

	const loginWithFacebook = () => {
		window.location.href = `${API_BASE_URL}/auth/facebook`;
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
			value={{
				user,
				login,
				logout,
				register,
				deleteAccount,
				loginWithGoogle,
				loginWithFacebook,
				isLoading,
				isAdmin,
				isAuthenticated,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
