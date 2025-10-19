import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface SettingAttributes {
    key: string;
    value: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// No creation attributes needed as all are required on creation
export interface SettingCreationAttributes extends Optional<SettingAttributes, "description" | "createdAt" | "updatedAt"> {}

export class Setting
    extends Model<SettingAttributes, SettingCreationAttributes>
    implements SettingAttributes
{
    public key!: string;
    public value!: string;
    public description?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: Sequelize): void {
        Setting.init(
            {
                key: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false,
                    comment: "The unique identifier for the setting.",
                },
                value: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    comment: "The value of the setting, stored as a string.",
                },
                description: {
                    type: DataTypes.STRING,
                    allowNull: true,
                    comment: "A human-readable description for the admin UI.",
                },
            },
            {
                sequelize,
                tableName: "settings",
                timestamps: true,
            }
        );
    }
}