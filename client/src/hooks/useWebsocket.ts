import { useState, useEffect, useRef, useCallback } from "react";
import {
	io,
	Socket,
	type ManagerOptions,
	type SocketOptions,
} from "socket.io-client";
import { API_ENDPOINTS, WEBSOCKET_CONNECTION_STATES } from "@constants/index";
import type { WebsocketOptions } from "@my-types/websocket";
import callApi from "@utils/apiCaller";
import { useAuth } from "./useAuth";

// Singleton WebSocket instance for performance
let global_socket: Socket | null = null;
let global_connection_state: string = WEBSOCKET_CONNECTION_STATES.DISCONNECTED;
let global_reconnect_attempts: number = 0;
const global_event_handlers = new Map(); // Track all event handlers
let authentication_attempted: boolean = false; // Track if authentication has been attempted

/**
 * Custom WebSocket Hook for Real-Time Features
 *
 * Provides a reusable Socket.IO connection with automatic management, authentication,
 * and event handling. Uses a singleton pattern for shared connections across components.
 *
 * Features:
 * - Singleton connection for performance
 * - Exponential backoff reconnection
 * - JWT authentication via API token
 * - Event handler registration and cleanup
 * - Connection state tracking
 * - Debug logging support
 *
 * @param {WebsocketOptions} options - Configuration options
 *
 * @returns {{
 *   socket: Socket | null;
 *   connectionState: string;
 *   isConnected: boolean;
 *   isAuthenticated: boolean;
 *   errorMessage: string | null;
 *   disconnectSocket: () => void;
 *   reconnectSocket: () => void;
 *   authenticate: () => Promise<boolean>;
 *   emitEvent: (event_name: string, data: any) => boolean;
 * }} Connection utilities and state
 */
const useWebsocket = (options: WebsocketOptions = {}) => {
	const {
		events = {},
		namespace = "",
		auto_connect = true,
		debug = false,
		max_reconnect_attempts = 5,
		reconnect_delay = 1000,
		requireAuth = true,
	} = options;

	const socket_ref = useRef<Socket | null>(null);
	const [connection_state, setConnectionState] = useState<string>(
		global_connection_state
	);
	const [error_message, setErrorMessage] = useState<string | null>(null);
	const component_id = useRef(`component_${Date.now()}_${Math.random()}`);
	const is_mounted = useRef(false);

	const isConnected =
		connection_state === WEBSOCKET_CONNECTION_STATES.CONNECTED ||
		connection_state === WEBSOCKET_CONNECTION_STATES.AUTHENTICATED;
	const isAuthenticated =
		connection_state === WEBSOCKET_CONNECTION_STATES.AUTHENTICATED;

	// Store events in a ref to avoid dependency issues
	const events_ref = useRef(events);
	events_ref.current = events;

	const debug_ref = useRef(debug);
	debug_ref.current = debug;

	// Access auth at top level of the hook to comply with Rules of Hooks.
	// Use `userAuth` to avoid colliding with this hook's `isAuthenticated` socket state.
	// Note: useWebsocket is used inside SocketProvider which is wrapped by AuthProvider.
	const userAuth = useAuth();

	// Debug logging helper
	const debugLog = useCallback(
		(message: string, ...args: unknown[]) => {
			if (debug_ref.current) {
				console.log(
					`🔌 [WebSocket-${component_id.current.slice(
						-6
					)}] ${message}`,
					...args
				);
			}
		},
		[debug_ref]
	);

	// Update global state and sync with all components
	const updateConnectionStatus = useCallback(
		(new_state: string) => {
			if (!is_mounted.current) return;

			global_connection_state = new_state;
			setConnectionState(new_state);
			debugLog(`Global state updated`, new_state);
		},
		[debugLog]
	);

	// Set error with auto-clearing
	const setError = useCallback(
		(message: string) => {
			if (!is_mounted.current) return;

			setErrorMessage(message);
			debugLog("Error:", message);

			setTimeout(() => {
				if (is_mounted.current) setErrorMessage(null);
			}, 10000);
		},
		[debugLog]
	);

	// Authentication function
	const getAuthToken = useCallback(async () => {
		if (!userAuth.isAuthenticated || !userAuth.user) return null;

		try {
			const data = await callApi({
				method: "POST",
				url: API_ENDPOINTS.USERS.WEBSOCKET_AUTH(userAuth.user.id),
			});

			if (data && data.websocket_token) {
				return data.websocket_token;
			}

			return null;
		} catch (error) {
			console.error("Failed to get WebSocket token:", error);
			return null;
		}
	}, [userAuth.isAuthenticated, userAuth.user]);

	// Authentication function
	const authenticateSocket = useCallback(async () => {
		try {
			// If already authenticated, don't try again
			if (
				global_connection_state ===
				WEBSOCKET_CONNECTION_STATES.AUTHENTICATED
			) {
				debugLog(`Already authenticated, skipping authentication`);
				return true;
			}

			const token = await getAuthToken();
			if (!token) {
				if (requireAuth) {
					debugLog(`Cannot authenticate: missing token.`);
				}
				return false;
			}

			if (!socket_ref.current) {
				debugLog("No socket to authenticate");
				return false;
			}

			// Check if we need to update token and reconnect
			const currentSocketToken = (socket_ref.current.auth as any)?.token;
			if (currentSocketToken !== token) {
				debugLog("Updating socket auth token and reconnecting...");
				socket_ref.current.auth = { token };
				
				if (socket_ref.current.connected) {
					socket_ref.current.disconnect().connect();
				} else {
					socket_ref.current.connect();
				}
				// The reconnection will trigger 'connect' event which calls authenticateSocket again
				return true;
			}

			// If we are here, token is set, just waiting for response
			if (authentication_attempted) {
				debugLog("Authentication already in progress...");
				return true;
			}

			debugLog(`Waiting for authentication response...`);
			authentication_attempted = true;

			return new Promise((resolve) => {
				const timeout = setTimeout(() => {
					debugLog("Authentication timeout");
					authentication_attempted = false;
					resolve(false);
				}, 5000);

				const cleanup = () => {
					clearTimeout(timeout);
					if (socket_ref.current) {
						socket_ref.current.off(
							`authorization_success`,
							successHandler
						);
						socket_ref.current.off(
							`authorization_error`,
							errorHandler
						);
					}
				};

				const successHandler = (data: any) => {
					cleanup();
					updateConnectionStatus(
						WEBSOCKET_CONNECTION_STATES.AUTHENTICATED
					);
					debugLog("Authentication successful for user:", data.user);
					resolve(true);
				};

				const errorHandler = (data: any) => {
					cleanup();
					updateConnectionStatus(WEBSOCKET_CONNECTION_STATES.ERROR);
					setError("Authentication failed");
					debugLog("Authentication failed:", data.message);
					authentication_attempted = false;
					resolve(false);
				};

				if (socket_ref.current) {
					// Listen for the event (it might have already fired if we are late, 
					// but usually it fires after connect)
					socket_ref.current.once(`authorization_success`, successHandler);
					socket_ref.current.once(`authorization_error`, errorHandler);
				}
			});
		} catch (err: any) {
			debugLog("Authentication Error:", err);
			setError(err.message);
			authentication_attempted = false;
			return false;
		}
	}, [debugLog, updateConnectionStatus, getAuthToken, requireAuth]);

	// Effect to handle authentication when user logs in or auth state loads
	useEffect(() => {
		if (
			userAuth.isAuthenticated &&
			socket_ref.current?.connected &&
			connection_state !== WEBSOCKET_CONNECTION_STATES.AUTHENTICATED
		) {
			// Only try if we haven't authenticated yet
			authenticateSocket();
		}
	}, [userAuth.isAuthenticated, connection_state, authenticateSocket]);

	// Reconnect with exponential backoff
	const attemptReconnection = useCallback(() => {
		if (global_reconnect_attempts >= max_reconnect_attempts) {
			debugLog("Max reconnection attempts reached");
			return;
		}

		global_reconnect_attempts++;

		const delay = Math.min(
			reconnect_delay * Math.pow(2, global_reconnect_attempts - 1),
			30000 // Max 30 seconds delay
		);

		debugLog(
			`Attempting reconnection ${global_reconnect_attempts}/${max_reconnect_attempts} in ${delay}ms`
		);

		setTimeout(() => {
			if (socket_ref.current && !socket_ref.current.connected) {
				socket_ref.current.connect();
			}
		}, delay);
	}, [debugLog, max_reconnect_attempts, reconnect_delay]);

	// Register even handlers
	const registerHandlers = useCallback((socket: Socket): Map<any, any> => {
		if (!socket) return new Map();

		// Track this component's handler
		const component_handlers = new Map();

		Object.entries(events_ref.current).forEach(([event_name, handler]) => {
			if (typeof handler === "function") {
				// Only add handler if not already registered
				if (!global_event_handlers.has(event_name)) {
					socket.on(event_name, handler);
					global_event_handlers.set(event_name, new Set());
				}

				// Track this component's handler
				if (!global_event_handlers.get(event_name).has(handler)) {
					global_event_handlers.get(event_name).add(handler);
					component_handlers.set(event_name, handler);
				}
			}
		});

		return component_handlers;
	}, []);

	const unregisterHandlers = useCallback(
		(socket: Socket, component_handlers: Map<any, any>) => {
			if (!socket || !component_handlers) return;

			component_handlers.forEach((handler, event_name) => {
				// Remove from global tracking
				const handlers = global_event_handlers.get(event_name);
				if (handlers) {
					handlers.delete(handler);

					// Remove from socket if no more handlers
					if (handlers.size == 0) {
						socket.off(event_name);
						global_event_handlers.delete(event_name);
					}
				}
			});
		},
		[]
	);

	// Connection management
	useEffect(() => {
		is_mounted.current = true;
		let component_handlers = new Map();

		const initializeWebsocket = async () => {
			if (!auto_connect) return;

			// Use existing connection if available
			if (global_socket && (global_socket as Socket).connected) {
				debugLog("Using existing WebSocket connection");
				socket_ref.current = global_socket;
				component_handlers = registerHandlers(global_socket);
				return;
			}

			debugLog("Initializing new WebSocket connection...");

			try {
				const websocket_token = await getAuthToken();
				const socket_url =
					import.meta.env.REACT_APP_WS_URL || "http://localhost:5000";

				const socket_options: Partial<SocketOptions | ManagerOptions> =
					{
						auth: { token: websocket_token || null },
						ackTimeout: 20000,
						retries: 5,
						transports: ["websocket", "polling"],
						timeout: 20000,
						forceNew: false,
						upgrade: true,
						rememberUpgrade: true,
					};

				const new_socket = io(socket_url + namespace, socket_options);

				// Set up event listeners
				new_socket.on("connect", () => {
					debugLog("Socket connected");
					updateConnectionStatus(
						WEBSOCKET_CONNECTION_STATES.CONNECTED
					);
					authenticateSocket(); // Attempt authentication on connect
				});

				new_socket.on("disconnect", (reason) => {
					debugLog("Socket disconnected:", reason);
					updateConnectionStatus(
						WEBSOCKET_CONNECTION_STATES.DISCONNECTED
					);
					if (reason === "io server disconnect") {
						// Server disconnected, try reconnect
						attemptReconnection();
					}
				});

				new_socket.on("connect_error", (error) => {
					debugLog("Connection error:", error);
					setError("Connection failed");
					updateConnectionStatus(WEBSOCKET_CONNECTION_STATES.ERROR);
					attemptReconnection();
				});

				// Assign to global and local refs
				global_socket = new_socket;
				socket_ref.current = new_socket;
				component_handlers = registerHandlers(new_socket);
			} catch (err) {
				debugLog("Initialization error:", err);
				setError("Failed to initialize WebSocket connection");
			}
		};

		initializeWebsocket();

		// Cleanup on unmount
		return () => {
			is_mounted.current = false;
			debugLog("Cleaning up WebSocket handlers");

			if (socket_ref.current) {
				unregisterHandlers(socket_ref.current, component_handlers);

				if (global_event_handlers.size === 0 && global_socket) {
					debugLog("No more active handlers - disconnecting socket");
					global_socket.disconnect();
					global_socket = null;
				}
			}
		};
	}, [
		auto_connect,
		namespace,
		debugLog,
		updateConnectionStatus,
		attemptReconnection,
		setError,
		registerHandlers,
		unregisterHandlers,
		authenticateSocket,
	]);

	const emitEvent = useCallback(
		(event_name: string, data: any) => {
			if (socket_ref.current && socket_ref.current.connected) {
				socket_ref.current.emit(event_name, data);
				return true;
			}

			debugLog(`Cannot emit '${event_name}' - WebSocket not connected`);
			return false;
		},
		[debugLog]
	);

	const disconnectSocket = useCallback(() => {
		if (socket_ref.current) {
			socket_ref.current.disconnect();
			updateConnectionStatus(WEBSOCKET_CONNECTION_STATES.DISCONNECTED);
		}
	}, [updateConnectionStatus]);

	const reconnectSocket = useCallback(() => {
		if (socket_ref.current) {
			socket_ref.current.connect();
		}
	}, []);

	// Return hook interface
	return {
		socket: socket_ref.current,
		connectionState: connection_state,
		isConnected,
		isAuthenticated,
		errorMessage: error_message,
		disconnectSocket,
		reconnectSocket,
		authenticate: authenticateSocket,
		emitEvent,
	};
};

export default useWebsocket;
