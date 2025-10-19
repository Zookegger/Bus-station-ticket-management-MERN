import { configService } from '@services/settingServices';
import ms from 'ms';

/**
 * Configuration constants that depend on configService.
 * These are safely accessed only after configService.initialize() has been called.
 */
export const CONFIG = {
	// Authentication
	get BCRYPT_SALT_ROUNDS(): number {
		return configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
	},

	get JWT_EXPIRY_HOURS(): number {
		return configService.get<number>('JWT_EXPIRY_HOURS', 72);
	},

	get REFRESH_TOKEN_EXPIRY_HOURS(): number {
		return configService.get<number>('REFRESH_TOKEN_EXPIRY_HOURS', 720);
	},

	get CHANGE_PASSWORD_EXPIRY_HOURS(): number {
		return configService.get<number>('CHANGE_PASSWORD_EXPIRY_HOURS', 24);
	},

	get VERIFICATION_TOKEN_EXPIRY_HOURS(): number {
		return configService.get<number>('VERIFICATION_TOKEN_EXPIRY_HOURS', 24);
	},

	// Payment & Booking
	get PAYMENT_WINDOW_MINUTES(): number {
		return configService.get<number>('PAYMENT_WINDOW_MINUTES', 10);
	},

	get TICKET_RESERVATION_MINUTES(): number {
		return configService.get<number>('TICKET_RESERVATION_MINUTES', 15);
	},

	// System
	get MAX_TICKET_CLEANUP_BATCH_SIZE(): number {
		return configService.get<number>('MAX_TICKET_CLEANUP_BATCH_SIZE', 200);
	},

	get MAX_LOGIN_ATTEMPTS(): number {
		return configService.get<number>('MAX_LOGIN_ATTEMPTS', 5);
	},

	get SESSION_TIMEOUT_MINUTES(): number {
		return configService.get<number>('SESSION_TIMEOUT_MINUTES', 60);
	},

	// Features
	get ENABLE_EMAIL_NOTIFICATIONS(): boolean {
		return configService.get<boolean>('ENABLE_EMAIL_NOTIFICATIONS', true);
	},

	get ENABLE_GUEST_BOOKING(): boolean {
		return configService.get<boolean>('ENABLE_GUEST_BOOKING', true);
	},

	// Business
	get DEFAULT_CURRENCY(): string {
		return configService.get<string>('DEFAULT_CURRENCY', 'VND');
	},

	// Cron
	get CLEANUP_CRON_EXPRESSION(): string {
		return configService.get<string>('CLEANUP_CRON_EXPRESSION', '*/5 * * * *');
	},
};

/**
 * Computed constants that derive from CONFIG values
 */
export const COMPUTED = {
	get JWT_EXPIRY(): ms.StringValue {
		return `${CONFIG.JWT_EXPIRY_HOURS}h`;
	},

	get REFRESH_TOKEN_EXPIRY_SECONDS(): number {
		return CONFIG.REFRESH_TOKEN_EXPIRY_HOURS * 3600;
	},

	get PAYMENT_WINDOW_SECONDS(): number {
		return CONFIG.PAYMENT_WINDOW_MINUTES * 60;
	},

	get TICKET_RESERVATION_MILLISECONDS(): number {
		return CONFIG.TICKET_RESERVATION_MINUTES * 60 * 1000;
	},

	get VERIFICATION_TOKEN_EXPIRY_SECONDS(): number {
		return CONFIG.VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60;
	},

	get CHANGE_PASSWORD_EXPIRY_MILLISECONDS(): number {
		return CONFIG.CHANGE_PASSWORD_EXPIRY_HOURS * 60 * 60 * 1000;
	},
};