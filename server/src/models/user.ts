import {
	DataTypes,
	Model,
	Optional,
	Sequelize,
} from "sequelize";
import bcrypt from "bcrypt";
import { Ticket } from "./ticket";
import { RefreshToken } from "./refreshToken";
import { DbModels } from "@models";

/**
 * Enum for user roles.
 * @enum {string}
 * @property {string} User - Regular user.
 * @property {string} Admin - Administrator.
 * @property {string} Operator - Operator.
*/
export enum Role {
	/**  
	 * @property {string} User - Regular user.
	*/
	USER = "User",
	/**  
	 * @property {string} Admin - Administrator.
	*/
	ADMIN = "Admin",
}

/**
 * Enum for user gender.
 * @enum {string}
 */
export enum Gender {
	MALE = "MALE",
	FEMALE = "FEMALE",
	OTHER = "OTHER"
}

/**
 * Interface for the attributes of a User.
 * @interface UserAttributes
 * @property {string} id - The unique identifier for the user (UUID).
 * @property {string} email - The user's email address.
 * @property {string} passwordHash - The user's hashed password.
 * @property {string} [firstName] - The user's first name.
 * @property {string} [lastName] - The user's last name.
 * @property {string} [fullName] - The user's full name.
 * @property {string} [userName] - The user's username.
 * @property {string} [address] - The user's address.
 * @property {Gender} [gender] - The user's gender.
 * @property {string} [avatar] - The user's avatar.
 * @property {Date} [dateOfBirth] - The user's date of birth.
 * @property {boolean} [emailConfirmed] - Whether the user's email is confirmed.
 * @property {string} [phoneNumber] - The user's phone number.
 * @property {boolean} [phoneNumberConfirmed] - Whether the user's phone number is confirmed.
 * @property {Role} role - The user's role.
 * @property {Date} [createdAt] - The date and time the user was created.
 * @property {Date} [updatedAt] - The date and time the user was last updated.
 */
export interface UserAttributes {
	id: string;
	email: string;
	passwordHash: string;
	firstName?: string;
	lastName?: string;
	fullName?: string;
	userName: string;
	address?: string | null;
	gender?: Gender | null;
	avatar?: string | null;
	dateOfBirth?: Date | null;
	emailConfirmed: boolean;
	phoneNumber: string;
	phoneNumberConfirmed?: boolean;
	role: Role;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Interface for the creation attributes of a User.
 * @interface UserCreationAttributes
 * @extends {Optional<UserAttributes, "id" | "createdAt" | "updatedAt">}
 */
export interface UserCreationAttributes
	extends Optional<
		UserAttributes,
		| "id"
		| "passwordHash"
		| "firstName"
		| "lastName"
		| "fullName"
		| "address"
		| "gender"
		| "avatar"
		| "dateOfBirth"
		| "phoneNumber"
		| "createdAt"
		| "updatedAt"
	> {}

/**
 * Sequelize model for the User.
 * @class User
 * @extends {Model<UserAttributes, UserCreationAttributes>}
 * @implements {UserAttributes}
 * @property {string} id - The unique identifier for the user (UUID).
 * @property {string} email - The user's email address.
 * @property {string} passwordHash - The user's hashed password.
 * @property {string} [firstName] - The user's first name.
 * @property {string} [lastName] - The user's last name.
 * @property {string} [fullName] - The user's full name.
 * @property {string} userName - The user's username.
 * @property {string} [address] - The user's address.
 * @property {Gender} [gender] - The user's gender.
 * @property {string} [avatar] - The user's avatar.
 * @property {Date} [dateOfBirth] - The user's date of birth.
 * @property {boolean} [emailConfirmed] - Whether the user's email is confirmed.
 * @property {string} [phoneNumber] - The user's phone number.
 * @property {boolean} [phoneNumberConfirmed] - Whether the user's phone number is confirmed.
 * @property {Role} role - The user's role.
 * @property {Date} [createdAt] - The date and time the user was created.
 * @property {Date} [updatedAt] - The date and time the user was last updated.
 * @property {Ticket[]} [tickets] - Associated Ticket instances.
 * @property {RefreshToken[]} [refreshTokens] - Associated RefreshToken instances.
 */
export class User
	extends Model<UserAttributes, UserCreationAttributes>
	implements UserAttributes
{
	public id!: string;
	public email!: string;
	public passwordHash!: string;
	public firstName?: string;
	public lastName?: string;
	public fullName?: string;
	public userName!: string;
	public address?: string | null;
	public gender?: Gender | null;
	public avatar?: string | null;
	public dateOfBirth?: Date | null;
	public emailConfirmed!: boolean;
	public phoneNumber!: string;
	public phoneNumberConfirmed?: boolean;
	public role!: Role;

	public readonly createdAt?: Date;
	public readonly updatedAt?: Date;

	// Associations
	public readonly tickets?: Ticket[];
	public readonly refreshTokens?: RefreshToken[];

	/**
	 * Initializes the User model.
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
	static initModel(sequelize: Sequelize): void {
		User.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				email: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
				},
				passwordHash: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				firstName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				lastName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				fullName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				userName: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
				},
				address: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				gender: {
					type: DataTypes.ENUM(...Object.values(Gender)),
					allowNull: true,
					defaultValue: Gender.OTHER
				},
				avatar: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				dateOfBirth: {
					type: DataTypes.DATE,
					allowNull: true,
				},
				emailConfirmed: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
				},
				phoneNumber: {
					type: DataTypes.STRING(16),
					allowNull: true,
				},
				phoneNumberConfirmed: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
				},
				role: {
					type: DataTypes.ENUM(...Object.values(Role)),
					allowNull: false,
					defaultValue: Role.USER,
				},
				createdAt: {
					type: DataTypes.DATE,
					allowNull: true,
					field: 'createdAt'
				},
				updatedAt: {
					type: DataTypes.DATE,
					allowNull: true,
					field: 'updatedAt'
				},
			},
			{
				sequelize,
				tableName: "users",
				timestamps: true,
				underscored: false,
				hooks: {
					beforeCreate: (user: User) => {
						if (!user.userName) {
							user.userName = user.email;
						}
					},
				},
				indexes: [
					{ fields: ["email"], unique: true },
					{ fields: ["userName"], unique: true },
				],
			}
		);
	}

	/**
	 * Defines the associations for the User model.
	 * @param {DbModels} models - The database models.
	 * @returns {void}
	 */
	static associate(models: DbModels): void {
		User.hasMany(models.Ticket, {
			foreignKey: "userId",
			as: "tickets",
		});
		User.hasMany(models.RefreshToken, {
			foreignKey: "userId",
			as: "refreshTokens",
		});
	}

	/**
	 * Compares a candidate password with the user's hashed password.
	 * @param {string} candidatePassword - The password to compare.
	 * @returns {Promise<boolean>} - True if the passwords match, false otherwise.
	 */
	public async comparePassword(candidatePassword: string): Promise<boolean> {
		return bcrypt.compare(candidatePassword, this.passwordHash);
	}
}
