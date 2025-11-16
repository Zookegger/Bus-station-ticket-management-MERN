export interface AppConfig {
	readonly name: string;
	readonly version: string;
	readonly description: string;
	readonly author: string;
	readonly apiBaseUrl: string;
	readonly serverBaseUrl: string;
}

export interface ApiEndpoints {
	readonly UPLOADS: {
		readonly AVATARS: (url: string) => string;
		readonly COUPONS: (url: string) => string;
	}
	readonly AUTH: {
		readonly LOGIN: string;
		readonly REGISTER: string;
		readonly LOGOUT: string;
		readonly REFRESH: string;
		readonly FORGOT_PASSWORD: string;
		readonly VERIFY_EMAIL: string;
		readonly RESET_PASSWORD: string;
		readonly RESET_PASSWORD_WITH_TOKEN: string;
		readonly CHANGE_PASSWORD: string;
		readonly CHANGE_PASSWORD_WITH_ID: string;
		readonly ME: string;
		readonly CSRF_TOKEN: string;
		readonly CSRF_VERIFY: string;
	};
	readonly USERS: {
		readonly BASE: string;
		readonly PROFILE: (id: string) => string;
		readonly VERIFY_EMAIL: (id: string) => string;
		readonly CHANGE_EMAIL: (id: string) => string;
		readonly UPDATE_PROFILE: (id: string) => string;
		readonly DELETE_PROFILE: (id: string) => string;
		readonly ADMIN_UPDATE: (id: string) => string;
		readonly ADMIN_DELETE: (id: string) => string;
	};
	readonly VEHICLE: {
		readonly BASE: string;
		readonly SEARCH: string;
		readonly BY_ID: string;
		readonly CREATE: string;
		readonly UPDATE: (id: number) => string;
		readonly DELETE: (id: number) => string;
	};
	readonly VEHICLE_TYPE: {
		readonly BASE: string;
		readonly SEARCH: string;
		readonly BY_ID: string;
		readonly CREATE: string;
		readonly UPDATE: (id: number) => string;
		readonly DELETE: (id: number) => string;
	};
	readonly TRIP: {
		readonly BASE: string;
		readonly SEARCH: string;
		readonly BY_ID: string;
		readonly CREATE: string;
		readonly UPDATE: (id: number) => string;
		readonly DELETE: (id: number) => string;
		readonly ASSIGN_DRIVER: string;
		readonly AUTO_ASSIGN_DRIVER: string;
		readonly UNASSIGN_DRIVER: string;
	};
	readonly DRIVER: {
		readonly BASE: string;
		readonly SEARCH: string;
		readonly BY_ID: string;
		readonly CREATE: string;
		readonly UPDATE: (id: number) => string;
		readonly DELETE: (id: number) => string;
		readonly SCHEDULE: string;
	};
	readonly LOCATION: {
		readonly BASE: string;
		readonly SEARCH: string;
		readonly BY_ID: string;
		readonly BY_COORDINATES: string;
		readonly CREATE: string;
		readonly UPDATE: (id: number) => string;
		readonly DELETE: (id: number) => string;
	};
	readonly ROUTE: {
		readonly BASE: string;
		readonly SEARCH: string;
		readonly BY_ID: string;
		readonly CREATE: string;
		readonly UPDATE: (id: number) => string;
		readonly DELETE: (id: number) => string;
	};
	readonly COUPON: {
		readonly BASE: string;
		readonly SEARCH: string;
		readonly BY_ID: string;
		readonly BY_CODE: string;
		readonly ADD: string;
		readonly UPDATE: (id: number) => string;
		readonly DELETE: (id: number) => string;
		readonly PREVIEW: string;
	};
	readonly SEAT: {
		readonly BASE: string;
		readonly BY_ID: string;
		readonly UPDATE: string;
	};
	readonly PAYMENT_METHOD: {
		readonly BASE: string;
		readonly BY_CODE: string;
		readonly ALL: string;
		readonly ACTIVE: string;
		readonly CREATE: string;
		readonly UPDATE: (id: number) => string;
		readonly DELETE: (id: number) => string;
	};
	readonly ORDER: {
		readonly BASE: string;
		readonly CREATE: string;
		readonly BY_ID: string;
		readonly BY_USER: string;
		readonly BY_GUEST: string;
		readonly REFUND: string;
	};
	readonly SETTINGS: {
		readonly BASE: string;
		readonly UPDATE: string;
	};
	readonly CHECKIN: {
		readonly VERIFY: string;
	};
	readonly DEBUG: {
		readonly TRIGGER_PAYMENT_CLEANUP: string;
		readonly PAYMENT_QUEUE_STATS: string;
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
