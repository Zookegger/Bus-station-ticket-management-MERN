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
		readonly FORGOT_PASSWORD: string;
		readonly VERIFY_EMAIL: string;
		readonly RESET_PASSWORD: string;
		readonly ME: string;
		readonly CSRF_TOKEN: string;
	};
	readonly USERS: {
		readonly BASE: string;
		readonly PROFILE: string;
		readonly UPDATE_PROFILE: string;
	};
	readonly VEHICLE: {
		readonly BASE: string;
		readonly SEARCH: string;
		readonly BY_ID: string;
	};
	readonly VEHICLE_TYPE: {
		readonly BASE: string;
		readonly SEARCH: string;
		readonly BY_ID: string;
	};
	readonly TRIP: {
		readonly BASE: string;
		readonly SEARCH: string;
		readonly BY_ID: string;
	};
	readonly DRIVER: {
		readonly BASE: string;
		readonly SEARCH: string;
		readonly BY_ID: string;
	};
	readonly LOCATION: {
		readonly BASE: string;
		readonly SEARCH: string;
		readonly BY_ID: string;
		readonly BY_COORDINATES: string;
	};
	readonly ROUTE: {
		readonly BASE: string;
		readonly SEARCH: string;
		readonly BY_ID: string;
	};
	readonly SEAT: {
		readonly BASE: string;
		readonly BY_ID: string;
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
