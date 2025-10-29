import {
	BelongsToGetAssociationMixin,
	DataTypes,
	Model,
	Optional,
	Sequelize,
} from "sequelize";
import { Order } from "./orders";
import { Coupon } from "./coupon";
import { User } from "./user";
import { DbModels } from "@models";;

export interface CouponUsageAttributes {
	id: number;
	couponId: number;
	userId: string;
	orderId: string;
	discountAmount: number;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CouponUsageCreationAttributes
	extends Optional<CouponUsageAttributes, "id" | "createdAt" | "updatedAt"> {}

/**
 * Sequelize model representing a CouponUsage entity.
 *
 * @class CouponUsage
 * @extends {Model<CouponUsageAttributes, CouponUsageCreationAttributes>}
 * @implements {CouponUsageAttributes}
 * @property {number} id - The unique identifier for the coupon usage record.
 * @property {number} couponId - The ID of the coupon that was used.
 * @property {string} userId - The ID of the user who used the coupon.
 * @property {string} orderId - The ID of the order in which the coupon was used.
 * @property {number} discountAmount - The amount of discount applied.
 * @property {Date} [createdAt] - The date and time the record was created.
 * @property {Date} [updatedAt] - The date and time the record was last updated.
 * @property {Order} [order] - Associated Order instance.
 * @property {User} [user] - Associated User instance.
 * @property {Coupon} [coupon] - Associated Coupon instance.
 */
export class CouponUsage
	extends Model<CouponUsageAttributes, CouponUsageCreationAttributes>
	implements CouponUsageAttributes
{
	/**
	 * @property {number} id - The unique identifier for the coupon usage record.
	 */
	public id!: number;
	/**
	 * @property {string} userId - The ID of the user who used the coupon.
	 */
	public userId!: string;
	/**
	 * @property {string} orderId - The ID of the order in which the coupon was used.
	 */
	public orderId!: string;
	/**
	 * @property {number} couponId - The ID of the coupon that was used.
	 */
	public couponId!: number;
	/**
	 * @property {number} discountAmount - The amount of discount applied.
	 */
	public discountAmount!: number;

	/**
	 * @property {Date} createdAt - The date and time the record was created.
	 */
	public readonly createdAt!: Date;
	/**
	 * @property {Date} updatedAt - The date and time the record was last updated.
	 */
	public readonly updatedAt!: Date;

	// Associations
	public getOrder!: BelongsToGetAssociationMixin<Order>;
	/**
	 * @property {Order} [order] - Associated Order instance.
	 */
	public readonly order?: Order;

	public getUser!: BelongsToGetAssociationMixin<User>;
	/**
	 * @property {User} [user] - Associated User instance.
	 */
	public readonly user?: User;

	public getCoupon!: BelongsToGetAssociationMixin<Coupon>;
	/**
	 * @property {Coupon} [coupon] - Associated Coupon instance.
	 */
	public readonly coupon?: Coupon;

	/**
	 * Initializes the Sequelize model definition for CouponUsage.
	 *
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
	static initModel(sequelize: Sequelize) {
		CouponUsage.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
					autoIncrement: true,
				},
				couponId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					onUpdate: "CASCADE",
					onDelete: "RESTRICT",
					field: 'couponId'
				},
				userId: {
					type: DataTypes.UUID,
					allowNull: true, // Changed to true to allow NULL
					onUpdate: "CASCADE",
					onDelete: "SET NULL",
					field: 'userId'
				},
				orderId: {
					type: DataTypes.UUID,
					allowNull: false,
					onUpdate: "CASCADE",
					onDelete: "CASCADE",
					unique: true,
					field: 'orderId'
				},
				discountAmount: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: false,
					field: 'discountAmount'
				},
			},
			{
				sequelize,
				tableName: "coupon_usages",
				timestamps: true,
				underscored: false,
				indexes: [
					{
						unique: true,
						fields: ["couponId", "userId"],
					},
					{ fields: ["orderId"] },
					{ fields: ["userId"] },
					{ fields: ["couponId"] },
				],
			}
		);
	}

	/**
	 * Defines associations between the CouponUsage model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels) {
		CouponUsage.belongsTo(models.User, {
			foreignKey: "userId",
			as: "user",
		});
		CouponUsage.belongsTo(models.Order, {
			foreignKey: "orderId",
			as: "order",
		});
		CouponUsage.belongsTo(models.Coupon, {
			foreignKey: "couponId",
			as: "coupon",
		});
	}
}
