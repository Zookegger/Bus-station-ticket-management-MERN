import {
	Model,
	DataTypes,
	Optional,
	Sequelize,
	BelongsToGetAssociationMixin,
} from "sequelize";
import { User } from "./user";
import { DbModels } from "@models";;

/**
 * ==============================================================
 * Access Token vs Refresh Token — How They Work
 * ==============================================================
 *
 * Refresh tokens are long-lived secrets that allow the client to obtain new
 * short-lived access tokens without forcing the user to log in again.
 *
 * - Access Token:
 *   • Short-lived (e.g., 15 minutes – 1 hour).
 *   • Sent with every request (usually in Authorization header).
 *   • Encodes the user’s identity/claims.
 *   • If stolen, attacker can impersonate the user — but only until it expires.
 *
 * - Refresh Token:
 *   • Long-lived (days or weeks).
 *   • Stored securely in DB and issued per device/session.
 *   • Used to request new access tokens when the old one expires.
 *   • Must be kept secret — if stolen, attacker can mint new access tokens.
 *
 * Why store refresh tokens in the DB?
 * - You can revoke a token (logout, password change).
 * - You can track and limit sessions/devices (bind userAgent, ipAddress).
 * - You can rotate tokens and detect theft.
 * - "Log out of all devices" simply = delete all refresh tokens for that user.
 *
 * Typical flow:
 *  1. User logs in → server issues (accessToken, refreshToken).
 *  2. Client stores:
 *       - accessToken (in memory, expires quickly),
 *       - refreshToken (httpOnly cookie or secure storage).
 *  3. Client makes API requests using accessToken.
 *  4. If accessToken expires → client sends refreshToken to get a new one.
 *  5. Server validates refreshToken in DB → issues new accessToken.
 *  6. Logout = delete refreshToken row(s) from DB.
 *
 * Security Notes:
 * - Access tokens are NOT stored in DB — only refresh tokens are.
 * - Refresh tokens should ideally be hashed in DB (like passwords).
 * - Binding refresh tokens to device info (userAgent, ipAddress) helps manage
 *   multiple sessions and detect anomalies.
 */

/**
 * Attributes stored for each refresh token in the database.
 *
 * @interface RefreshTokenAttributes
 * @property {number} id - Auto-incrementing primary key for the refresh token record.
 * @property {string} token - The raw (or hashed) refresh token string.
 * @property {string} userId - UUID of the user to whom this refresh token belongs.
 * @property {string} [userAgent] - The device's User-Agent string (optional).
 * @property {string} [ipAddress] - The IP address associated with the token (optional).
 * @property {Date} expiresAt - Expiration date/time for this refresh token.
 * @property {Date} [createdAt] - Timestamp when this record was created.
 */
export interface RefreshTokenAttributes {
	id: number;
	token: string;
	userId: string;
	userAgent?: string; // Null for now, will implement data collection later
	ipAddress?: string; // Null for now, will implement data collection later
	expiresAt: Date;
	createdAt?: Date;
}

/**
 * Attributes required when creating a new refresh token.
 *
 * `id` and `createdAt` are optional because they are generated automatically
 * by Sequelize / the database.
 *
 * @interface RefreshTokenCreationAttributes
 */
export interface RefreshTokenCreationAttributes
	extends Optional<RefreshTokenAttributes, "id" | "createdAt"> {}

/**
 * Sequelize model representing a Refresh Token.
 *
 * Each row corresponds to a refresh token issued to a specific user, optionally
 * bound to device metadata (userAgent, ipAddress). This allows the system to:
 *
 * - Track and revoke sessions on a per-device basis.
 * - Invalidate tokens after logout or password change.
 * - Detect unusual login patterns or potential token theft.
 *
 * @class RefreshToken
 * @implements {RefreshTokenAttributes}
 * @property {number} id - Auto-incrementing primary key. 
 * @property {string} token - The raw (or hashed) refresh token string.
 * @property {string} userId - UUID of the user who owns this refresh token.
 * @property {string} [userAgent] - The device’s User-Agent string (optional).
 * @property {string} [ipAddress] - The IP address from which the token was issued (optional).
 * @property {Date} expiresAt - Expiration date/time for this refresh token.
 * @property {Date} createdAt - Timestamp when this record was created.
 * @property {User} [user] - Associated User instance.
 */
export class RefreshToken
	extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
	implements RefreshTokenAttributes
{
	/**
	 * @property {number} id - Auto-incrementing primary key.
	 */
	public id!: number;
	/**
	 * @property {string} token - The raw (or hashed) refresh token string.
	 */
	public token!: string;
	/**
	 * @property {string} userId - UUID of the user who owns this refresh token.
	 */
	public userId!: string;
	/**
	 * @property {string} userAgent - The device’s User-Agent string (optional).
	 */
	public userAgent?: string;
	/**
	 * @property {string} ipAddress - The IP address from which the token was issued (optional).
	 */
	public ipAddress?: string;
	/**
	 * @property {Date} expiresAt - Expiration date/time for this refresh token.
	 */
	public expiresAt!: Date;

	/**
	 * @property {Date} createdAt - Timestamp when this record was created.
	 */
	public readonly createdAt!: Date;

	// Associations
	public getUser!: BelongsToGetAssociationMixin<User>;
	/**
	 * @property {User} [user] - Associated User instance.
	 */
	public readonly user?: User;

	/**
	 * Initializes the Sequelize model definition for RefreshToken.
	 *
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 */
	static initModel(sequelize: Sequelize) {
		RefreshToken.init(
			// Definition
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
					autoIncrement: true,
				},
				token: {
					type: DataTypes.STRING(256),
					allowNull: false,
					unique: true,
				},
				userAgent: {
					type: DataTypes.STRING(256),
					allowNull: true,
					field: 'userAgent'
				},
				ipAddress: {
					type: DataTypes.STRING(45), // Accounted for IPv6
					allowNull: true,
					field: 'ipAddress'
				},
				userId: {
					type: DataTypes.UUID,
					allowNull: false,
					field: 'userId'
				},
				expiresAt: {
					type: DataTypes.DATE,
					allowNull: false,
					field: 'expiresAt'
				},
			},
			// Options
			{
				sequelize,
				tableName: "refresh_tokens",
				timestamps: true,
				updatedAt: false, // we treat refresh tokens as immutable rows
				underscored: false,
				indexes: [
					{ fields: ["userId"] },
					{ unique: true, fields: ["token"] },
				],
			}
		);
	}

	/**
	 * Defines associations between the RefreshToken model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels) {
		RefreshToken.belongsTo(models.User, {
			foreignKey: "userId",
			as: "user",
		});
	}
}
