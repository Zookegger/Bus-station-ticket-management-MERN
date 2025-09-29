import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "";
const DB_NAME = process.env.DB_NAME || "bus_station_db";

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
	host: DB_HOST,
	port: DB_PORT,
	dialect: "mysql",

	logging: process.env.NODE_ENV === "development" ? console.log : false,

	pool: {
		max: 10, // Maximum number of connections to create
		min: 0, // Minimum number of connections to keep open
		acquire: 30000, // Maximum time (in ms) to get a connection
		idle: 10000, // Maximum time (in ms) a connection can be unused
	},

	define: {
		timestamps: true, // Automatically add created_at and updated_at fields
		engine: "InnoDB",
		charset: "utf8mb4",
		collate: "utf8mb4_unicode_ci",
	},
});

export const createTempConnection = (): Sequelize => {
    return new Sequelize(
        // @ts-ignore
        null,
        DB_USER,
        DB_PASS, {
            host: DB_HOST,
            port: DB_PORT,
            dialect: 'mysql',
            logging: false
        }
    )
} 