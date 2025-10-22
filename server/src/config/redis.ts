/**
 * Redis client configuration and connection setup.
 *
 * This module configures and initializes the Redis client for caching,
 * session storage, and background job queues. It handles connection
 * management, error handling, and environment-based configuration.
 */

import { Redis } from "ioredis";
import logger from "@utils/logger";

// Define Redis connection settings from environment variables (with defaults)
// - REDIS_HOST: The hostname or IP of the Redis server (default: localhost)
// - REDIS_PORT: The port number (default: 6379, standard Redis port)
// - REDIS_PASSWORD: Optional password for Redis authentication
const REDIS_HOST: string = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT: number = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD: string = process.env.REDIS_PASSWORD ?? "";

/**
 * Redis client instance.
 *
 * Configured Redis client for the application, used for:
 * - Email verification token storage
 * - BullMQ job queues
 * - Session management and caching
 *
 * Connection settings are loaded from environment variables with sensible defaults.
 */
const redis = new Redis({
	host: REDIS_HOST,
	port: REDIS_PORT,
	password: REDIS_PASSWORD,
	maxRetriesPerRequest: null, // Prevents BullMQ from failing on retries
});

// Event listener for successful Redis connection
// Logs a message when connected (useful for debugging in development)
redis.on("connect", () => {
	logger.info("Redis connected successfully");
});

// Event listener for Redis connection errors
// Logs errors to help troubleshoot connection issues
redis.on("error", (err) => {
	logger.error("Redis connection failed - application cannot function without Redis:", err);
	throw err;
});

export default redis;