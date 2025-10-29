import {
	Strategy as JwtStrategy,
	ExtractJwt,
	StrategyOptions,
} from "passport-jwt";
import { Request } from "express";
import { JWT_SECRET } from "@constants/auth";
import passport from "passport";
import { JwtPayload } from "@my_types/auth";
import { User } from "@models/user";
import { getUserById } from "@services/userServices";
import { decryptToken } from "@utils/encryption";

/**
 * Extracts the JWT from an httpOnly cookie named 'accessToken'.
 *
 * @param req - The Express request object.
 * @returns The token string if found, otherwise null.
 */
const cookieExtractor = (req: Request): string | null => {
	let token = null;
	if (req && req.cookies && req.cookies.accessToken) {
		const encryptedToken = req.cookies["accessToken"];
		const secret = process.env.COOKIE_ENCRYPTION_KEY || "cookie_encryption_key";
		token = decryptToken(encryptedToken, secret);
	}
	return token;
};

const options: StrategyOptions = {
	// Priority 1: Extract JWT from the httpOnly cookie.
	// Priority 2: Fallback to standard Bearer token for other clients (e.g., mobile app).
	jwtFromRequest: ExtractJwt.fromExtractors([
		cookieExtractor,
		ExtractJwt.fromAuthHeaderAsBearerToken(),
	]),
	secretOrKey: JWT_SECRET,
};

/**
 * Configures and applies the Passport JWT authentication strategy.
 * This is called once at application startup.
 */
export const applyPassportStrategy = () => {
	passport.use(
		new JwtStrategy(
			options,
			async (
				payload: JwtPayload,
				done: (err: any, user?: User | false) => void
			) => {
				try {
					const user = await getUserById(
						payload.id,
						"id",
						"email",
						"role",
						"userName"
					);
					if (user) {
						// User found, authentication successful.
						return done(null, user);
					}
					// User not found.
					return done(null, false);
				} catch (err) {
					return done(err, false);
				}
			}
		)
	);
};
