require("dotenv").config();

module.exports = {
	development: {
		username: String(process.env.DB_USER) || "root",
		password: String(process.env.DB_PASS) || 123456789,
		database: String(process.env.DB_NAME) || "bus_station_db",
		host: String(process.env.DB_HOST) || "127.0.0.1",
		dialect: String(process.env.DB_DIALECT) || "mysql",
	},
	test: {
		username: String(process.env.DB_USER) || "root",
		password: String(process.env.DB_PASS) || 123456789,
		database: String(process.env.DB_TEST) || "bus_station_db_test",
		host: String(process.env.DB_HOST) || "127.0.0.1",
		dialect: String(process.env.DB_DIALECT) || "mysql",
	},
	production: {
		username: String(process.env.DB_USER),
		password: String(process.env.DB_PASS),
		database: String(process.env.DB_NAME),
		host: String(process.env.DB_HOST),
		dialect: String(process.env.DB_DIALECT) || "mysql",
	},
};
