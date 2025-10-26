import { Setting } from "@models/setting";
import logger from "@utils/logger";
import * as path from "path";
import * as fs from "fs";

const NODE_ENV = process.env.NODE_ENV || "development";

interface ConfigFileEntry {
	value: any;
	description?: string;
}

class ConfigService {
	private settingCache: Map<string, string> = new Map();
	private isInitialized: boolean = false;

	/**
	 * Loads all settings from the database into the in-memory cache.
	 * If the database is empty, seeds it with defaults from app.config.json.
	 * This should be called once on application startup.
	 */
	public async initialize(): Promise<void> {
		try {
			logger.info("Loading configuration settings...");

			// First, try to load defaults from the config file
			await this.seedDefaultsFromFile();

			const settings = await Setting.findAll();
			settings.forEach((setting) => {
				this.settingCache.set(setting.key, setting.value);
			});
			this.isInitialized = true;
			logger.info("Configuration settings loaded into cache");
		} catch (err) {
			logger.error("Failed to initialize config settings: ", err);
			// if critical settings cannot be loaded.
			process.exit(1);
		}
	}

	/**
	 * Seeds default settings from the app.config.json file into the database.
	 *
	 * Reads the configuration file and creates database entries for any missing settings.
	 * This ensures the database has all necessary default values on first run.
	 */
	private async seedDefaultsFromFile(): Promise<void> {
		const configPath =
			NODE_ENV === "development"
				? path.join(process.cwd(), "src/config/app.config.json")
				: path.join(process.cwd(), "dist/config/app.config.json");

		if (!fs.existsSync(configPath)) {
			logger.warn("app.config.json not found. Skipping default seeding.");
			return;
		}

		// Dynamically import Setting model to avoid circular dependency
		const { Setting } = await import("@models/setting");

		const configData: Record<string, ConfigFileEntry> = JSON.parse(
			fs.readFileSync(configPath, "utf-8")
		);

		for (const [key, entry] of Object.entries(configData)) {
			const existing = await Setting.findByPk(key);
			if (!existing) {
				await Setting.create({
					key,
					value: JSON.stringify(entry.value),
					description: entry.description ?? "",
				});
				logger.debug(`Seeded default setting: ${key}`);
			}
		}
	}

	/**
	 * Retrieves a setting value from the cache.
	 *
	 * @param key - The key of the setting to retrieve.
	 * @param defaultValue - A default value to return if the key is not found.
	 * @returns The setting value parsed to its original type, or the default value.
	 */
	public get<T>(key: string, defaultValue: T): T {
		if (!this.isInitialized) {
			logger.warn(`ConfigService accessed before initialization. ${key}`);
			return defaultValue;
		}

		const value = this.settingCache.get(key);
		if (value === undefined) {
			return defaultValue;
		}

		// Attempt to parse the value to its original type (e.g., number, boolean)
		try {
			return JSON.parse(value) as T;
		} catch {
			// If it's not valid JSON, return it as a string (or as T if it fits)
			return value as unknown as T;
		}
	}

	/**
	 * Updates a setting in the database and refreshes the cache.
	 *
	 * @param key - The key of the setting to update.
	 * @param value - The new value for the setting.
	 * @returns Promise resolving to the updated or created setting record.
	 */
	public async set(key: string, value: any): Promise<Setting> {
		const stringValue = JSON.stringify(value);

		// Find the setting or create it if it doesn't exist
		const [setting] = await Setting.upsert({ key, value: stringValue });

		// Update the cache immediately
		this.settingCache.set(key, stringValue);
		logger.info(`Setting '${key}' updated to '${stringValue}'`);

		return setting;
	}

	/**
	 * Retrieves all settings as a plain object.
	 *
	 * @returns Object containing all cached settings with their keys and values.
	 */
	public getAll() {
		return Object.fromEntries(this.settingCache);
	}
}

// Export a singleton instance so the cache is shared across the application
export const configService = new ConfigService();
