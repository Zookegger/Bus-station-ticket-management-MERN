export interface AppConfig {
	readonly name: string;
	readonly version: string;
	readonly description: string;
	readonly author: string;
	readonly apiBaseUrl: string;
}

export interface ApiEndpoints {
	readonly AUTH: {
		readonly LOGIN: string;
		readonly REGISTER: string;
		readonly LOGOUT: string;
		readonly REFRESH: string;
	};
	readonly USERS: {
		readonly BASE: string;
		readonly PROFILE: string;
	};
}

export interface StorageKeys {
	readonly TOKEN: string;
	readonly USER: string;
	readonly THEME: string;
	readonly LANGUAGE: string;
}

export interface Pagination {
	readonly DEFAULT_PAGE: number;
	readonly DEFAULT_LIMIT: number;
	readonly LIMIT_OPTIONS: readonly number[];
}

export interface ValidationRules {
	readonly EMAIL_REGEX: RegExp;
	readonly PASSWORD_MIN_LENGTH: number;
	readonly NAME_MIN_LENGTH: number;
	readonly NAME_MAX_LENGTH: number;
}
