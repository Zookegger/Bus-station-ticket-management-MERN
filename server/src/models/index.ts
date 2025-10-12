/**
 * Database models initialization and configuration.
 *
 * This module sets up all Sequelize models, defines their relationships,
 * and provides database connection utilities. It serves as the central
 * point for model management and database operations.
 */

import { createTempConnection, sequelize } from "../config/database";
import { Sequelize, Op, QueryTypes } from "sequelize";
import { role, User } from "./users";
import logger from "../utils/logger";
import { RefreshToken } from "./refreshToken";
import { generateDefaultAdminAccount } from "../services/userServices";
import { Vehicle } from "./vehicle";
import { VehicleType } from "./vehicleType";
import { Driver } from "./driver";
import { Location } from "./location";

const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

/**
 * Centralized model registry and database connection.
 *
 * This object contains all initialized models and the Sequelize instance,
 * providing a single import point for database operations across the application.
 */
const db: {
	sequelize: Sequelize;
	user: typeof User;
	driver: typeof Driver;
	location: typeof Location;
	refreshToken: typeof RefreshToken;
	vehicle: typeof Vehicle;
	vehicleType: typeof VehicleType;
} = {
	sequelize,
	user: User,
	driver: Driver,
	location: Location,
	refreshToken: RefreshToken,
	vehicle: Vehicle,
	vehicleType: VehicleType
};

// Initialize models with Sequelize instance
User.initModel(sequelize);
Driver.initModel(sequelize);
Location.initModel(sequelize);
RefreshToken.initModel(sequelize);
Vehicle.initModel(sequelize);
VehicleType.initModel(sequelize);

// Define relationships/associations between models
User.hasMany(RefreshToken, {
	foreignKey: "userId",
	as: "refreshTokens",
	onDelete: "CASCADE",
});

RefreshToken.belongsTo(User, {
	foreignKey: "userId",
	as: "user",
});

VehicleType.hasMany(Vehicle, {
	foreignKey: "vehicleTypeId",
	as: "vehicles",
	onDelete: "SET NULL"
});

Vehicle.belongsTo(VehicleType, {
	foreignKey: "vehicleTypeId",
	as: "vehicleType"
});

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
