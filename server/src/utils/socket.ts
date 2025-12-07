import jwt from "jsonwebtoken";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import {
	REALTIME_NAMESPACE,
	IN_EVENTS,
	ROOMS,
	RT_EVENTS,
} from "@constants/realtime";
import logger from "@utils/logger";
import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";

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

	// Redis scaling
	const pub: Redis = new Redis(process.env.REDIS_URL!); // pubClient — a Redis client that will be used to publish messages
	const sub: Redis = new Redis(process.env.REDIS_URL!); // subClient — a Redis client that will be used to receive messages (put in subscribed state)
	io.adapter(createAdapter(pub, sub));

	const namespace = io.of(REALTIME_NAMESPACE);

	// Auth middleware for namespace
	namespace.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth?.token;
			if (token) {
				const decoded: any = jwt.verify(
					token,
					process.env.JWT_SECRET || "dev_secret"
				);
				(socket.data as any).userId = decoded.id;
			}
			next();
		} catch (err) {
			next(new Error("Invalid token"));
		}
	});

	namespace.on("connection", (socket) => {
		const user_id = (socket.data as any).userId;

		if (user_id) {
			logger.debug(`Realtime connected ${socket.id} (user ${user_id})`);
			// Auto join personal room
			socket.join(ROOMS.user(user_id));
			socket.emit(RT_EVENTS.AUTH_SUCCESS, { user: user_id });
		} else {
			logger.debug(`Realtime connected ${socket.id} (Guest)`);
		}

		socket.on(IN_EVENTS.ROOM_JOIN, (payload: { room: string }) => {
			if (!payload?.room) return;
			socket.join(payload.room);
		});

		socket.on(IN_EVENTS.ROOM_LEAVE, (payload: { room: string }) => {
			if (!payload?.room) return;
			socket.leave(payload.room);
		});

		socket.on("disconnect", (reason) =>
			logger.debug(`Realtime disconnect ${socket.id} reason=${reason}`)
		);
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
