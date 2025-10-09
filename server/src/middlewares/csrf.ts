// SETUP LATER DOWN THE LINE - NOT IMPORTANT FOR NOW

import { doubleCsrf } from "csrf-csrf";
import { Request, Response } from "express";
import { isAdmin } from "./auth";

// Configure CSRF protection
export const csrfUtilities = doubleCsrf({
	getSecret: (req) =>
		req?.secret ||
		process.env.CSRF_SECRET ||
		"default-secret-change-in-production",
	getSessionIdentifier: (req) =>
		(req as any).user?.id || req.ip || "anonymous", // Add this: identifies the session (use user ID if authenticated, fallback to IP)
	cookieName: "__Host-psifi.x-csrf-token",
	cookieOptions: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	},
	size: 64,
	ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

export const { doubleCsrfProtection, generateCsrfToken, validateRequest } = csrfUtilities;

export const csrfProtectionRoute = [isAdmin, doubleCsrfProtection];

export const getCsrfToken = (req: Request, res: Response): string => {
	return generateCsrfToken(req, res);
};

export const isValidCsrfToken = (req: Request): boolean => {
	return validateRequest(req);
};
