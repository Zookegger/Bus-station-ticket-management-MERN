import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Define Redis connection settings from environment variables (with defaults)
// - REDIS_HOST: The hostname or IP of the Redis server (default: localhost)
// - REDIS_PORT: The port number (default: 6379, standard Redis port)
// - REDIS_PASSWORD: Optional password for Redis authentication
const REDIS_HOST: string = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT: number = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD: string = process.env.REDIS_PASSWORD ?? "";

// Create a new Redis client instance with the configuration
// - host and port: Connection details
// - password: For secured Redis instances
// - maxRetriesPerRequest: Set to null to allow unlimited retries (useful for BullMQ queues)
const redis = new Redis({
	host: REDIS_HOST,
	port: REDIS_PORT,
	password: REDIS_PASSWORD,
	maxRetriesPerRequest: null, // Prevents BullMQ from failing on retries
});

// Event listener for successful Redis connection
// Logs a message when connected (useful for debugging in development)
redis.on("connect", () => {
	console.log("Redis connected successfully");
});

// Event listener for Redis connection errors
// Logs errors to help troubleshoot connection issues
redis.on("error", (err) => {
	console.error("Redis connection error:", err);
});

export default redis;