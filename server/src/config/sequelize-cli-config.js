module.exports = {
	development: {
		username: process.env.DB_USER ?? "root",
		password: process.env.DB_PASS ?? "123456789",
		database: process.env.DB_NAME ?? "bus_station_db",
		host: process.env.DB_HOST ?? "127.0.0.1",
		dialect: process.env.DB_DIALECT ?? "mysql",
	},
	test: {
		username: process.env.DB_USER ?? "root",
		password: process.env.DB_PASS ?? "123456789",
		database: process.env.DB_TEST ?? "bus_station_db_test",
		host: process.env.DB_HOST ?? "127.0.0.1",
		dialect: process.env.DB_DIALECT ?? "mysql",
	},
	production: {
		username: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		dialect: process.env.DB_DIALECT ?? "mysql",
	},
};
