import dotenv from "dotenv";
import { app } from "./app";
import { Server } from "socket.io";
import { sequelize as Database } from "./config/database";
import http from "http";
import logger from "./utils/logger";
import { connectToDatabase } from "./models";
// import routes from './routes';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
	try {
		const server = http.createServer(app);
		const io = new Server(server, {
			cors: {
				origin: "*",
				methods: ["GET", "POST", "DELETE", "PUT"],
			},
			connectionStateRecovery: {
				maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
			},
		});

		io.on("connection", (socket) => {
			logger.debug("A user connected:", socket.id);

			socket.on("disconnect", () => {
				logger.debug("User disconnected:", socket.id);
			});
		});

		server.listen(PORT, () => logger.info(`Server listening on ${PORT}`));
	} catch (err) {
		logger.error("Failed to start server:", err);
		process.exit(1);
	}
};

(async () => {
	await connectToDatabase();
	await startServer();
})();
