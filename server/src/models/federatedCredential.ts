import { DataTypes, Model, Sequelize } from "sequelize";
import { DbModels } from ".";
import { User } from "./user";

export interface FederatedCredentialAttributes {
	id?: string;
	userId: string;
	user?: User;
	provider: string; // 'google', 'facebook'
	subject: string; // ID from the provider
}

export class FederatedCredential
	extends Model<FederatedCredentialAttributes>
	implements FederatedCredentialAttributes
{
	public id!: string;
	public userId!: string;
	public user?: User;
	public provider!: string;
	public subject!: string;

	static initModel(sequelize: Sequelize): void {
		FederatedCredential.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				userId: {
					type: DataTypes.UUID,
					allowNull: false,
					references: { model: "users", key: "id" },
					onDelete: "CASCADE",
					onUpdate: "CASCADE",
				},
				provider: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				subject: {
					type: DataTypes.STRING,
					allowNull: false,
				},
			},
			{
				sequelize,
				tableName: "federated_credentials",
				timestamps: true,
				indexes: [
					// Ensure a provider ID is unique across the system
					{ fields: ["provider", "subject"], unique: true },
				],
			}
		);
	}

	static associate(models: DbModels): void {
		FederatedCredential.belongsTo(models.User, {
			foreignKey: "userId",
			as: "user",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});
	}
}
