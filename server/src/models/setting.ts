import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { DbModels } from "@models";

export interface SettingAttributes {
    key: string;
    value: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// No creation attributes needed as all are required on creation
export interface SettingCreationAttributes extends Optional<SettingAttributes, "description" | "createdAt" | "updatedAt"> {}

/**
 * Sequelize model representing a Setting entity.
 *
 * @class Setting
 * @extends {Model<SettingAttributes, SettingCreationAttributes>}
 * @implements {SettingAttributes}
 * @property {string} key - The unique identifier for the setting.
 * @property {string} value - The value of the setting, stored as a string.
 * @property {string} [description] - A human-readable description for the admin UI.
 * @property {Date} [createdAt] - The date and time the record was created.
 * @property {Date} [updatedAt] - The date and time the record was last updated.
 */
export class Setting
    extends Model<SettingAttributes, SettingCreationAttributes>
    implements SettingAttributes
{
    /**
     * @property {string} key - The unique identifier for the setting.
     */
    public key!: string;
    /**
     * @property {string} value - The value of the setting, stored as a string.
     */
    public value!: string;
    /**
     * @property {string} description - A human-readable description for the admin UI.
     */
    public description?: string;

    /**
     * @property {Date} createdAt - The date and time the record was created.
     */
    public readonly createdAt!: Date;
    /**
     * @property {Date} updatedAt - The date and time the record was last updated.
     */
    public readonly updatedAt!: Date;

    /**
     * Initializes the Sequelize model definition for Setting.
     *
     * @param {Sequelize} sequelize - The Sequelize instance.
     * @returns {void}
     */
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

    /**
     * Defines associations between the Setting model and other models.
     *
     * @param {DbModels} models - The collection of all Sequelize models.
     * @returns {void}
     */
    static associate(models: DbModels): void {
        // No associations for Setting model
    }
}