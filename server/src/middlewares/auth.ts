import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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