import { createTempConnection, sequelize } from "../config/database";
import { Sequelize, Op, QueryTypes } from "sequelize";
import logger from "../utils/logger";

export const db: {
	sequelize: Sequelize;
} = {
	sequelize,
};

export const createDatabase = async () => {
	const temp_connection = createTempConnection();

	try {
		await temp_connection.authenticate();
		logger.info("Connected to Database server");

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
        await sequelize.sync({ alter: true });
        logger.info("Models synchronized to Database");
    } catch (err) {
        logger.error(err);
    }
}