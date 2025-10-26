import {
	DataTypes,
	Model,
	Optional,
	Sequelize,
	BelongsToGetAssociationMixin,
} from "sequelize";
import { User } from "./user";
import { NotificationPriorities, NotificationPriority, NotificationStatus, NotificationStatuses, NotificationType, NotificationTypes } from "@my_types/notifications";
import { DbModels } from "@models";;

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

export interface NotificationCreationAttributes extends Optional<Omit<NotificationAttributes, "id" | "createdAt" | "updatedAt">, "metadata" | "readAt"> {}

/**
 * Sequelize model representing a Notification entity.
 *
 * @class Notification
 * @extends {Model<NotificationAttributes, NotificationCreationAttributes>}
 * @implements {NotificationAttributes}
 * @property {number} id - The unique identifier for the notification.
 * @property {string} userId - The ID of the user who will receive the notification.
 * @property {string} title - The title of the notification.
 * @property {string} content - The content of the notification.
 * @property {NotificationType} type - The type of the notification.
 * @property {NotificationPriority} priority - The priority of the notification.
 * @property {NotificationStatus} status - The status of the notification.
 * @property {Record<string, any>} [metadata] - Additional data associated with the notification.
 * @property {Date} [readAt] - The date and time the notification was read.
 * @property {Date} [createdAt] - The date and time the record was created.
 * @property {Date} [updatedAt] - The date and time the record was last updated.
 * @property {User} [user] - Associated User instance.
 */
export class Notification
	extends Model<NotificationAttributes, NotificationCreationAttributes>
	implements NotificationAttributes
{
	/**
	 * @property {number} id - The unique identifier for the notification.
	 */
	public id!: number;
	/**
	 * @property {string} userId - The ID of the user who will receive the notification.
	 */
	public userId!: string;
	/**
	 * @property {string} title - The title of the notification.
	 */
	public title!: string;
	/**
	 * @property {string} content - The content of the notification.
	 */
	public content!: string;
	/**
	 * @property {NotificationType} type - The type of the notification.
	 */
	public type!: NotificationType;
	/**
	 * @property {NotificationPriority} priority - The priority of the notification.
	 */
	public priority!: NotificationPriority;
	/**
	 * @property {NotificationStatus} status - The status of the notification.
	 */
    public status!: NotificationStatus;
	/**
	 * @property {Record<string, any>} metadata - Additional data associated with the notification.
	 */
	public metadata?: Record<string, any>;
	/**
	 * @property {Date} readAt - The date and time the notification was read.
	 */
	public readAt?: Date;

	/**
	 * @property {Date} createdAt - The date and time the record was created.
	 */
	public readonly createdAt!: Date;
	/**
	 * @property {Date} updatedAt - The date and time the record was last updated.
	 */
	public readonly updatedAt!: Date;

	// Associations
	public getUser!: BelongsToGetAssociationMixin<User>;
	/**
	 * @property {User} [user] - Associated User instance.
	 */
	public readonly user?: User;

	/**
	 * Initializes the Sequelize model definition for Notification.
	 *
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
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
					field: 'userId'
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
					field: 'readAt'
                },
            },
			{
				sequelize,
                tableName: 'notifications',
				timestamps: true,
				underscored: false,
                indexes: [
                    { fields: ['userId'] },
                    { fields: ['status'] },
                    { fields: ['type'] },
                    { fields: ['createdAt'] },
                ],
			}
		);
	}

	/**
	 * Defines associations between the Notification model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels) {
		Notification.belongsTo(models.User, {
			foreignKey: "userId",
			as: "user",
		});
	}
}