import { Request, Response, NextFunction } from "express";
import { Role } from "@models/user";
import passport from "passport";

/**
 * JWT verification middleware.
 * - Reads "Authorization: Bearer <token>"
 * - Verifies signature and expiry
 * - Attaches payload to req.user for downstream handlers
 */
// const JWT_SECRET = process.env.JWT_SECRET || "yourjwtsecret";

// Legacy code
// Authorize using the Authorization header from the payload
/*
export const authenticateJwtLegacy = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// 1. Check Authorization header
	let token: string | undefined;
	const authHeader = req.headers.authorization;

	if (authHeader?.startsWith("Bearer ")) token = authHeader.split(" ")[1]; // Get only the token

	if (!token) {
		return res.status(401).json({ message: "Token missing" });
	}

	try {
		const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

		(req as any).user = payload;
		return next();
	} catch (err) {
		logger.error(err);
		return res.status(401).json({ message: "Invalid or expired token" });
	}
};
*/

export const authenticateJwt = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	passport.authenticate(
		"jwt",
		{ session: false },
		(err: any, user: any, info: any) => {
			if (err) {
				return next(err);
			}
			if (!user) {
				// Handle different failure reasons from passport-jwt
				if (info?.name === "TokenExpiredError")
					return res.status(401).json({ message: "Token expired" });
				if (info?.name === "JsonWebTokenError")
					return res.status(401).json({ message: "Invalid token" });
				return res.status(401).json({ message: "Unauthorized" });
			}
			req.user = user;
			return next();
		}
	)(req, res, next);
};

/**
 * Simple role-based authorization middleware.
 * Usage: router.get('/admin', authenticateJWT, authorizeRole('Admin'), handler)
 */
export const authorizeRole = (requiredRole: string) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const role = (req as any).user?.role as string | undefined;
		if (!role) return res.status(403).json({ message: "No role found" });
		if (role !== requiredRole)
			return res.status(403).json({
				message:
					"Access denied. You do not have the required permissions for this resource.",
			});
		return next();
	};
};

export const isAdmin = authorizeRole(Role.ADMIN);

/**
 * Middleware to optionally authenticate a user via JWT.
 *
 * If a valid JWT is provided, it attaches the user object to `req.user`.
 * If no token is provided or the token is invalid, it proceeds without a user,
 * allowing guest access for the route.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
export const optionalAuthenticateJwt = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	passport.authenticate(
		"jwt",
		{ session: false },
		(err: any, user: any, _info: any) => {
			// On any error, pass it down the chain.
			if (err) {
				return next(err);
			}
			if (user) {
				req.user = user;
			}
			return next();
		}
	)(req, res, next);
};
