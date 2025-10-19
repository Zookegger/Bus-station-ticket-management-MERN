/**
 * Email-related constants
 */

// SMTP Configuration (from environment)
export const SMTP_CONFIG = {
	HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
	PORT: Number(process.env.SMTP_PORT) || 587,
	SECURE: false, // true for 465, false for other ports
	AUTH: {
		USER: process.env.SMTP_USER || '',
		PASS: process.env.SMTP_PASS || '',
	},
} as const;

// Email templates
export const EMAIL_TEMPLATES = {
	VERIFICATION: 'verification',
	RESET_PASSWORD: 'reset_password',
	WELCOME: 'welcome',
	TICKET_CONFIRMATION: 'ticket_confirmation',
	PAYMENT_RECEIPT: 'payment_receipt',
} as const;

// Email subjects
export const EMAIL_SUBJECTS = {
	VERIFICATION: 'Verify Your Email - EasyRide',
	RESET_PASSWORD: 'Password Reset Request - EasyRide',
	WELCOME: 'Welcome to EasyRide!',
	TICKET_CONFIRMATION: 'Your Ticket Confirmation - EasyRide',
	PAYMENT_RECEIPT: 'Payment Receipt - EasyRide',
} as const;

// Queue names
export const EMAIL_QUEUES = {
	VERIFICATION: 'verification-email',
	RESET_PASSWORD: 'password-reset-email',
	WELCOME: 'welcome-email',
	TICKET: 'ticket-email',
	PAYMENT: 'payment-email',
} as const;