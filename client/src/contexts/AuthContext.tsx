import {
	useEffect,
	useState,
	type ReactNode,
} from "react";
import axios from "axios";
import type { User } from "@my-types/auth";
import { AuthContext } from "./AuthContext.context";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// Helper function to refresh the access token
	const refreshAccessToken = async (): Promise<string | null> => {
		const refreshToken = localStorage.getItem("refreshToken");
		if (!refreshToken) return null;

		try {
			const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
				refreshToken,
			});
			const { accessToken, refreshToken: newRefreshToken } = response.data;

			// Store new tokens
			localStorage.setItem("accessToken", accessToken);
			localStorage.setItem("refreshToken", newRefreshToken);
			axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

			return accessToken;
		} catch (error) {
			// Refresh token is invalid or expired
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			delete axios.defaults.headers.common["Authorization"];
			console.error("Something went wrong while refreshing access token: ", error);
            return null;
		}
	};

	useEffect(() => {
		const initAuth = async () => {
			const token = localStorage.getItem("accessToken");

			if (token) {
				axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

				try {
					const res = await axios.get(`${API_BASE_URL}/auth/me`);
					setUser(res.data.user);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} catch (error: any) {
					// If 401, try to refresh the token
					if (error.response?.status === 401) {
						const newToken = await refreshAccessToken();

						if (newToken) {
							// Retry /auth/me with new token
							try {
								const res = await axios.get(`${API_BASE_URL}/auth/me`);
								setUser(res.data.user);
							} catch (retryError) {
								// Even with new token, couldn't get user
								localStorage.removeItem("accessToken");
								localStorage.removeItem("refreshToken");

                                console.error("Something went wrong:", retryError);
							}
						}
					} else {
						// Other errors (network, server)
						localStorage.removeItem("accessToken");
						localStorage.removeItem("refreshToken");
					}
				} finally {
					setIsLoading(false);
				}
			} else {
				setIsLoading(false);
			}
		};

		initAuth();
	}, []);

	const login = (tokens: {
		user: User;
		accessToken: string;
		refreshToken: string;
	}): void => {
		localStorage.setItem("accessToken", tokens.accessToken);
		localStorage.setItem("refreshToken", tokens.refreshToken);
		axios.defaults.headers.common["Authorization"] = `Bearer ${tokens.accessToken}`;
		setUser(tokens.user);
	};

	const logout = (): void => {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		delete axios.defaults.headers.common["Authorization"];
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
};