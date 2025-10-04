import chalk from "chalk";
import { NextFunction, Request, Response } from "express";

type LogLevel = "error" | "warn" | "debug" | "info" | "log";

// Create a core logging function
const createLog = (level: LogLevel) => {
	return (...args: unknown[]): void => {
		const timestamp = new Date().toISOString();

		// Define log type formatting with colors
		const logType = (level: LogLevel) => {
			switch (level) {
				case "error":
					return chalk.red.bold(`[${level.toUpperCase()}]`);
				case "warn":
					return chalk.yellow.bold(`[${level.toUpperCase()}]`);
				case "debug":
					return chalk.greenBright.bold(`[${level.toUpperCase()}]`);
				case "info":
					return chalk.blue.bold(`[${level.toUpperCase()}]`);
				default:
					return chalk.blue.bold(`[${level.toUpperCase()}]`);
			}
		};

		const message = `${logType(level)} ${timestamp} - ${args.join(" ")}`;

		// Output with appropriate console method and color
		switch (level) {
			case "error":
				if (args[0] instanceof Error) {
					const error = args[0] as Error;
					const errorMessage = `${logType(level)} ${timestamp} - ${
						error.message
					}`;
					console.error(chalk.red(errorMessage));
					if (error.stack) {
						console.error(
							chalk.red(`Stack trace:\n${error.stack}`)
						);
					}
				} else if (
					typeof args[0] === "object" &&
					args[0] !== null &&
					"message" in args[0]
				) {
					// Handle objects with a 'message' property (e.g., Axios errors, custom error objects)
					const errorObj = args[0] as {
						message: string;
						[key: string]: unknown;
					};
					const errorMessage = `${logType(level)} ${timestamp} - ${
						errorObj.message
					}`;
					console.error(chalk.red(errorMessage));
					// Optionally log the full object for more context (remove if too verbose)
					console.error(
						chalk.red(
							`Details:\n${JSON.stringify(errorObj, null, 2)}`
						)
					);
				} else {
					console.error(chalk.red(message));
				}

				break;
			case "warn":
				console.warn(chalk.yellow(message));
				break;
			case "debug":
				if (process.env.NODE_ENV === "development") {
					if (args[0] instanceof Error) {
						const error = args[0] as Error;
						const errorMessage = `${logType(
							level
						)} ${timestamp} - ${error.message}`;
						console.error(chalk.red(errorMessage));
						if (error.stack) {
							console.error(
								chalk.red(`Stack trace:\n${error.stack}`)
							);
						}
					} else if (
						typeof args[0] === "object" &&
						args[0] !== null &&
						"message" in args[0]
					) {
						// Handle objects with a 'message' property (e.g., Axios errors, custom error objects)
						const errorObj = args[0] as {
							message: string;
							[key: string]: unknown;
						};
						const errorMessage = `${logType(
							level
						)} ${timestamp} - ${errorObj.message}`;
						console.error(chalk.red(errorMessage));
						// Optionally log the full object for more context (remove if too verbose)
						console.error(
							chalk.red(
								`Details:\n${JSON.stringify(errorObj, null, 2)}`
							)
						);
					} else {
						console.debug(chalk.greenBright(message));
					}
				}
				break;
			default:
				console.log(chalk.blue(message));
				break;
		}
	};
};

// HTTP-specific middleware
const httpLogger = () => {
	return (req: Request, res: Response, next: NextFunction) => {
		const start = Date.now();

		res.on("finish", () => {
			const duration = Date.now() - start;
			const level =
				res.statusCode >= 500
					? "error"
					: res.statusCode >= 400
					? "warn"
					: "info";

			const message = `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;

			// Use the logger with the appropriate level
			logger[level](message);
		});

		next();
	};
};

// Logger object with methods for each log level
const logger = {
	info: createLog("info"),
	warn: createLog("warn"),
	error: createLog("error"),
	debug: createLog("debug"),
	http: httpLogger,
};

export default logger;
