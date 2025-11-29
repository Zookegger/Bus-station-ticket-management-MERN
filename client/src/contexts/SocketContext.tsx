import React, { createContext, useContext, useMemo } from "react";
import useWebsocket from "@hooks/useWebsocket";
import { Socket } from "socket.io-client";

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
	joinRoom: (room: string) => void;
	leaveRoom: (room: string) => void;
}

export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const ws = useWebsocket({
		namespace: "/realtime",
		auto_connect: true,
		debug: true,
		events: {
			// Global handlers can go here, but we'll specific ones in dedicated contexts
			connect: () => console.log("Socket connected globally"),
		},
	});

	const value = useMemo(
		() => ({
			socket: ws.socket, // [Expose the socket instance]
			isConnected: ws.isConnected,
			joinRoom: (room: string) => ws.emitEvent("room:join", { room }),
			leaveRoom: (room: string) => ws.emitEvent("room:leave", { room }),
		}),
		[ws.socket, ws.isConnected, ws.emitEvent]
	);

	return (
		<SocketContext.Provider value={value}>
			{children}
		</SocketContext.Provider>
	);
};

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (!context)
		throw new Error("useSocket must be used within SocketProvider");
	return context;
};
