import { Model, DataTypes, Optional, Sequelize } from "sequelize";

export type UUID = string;

/**
 * Enum for user roles.
 *
 * @enum {string}
 */
export enum role {
	User = "User",
	Admin = "Admin",
	Operator = "Operator",
}

/**
 * Attributes representing a User in the system.
 *
 * @interface UserAttributes
 * @property {string} id - UUID of the user (primary key).
 * @property {string} email - User's email address (unique, required).
 * @property {string} fullName - Full name of the user.
 * @property {string} userName - Username used for login (unique, required).
 * @property {string | null} [address] - Physical or mailing address of the user.
 * @property {string | null} [gender] - Gender of the user.
 * @property {string | null} [avatar] - URL or path to the user’s avatar image.
 * @property {Date | null} [dateOfBirth] - User’s date of birth.
 * @property {boolean} [emailConfirmed] - Whether the user's email is confirmed.
 * @property {role} role - Role of the user (User, Admin, Operator).
 * @property {string | null} [passwordHash] - Hashed password string.
 * @property {string | null} [phoneNumber] - User's phone number.
 * @property {boolean} [phoneNumberConfirmed] - Whether the phone number is confirmed.
 * @property {Date} [createdAt] - Timestamp when the record was created.
 * @property {Date} [updatedAt] - Timestamp when the record was last updated.
 */
export interface UserAttributes {
	id: string;
	email: string;
	fullName: string;
	userName: string;
	address?: string | null;
	gender?: string | null;
	avatar?: string | null;
	dateOfBirth?: Date | null;
	emailConfirmed?: boolean;
	role: role;
	passwordHash?: string | null;
	phoneNumber?: string | null;
	phoneNumberConfirmed?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Attributes required for creating a new User.
 * Some fields are optional because they are generated automatically
 * or can be added later (e.g., avatar, address, timestamps).
 *
 * @interface UserCreationAttributes
 */
interface UserCreationAttributes
	extends Optional<
		UserAttributes,
		| "id"
		| "avatar"
		| "address"
		| "phoneNumberConfirmed"
		| "dateOfBirth"
		| "gender"
		| "fullName"
		| "emailConfirmed"
		| "createdAt"
		| "updatedAt"
	> {}

/**
 * Sequelize model representing a User.
 *
 * Maps the `users` table and enforces schema via Sequelize.
 *
 * @class User
 * @implements {UserAttributes}
 * @property {string} id - UUID primary key of the user.
 * @property {string} email - User’s unique email address.
 * @property {boolean} [emailConfirmed=false] - Whether the user has confirmed their email.
 * @property {string} userName - Chosen username, unique across the system.
 * @property {string} fullName - Full legal name of the user.
 * @property {string|null} [address] - Optional physical address.
 * @property {string|null} [avatar] - Optional avatar image URL.
 * @property {Date|null} [dateOfBirth] - Optional date of birth.
 * @property {string|null} [gender] - Optional gender field.
 * @property {string|null} [phoneNumber] - Optional phone number.
 * @property {boolean} [phoneNumberConfirmed=false] - Whether the phone number has been verified.
 * @property {string|null} [passwordHash] - Hashed password for authentication.
 * @property {role} role - User’s role (`User`, `Admin`, or `Operator`).
 * @property {Date} [createdAt] - Timestamp when the user record was created.
 * @property {Date} [updatedAt] - Timestamp when the user record was last updated.
 */
export class User
	extends Model<UserAttributes, UserCreationAttributes>
	implements UserAttributes
{
	public id!: UUID;
	public address?: string | null;
	public avatar?: string | null;
	public dateOfBirth?: Date | null;
	public email!: string;
	public emailConfirmed?: boolean;
	public role!: role;
	public passwordHash!: string;
	public phoneNumber?: string | null;
	public phoneNumberConfirmed!: boolean;
	public userName!: string;
	public fullName!: string;
	public gender?: string | null;

	public readonly createdAt?: Date;
	public readonly updatedAt?: Date;

	/**
	 * Initializes the Sequelize model definition for User.
	 *
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 */
	static initializeModel(sequelize: Sequelize) {
		User.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				address: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				avatar: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				dateOfBirth: {
					type: DataTypes.DATE,
					allowNull: true,
				},
				email: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
				},
				emailConfirmed: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
				},
				role: {
					type: DataTypes.ENUM(...Object.values(role)),
					allowNull: false,
					defaultValue: role.User,
				},
				passwordHash: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				phoneNumber: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				phoneNumberConfirmed: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				userName: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
				},
				fullName: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				gender: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				createdAt: {
					type: DataTypes.DATE,
					allowNull: true,
				},
				updatedAt: {
					type: DataTypes.DATE,
					allowNull: true,
				},
			},
			{
				sequelize,
				tableName: "users",
				timestamps: true,
				indexes: [
					{ fields: ["email"], unique: true },
					{ fields: ["username"] },
				],
			}
		);
	}
}
