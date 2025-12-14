import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import { DbModels } from "@models";

export interface ReviewAttributes {
    id: number;
    userId: string;
    tripId: number;
    rating: number;
    comment?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ReviewCreationAttributes extends Optional<ReviewAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
    public id!: number;
    public userId!: string;
    public tripId!: number;
    public rating!: number;
    public comment?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Review {
        Review.init(
            {
                id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                },
                userId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: "users",
                        key: "id",
                    },
                },
                tripId: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    allowNull: false,
                    references: {
                        model: "trips",
                        key: "id",
                    },
                },
                rating: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    validate: {
                        min: 1,
                        max: 5,
                    },
                },
                comment: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
            },
            {
                sequelize,
                tableName: "reviews",
                timestamps: true,
            }
        );
        return Review;
    }

    static associate(models: DbModels): void {
        Review.belongsTo(models.User, { foreignKey: "userId", as: "user" });
        Review.belongsTo(models.Trip, { foreignKey: "tripId", as: "trip" });
    }
}
