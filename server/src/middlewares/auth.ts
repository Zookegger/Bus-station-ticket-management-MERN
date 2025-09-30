import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * JWT verification middleware.
 * - Reads "Authorization: Bearer <token>"
 * - Verifies signature and expiry
 * - Attaches payload to req.user for downstream handlers
 */
const JWT_SECRET = process.env.JWT_SECRET || "yourjwtsecret";

export const authenticateJwt = (
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
		const payload = jwt.verify(token, JWT_SECRET) as {
			id: number;
			role: string;
			iat?: number;
			exp?: number;
		};

		(req as any).user = payload;
		return next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
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
			return res.status(403).json({ message: "Insufficient role" });
		return next();
	};
};
