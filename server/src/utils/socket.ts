import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import logger from "@utils/logger";

let io: SocketServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketServer => {
	if (io) return io;

	// Initialize Socket.IO server with CORS settings
	io = new SocketServer(httpServer, {
		cors: {
			origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
			methods: ["GET", "POST"],
			credentials: true,
		},
		connectionStateRecovery: {
			maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
		},
	});

	// Handle Socket.IO connections
	io.on("connection", (socket) => {
		logger.debug("A user connected:", socket.id);

		socket.on("join", (userId: string) => {
			socket.join(userId);
			logger.debug(`Socket ${socket.id} joined room ${userId}`);
		});

		socket.on("disconnect", () => {
			logger.debug("User disconnected:", socket.id);
		});
	});

	return io;
};

export const getIO = (): SocketServer => {
	if (!io) {
		throw new Error(
			"Socket.io not initialized! Ensure initSocket() is called in server.ts"
		);
	}

	return io;
};

export const closeSocket = async (): Promise<void> => {
	if (io) {
		await new Promise<void>((resolve, reject) => {
			io?.close((err) => {
				if (err) reject(err);
				else resolve();
			});
		});

		logger.info("Socket.IO connection closed");
		io = null;
	}
};
