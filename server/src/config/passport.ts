import {
	Strategy as JwtStrategy,
	ExtractJwt,
	StrategyOptions,
} from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook"; 
import { Request } from "express";
import { JWT_SECRET } from "@constants/auth";
import passport from "passport";
import { JwtPayload } from "@my_types/auth";
import { Role, User } from "@models/user";
import { getUserById } from "@services/userServices";
import { decryptToken } from "@utils/encryption";
import { FederatedCredential } from "@models/federatedCredential";

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
		const secret =
			process.env.COOKIE_ENCRYPTION_KEY || "cookie_encryption_key";
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
	// -------------------------------------------------------------------------
	// 1. JWT STRATEGY (Local Auth)
	// -------------------------------------------------------------------------
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

	// -------------------------------------------------------------------------
	// 2. SHARED OAUTH VERIFY CALLBACK
	// -------------------------------------------------------------------------
	/**
	 * Handles the logic for finding or creating users based on OAuth profiles.
	 * Used by both Google and Facebook strategies to ensure consistent behavior.
	 */
	const handleOAuthLogin = async (
		provider: string,
		profile: any,
		done: (err: any, user?: User | false) => void
	) => {
		try {
			// Step 1: Check if we already have a FederatedCredential for this provider + ID
			const credential = await FederatedCredential.findOne({
				where: { provider, subject: profile.id },
				include: [{ model: User, as: "user" }],
			});

			if (credential && credential.user) {
				return done(null, credential.user);
			}

			// Step 2: If not linked, check if a User exists with the same email
			// (Note: Facebook might not return an email, so we handle undefined)
			const email = profile.emails?.[0]?.value;
			let user = null;

			if (email) {
				user = await User.findOne({ where: { email } });
				
			}

			if (!user) {
				// Step 3: No existing user found, create a new one
				const firstName =
					profile.name?.givenName ||
					profile.displayName.split(" ")[0];
				const lastName =
					profile.name?.familyName ||
					profile.displayName.split(" ").slice(1).join(" ");

				user = await User.create({
					userName: `user_${profile.id}`, // Generate a unique temp username
					email: email || `${provider}_${profile.id}@no-email.com`, // Fallback if no email
					firstName: firstName,
					lastName: lastName,
					emailConfirmed: true, // Trusted provider, so we confirm email
					role: Role.USER,
					passwordHash: "", // No password for OAuth users
				});
			}

			// Step 4: Create the link (FederatedCredential)
			await FederatedCredential.create({
				userId: user.id,
				provider: provider,
				subject: profile.id,
			});

			return done(null, user);
		} catch (err) {
			return done(err, false);
		}
	};

	// -------------------------------------------------------------------------
	// 3. GOOGLE OAUTH STRATEGY
	// -------------------------------------------------------------------------
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID!,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
				callbackURL: "/api/auth/google/callback",
			},
			(_accessToken, _refreshToken, profile, done) => {
				handleOAuthLogin("google", profile, done);
			}
		)
	);

	// -------------------------------------------------------------------------
	// 4. FACEBOOK OAUTH STRATEGY
	// -------------------------------------------------------------------------
	passport.use(
		new FacebookStrategy(
			{
				clientID: process.env.FACEBOOK_APP_ID!,
				clientSecret: process.env.FACEBOOK_APP_SECRET!,
				callbackURL: "/api/auth/facebook/callback",
				// Explicitly request these fields from Facebook
				profileFields: ["id", "displayName", "photos", "email", "name"],
			},
			(_accessToken, _refreshToken, profile, done) => {
				handleOAuthLogin("facebook", profile, done);
			}
		)
	);
};
