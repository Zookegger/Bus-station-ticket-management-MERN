import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { User } from "./user";

export const NotificationTypes = {
	BOOKING: "booking",
	PAYMENT: "payment",
	TRIP: "trip",
	SYSTEM: "system",
	PROMOTION: "promotion",
} as const;

export type NotificationType =
	(typeof NotificationTypes)[keyof typeof NotificationTypes];

export const NotificationStatuses = {
	UNREAD: "unread",
	READ: "read",
	ARCHIVED: "archived",
} as const;

export type NotificationStatus =
	(typeof NotificationStatuses)[keyof typeof NotificationStatuses];

export const NotificationPriorities = {
	LOW: "low",
	MEDIUM: "medium",
	HIGH: "high",
} as const;

export type NotificationPriority =
	(typeof NotificationPriorities)[keyof typeof NotificationPriorities];

// TODO: Implement notifications
export interface NotificationAttributes {
	id: number;
	userId: string;
	title: string;
	content: string;
	type: NotificationType;
	priority: NotificationPriority;
    status: NotificationStatus;
	metadata?: Record<string, any>; // Additional data (e.g., { bookingId: 123, tripId: 456 })
	readAt?: Date;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface NotificationCreationAttributes extends Omit<NotificationAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Notification
	extends Model<NotificationAttributes, NotificationCreationAttributes>
	implements NotificationAttributes
{
	public id!: number;
	public userId!: string;
	public title!: string;
	public content!: string;
	public type!: NotificationType;
	public priority!: NotificationPriority;
    public status!: NotificationStatus;
	public metadata?: Record<string, any>;
	public readAt?: Date;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	public readonly user?: User;

	static initModel(sequelize: Sequelize) {
		Notification.init(
			{
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                userId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: "users",
                        key: "id",
                    },
                },
                title: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                content: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                type: {
                    type: DataTypes.ENUM(...Object.values(NotificationTypes)),
                    allowNull: false,
                    defaultValue: "system",
                },
                priority: {
                    type: DataTypes.ENUM(...Object.values(NotificationPriorities)),
                    allowNull: false,
                    defaultValue: "medium",
                },
                status: {
                    type: DataTypes.ENUM(...Object.values(NotificationStatuses)),
                    allowNull: false,
                    defaultValue: "unread",
                },
                metadata: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                readAt: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
            },
			{
				sequelize,
                tableName: 'notifications',
				timestamps: true,
                indexes: [
                    { fields: ['userId'] },
                    { fields: ['status'] },
                    { fields: ['type'] },
                    { fields: ['createdAt'] },
                ],
			}
		);
	}
}