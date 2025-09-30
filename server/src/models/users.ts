import { Model, DataTypes, Optional, Sequelize } from "sequelize";

export enum role {
    User,
    Admin,
    Operator
}

interface UserAttributes {
	id: string;
	email: string;
	fullName: string;
	userName: string;
	address?: string | null;
	gender?: string | null;
	avatar?: string | null;
	dateOfBirth?: Date | null;
	emailConfirmed?: boolean;
    role: role | string;
	passwordHash?: string | null;
	phoneNumber?: string | null;
	phoneNumberConfirmed?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

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


export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public address?: string | null;
    public avatar?: string | null;
    public dateOfBirth?: Date | null;
    public email!: string;
    public emailConfirmed?: boolean;
    public role!: string;
    public passwordHash!: string;
    public phoneNumber?: string | null;
    public phoneNumberConfirmed!: boolean;
    public userName!: string;
    public fullName!: string;
    public gender?: string | null;
    
    public readonly createdAt?: Date;
    public readonly updatedAt?: Date;

    static initialize(sequelize: Sequelize) {
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
                    defaultValue: false
                },
                role: {
                    type: DataTypes.STRING,
                    defaultValue: "User",
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
            }
        );
    }
}