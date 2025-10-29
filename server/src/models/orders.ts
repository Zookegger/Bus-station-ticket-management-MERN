// src/models/order.ts
import {
	Model,
	DataTypes,
	Optional,
	Sequelize,
	BelongsToGetAssociationMixin,
	HasManyGetAssociationsMixin,
	HasOneGetAssociationMixin,
} from "sequelize";
import { User } from "@models/user";
import { Ticket } from "@models/ticket";
import { Payment } from "@models/payment";
import { CouponUsage } from "@models/couponUsage";
import { DbModels } from "@models";;

/**
 * Enum for the status of an order.
 * @enum {string}
 * @property {string} PENDING - The order is pending and awaiting confirmation or payment.
 * @property {string} CONFIRMED - The order has been confirmed.
 * @property {string} CANCELLED - The order has been cancelled.
 * @property {string} PARTIALLY_REFUNDED - The order has been partially refunded.
 * @property {string} REFUNDED - The order has been fully refunded.
 */
export enum OrderStatus {
	/**
	 * The order is pending and awaiting confirmation or payment.
	 */
	PENDING = "pending",
	/**
	 * The order has been confirmed.
	 */
	CONFIRMED = "confirmed",
	/**
	 * The order has been cancelled.
	 */
	CANCELLED = "cancelled",
	/**
	 * The order has been partially refunded.
	 */
	PARTIALLY_REFUNDED = "partially_refunded",
	/**
	 * The order has been fully refunded.
	 */
	REFUNDED = "refunded",
}

export interface OrderAttributes {
	id: string; // UUID
	userId: string | null; // UUID, Nullable for guests
	paymentId: string | null; // UUID
	totalBasePrice: number;
	totalDiscount: number;
	totalFinalPrice: number;
	guestPurchaserEmail?: string | null;
	guestPurchaserName?: string | null;
	guestPurchaserPhone?: string | null;
	status: OrderStatus;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface OrderCreationAttributes
	extends Optional<
		OrderAttributes,
		| "id"
		| "totalDiscount"
		| "paymentId"
		| "status"
		| "guestPurchaserEmail"
		| "guestPurchaserName"
		| "guestPurchaserPhone"
		| "createdAt"
		| "updatedAt"
	> {}

/**
 * Sequelize model representing an Order entity.
 *
 * @class Order
 * @extends {Model<OrderAttributes, OrderCreationAttributes>}
 * @implements {OrderAttributes}
 * @property {string} id - The unique identifier for the order.
 * @property {string | null} userId - The ID of the user who placed the order.
 * @property {number} totalBasePrice - The total base price of the order.
 * @property {number} totalDiscount - The total discount applied to the order.
 * @property {number} totalFinalPrice - The final price of the order after discounts.
 * @property {string | null} paymentId - The ID of the payment associated with the order.
 * @property {string | null} [guestPurchaserEmail] - The email of the guest purchaser.
 * @property {string | null} [guestPurchaserName] - The name of the guest purchaser.
 * @property {string | null} [guestPurchaserPhone] - The phone number of the guest purchaser.
 * @property {OrderStatus} status - The status of the order.
 * @property {Date} [createdAt] - The date and time the record was created.
 * @property {Date} [updatedAt] - The date and time the record was last updated.
 * @property {User} [user] - Associated User instance.
 * @property {Ticket[]} [tickets] - Associated Ticket instances.
 * @property {Payment} [payment] - Associated Payment instance.
 * @property {CouponUsage} [couponUsage] - Associated CouponUsage instance.
 */
export class Order
	extends Model<OrderAttributes, OrderCreationAttributes>
	implements OrderAttributes
{
	/**
	 * @property {string} id - The unique identifier for the order.
	 */
	public id!: string;
	/**
	 * @property {string | null} userId - The ID of the user who placed the order.
	 */
	public userId!: string | null;
	/**
	 * @property {number} totalBasePrice - The total base price of the order.
	 */
	public totalBasePrice!: number;
	/**
	 * @property {number} totalDiscount - The total discount applied to the order.
	 */
	public totalDiscount!: number;
	/**
	 * @property {number} totalFinalPrice - The final price of the order after discounts.
	 */
	public totalFinalPrice!: number;
	/**
	 * @property {string | null} paymentId - The ID of the payment associated with the order.
	 */
	public paymentId!: string | null;
	/**
	 * @property {string | null} guestPurchaserEmail - The email of the guest purchaser.
	 */
	public guestPurchaserEmail?: string | null;
	/**
	 * @property {string | null} guestPurchaserName - The name of the guest purchaser.
	 */
	public guestPurchaserName?: string | null;
	/**
	 * @property {string | null} guestPurchaserPhone - The phone number of the guest purchaser.
	 */
	public guestPurchaserPhone?: string | null;
	/**
	 * @property {OrderStatus} status - The status of the order.
	 */
	public status!: OrderStatus;

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

	public getTickets!: HasManyGetAssociationsMixin<Ticket>;
	/**
	 * @property {Ticket[]} [tickets] - Associated Ticket instances.
	 */
	public readonly tickets?: Ticket[];

	public getPayment!: BelongsToGetAssociationMixin<Payment>;
	/**
	 * @property {Payment} [payment] - Associated Payment instance.
	 */
	public readonly payment?: Payment;

	public getCouponUsage!: HasOneGetAssociationMixin<CouponUsage>;
	/**
	 * @property {CouponUsage} [couponUsage] - Associated CouponUsage instance.
	 */
	public readonly couponUsage?: CouponUsage;

	/**
	 * Initializes the Sequelize model definition for Order.
	 *
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
	static initModel(sequelize: Sequelize): void {
		Order.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				userId: {
					type: DataTypes.UUID,
					allowNull: true, // Allow null for guest users
					field: 'userId'
				},
				totalBasePrice: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: false,
					field: 'totalBasePrice'
				},
				totalDiscount: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: false,
					defaultValue: 0,
					field: 'totalDiscount'
				},
				totalFinalPrice: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: false,
					field: 'totalFinalPrice'
				},
				paymentId: {
					type: DataTypes.UUID,
					allowNull: true,
					field: 'paymentId'
				},
				guestPurchaserEmail: {
					type: DataTypes.STRING,
					allowNull: true,
					validate: {
						isEmail: true,
					},
					field: 'guestPurchaserEmail'
				},
				guestPurchaserName: {
					type: DataTypes.STRING,
					allowNull: true,
					field: 'guestPurchaserName'
				},
				guestPurchaserPhone: {
					type: DataTypes.STRING,
					allowNull: true,
					field: 'guestPurchaserPhone'
				},
				status: {
					type: DataTypes.ENUM(...Object.values(OrderStatus)),
					allowNull: false,
					defaultValue: OrderStatus.PENDING,
				},
			},
			{
				sequelize,
				tableName: "orders",
				timestamps: true,
				underscored: false
			}
		);
	}

	/**
	 * Defines associations between the Order model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels) {
		Order.belongsTo(models.User, {
			foreignKey: "userId",
			as: "user",
		});
		Order.hasMany(models.Ticket, {
			foreignKey: "orderId",
			as: "tickets",
		});
		Order.belongsTo(models.Payment, {
			foreignKey: "paymentId",
			as: "payment",
		});
		Order.hasOne(models.CouponUsage, {
			foreignKey: "orderId",
			as: "couponUsage",
		});
	}
}
