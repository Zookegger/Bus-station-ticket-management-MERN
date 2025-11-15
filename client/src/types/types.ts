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
    readonly UPDATE_PROFILE: (id: string) => string;
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

export const formatDateForInput = (date?: string | null): string => {
  if (!date) return "";
  const d = new Date(date);
  return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";
};

export interface Order {
  ticketId: string;
  trip: string;
  vehicle: string;
  customer: string;
  seat: string;
  price: number;
  bookingDate: string;
  status: "Paid" | "Cancelled";
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface TopRoute {
  route: string;
  revenue: number;
}

export interface WeeklyData {
  day: string;
  revenue: number;
}

export interface CancelData {
  route: string;
  cancelled: number;
  total: number;
}

export interface VipCustomer {
  name: string;
  total: number;
}

export interface MonthlyComparison {
  month: string;
  current: number;
  previous: number;
}

export type UserRecord = {
  id: string;
  username: string; // login/email
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  emailVerified: boolean;
  ticketsTotal: number;
  totalSpentVnd: number;
  role: string;
  status: string;
};
