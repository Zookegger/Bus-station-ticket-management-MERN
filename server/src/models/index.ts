import { createTempConnection, sequelize } from "../config/database";
import { Sequelize, Op, QueryTypes } from "sequelize";
import { role, User } from "./users";
import logger from "../utils/logger";
import { RefreshToken } from "./refreshToken";
import { generateDefaultAdminAccount } from "../services/userServices";

const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// Definitions
/**
 * Centralized model registry:
 * - Initializes each model with the Sequelize connection
 * - Defines relationships/associations
 * - Exports a "db" object for easy import across services/controllers
 */
const db: {
	sequelize: Sequelize;
	user: typeof User;
	refreshToken: typeof RefreshToken;
} = {
	sequelize,
	user: User,
	refreshToken: RefreshToken,
};

// Initialize models
User.initializeModel(sequelize);
RefreshToken.initializeModel(sequelize);

// Define relationships/associations
User.hasMany(RefreshToken, {
	foreignKey: "userId",
	as: "refreshTokens",
	onDelete: "CASCADE",
});

RefreshToken.belongsTo(User, {
	foreignKey: "userId",
	as: "user",
});

// Functions

export const createDatabase = async () => {
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

export const connectToDatabase = async (): Promise<void> => {
	try {
		await createDatabase();
		logger.info("Connecting to Database Server...");
		await sequelize.authenticate();
		logger.info("Database connected");
		logger.info("Synchronizing models...");
		await sequelize.sync({
			alter: true,
			force: IS_DEVELOPMENT ? true : false,
		});
		logger.info("Models synchronized to Database");

		generateDefaultAdminAccount();
	} catch (err) {
		logger.error(err);
	}
};

export default db;
