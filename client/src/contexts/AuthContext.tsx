import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import type { User } from "@my-types/auth";
import { AuthContext } from "./AuthContext.context";
import { ROUTES } from "@constants";

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
				const methodRequiringCsrf = ["POST", "PUT", "PATCH", "DELETE"];
				if (
					csrfToken &&
					methodRequiringCsrf.includes(
						config.method?.toLowerCase() ?? ""
					)
				) {
					config.headers["X-CSRF-Token"] = csrfToken;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		const responseInterceptor = axios.interceptors.response.use(
			(response) => response, // Pass through successful responses
			async (err) => {
				const originalRequest = err.config;
				// Check if the error is 401, the request was not for refreshing, and we haven't retried yet
                if (err.response?.status === 401 && !originalRequest._retry) {
					originalRequest._retry = true; // Mark that we've retried this request
					try {
						await axios.post("/auth/refresh");
						return axios(originalRequest);
					} catch (refreshErr) {
						setUser(null);
						setCsrfToken(null);
						console.error("Session expired. Please log in again.");
						window.location.href = ROUTES.LOGIN;
						return Promise.reject(refreshErr);
					}
				}
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
				const response = await axios.get("/auth/me");
				if (response)

				setUser(response.data.user);
				const csrfResponse = await axios.get("/auth/csrf-token");
				setCsrfToken(csrfResponse.data.csrfToken);
			} catch (err) {
				// A 401 error here means the user is not logged in.
                // No need to do anything, user state is already null.
                console.log("No active session found.");
			} finally {
				setIsLoading(false);
			}
		}

		verifyUserSession();
	}, [])

	const login = (data: {user: User, csrfToken: string}): void => {
		setUser(data.user);
		setCsrfToken(data.csrfToken);
	};

	const logout = async (): Promise<void> => {
		try {
			await axios.post("/auth/logout");
		} catch (err) {
			console.error("Logout failed:", err);
		} finally {
			setUser(null);
			setCsrfToken(null);
		}
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
};
