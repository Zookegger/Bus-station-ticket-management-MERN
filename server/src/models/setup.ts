import { createTempConnection, sequelize } from "@config/database";
import { QueryTypes } from "sequelize";
import logger from "@utils/logger";

const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

/**
 * Creates the database if it doesn't exist.
 *
 * This function establishes a temporary connection to the MySQL server
 * (without specifying a database) and creates the application database
 * if it doesn't already exist.
 *
 * @async
 * @returns {Promise<void>} Resolves when database creation is complete
 * @throws {Error} If database creation fails
 */
const createDatabase = async () => {
	const temp_connection = createTempConnection();

	try {
		await temp_connection.authenticate();

		const database = await temp_connection.query("SHOW DATABASES LIKE ?", {
			replacements: [process.env.DB_NAME],
			type: QueryTypes.SELECT,
		});

		if (database.length === 0) {
			await temp_connection.query(
				`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``,
				{ type: QueryTypes.RAW }
			);
			logger.info(`Database ${process.env.DB_NAME} created successfully`);
		} else {
			logger.debug(`Database ${process.env.DB_NAME} already exist`);
		}
	} catch (err) {
		logger.error(err);
		throw err;
	} finally {
		await temp_connection.close();
	}
};

/**
 * Establishes connection to the database and synchronizes models.
 *
 * This function handles the complete database setup process:
 * - Creates the database if needed
 * - Authenticates the connection
 * - Synchronizes all models with the database schema
 * - Generates default admin account
 *
 * @async
 * @returns {Promise<void>} Resolves when database connection and sync are complete
 * @throws {Error} If connection or synchronization fails
 */
export const connectToDatabase = async (): Promise<void> => {
	try {
		await createDatabase();
		logger.info("Connecting to Database Server...");
		await sequelize.authenticate();
		logger.info("Database connected");
		logger.info("Synchronizing models...");

		await sequelize.sync({
			alter: IS_DEVELOPMENT ? true : false,
			force: IS_DEVELOPMENT ? true : false,
		});
		
		logger.info("Models synchronized to Database");
	} catch (err) {
		logger.error(err);
		throw err;
	}
};