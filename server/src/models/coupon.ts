import { CouponTypes } from "@my_types/coupon";
import {
	DataTypes,
	Model,
	Optional,
	Sequelize,
	HasManyGetAssociationsMixin,
} from "sequelize";
import { CouponUsage } from "@models/couponUsage";
import { DbModels } from "@models";

export interface CouponAttributes {
	id: number;
	code: string;
	type: CouponTypes;
	value: number;
	maxUsage: number;
	currentUsageCount: number;
	startPeriod: Date;
	endPeriod: Date;
	isActive: boolean;
	description?: string;
	imgUrl?: string;
	title?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CouponCreationAttributes
	extends Optional<
		CouponAttributes,
		"id" | "description" | "imgUrl" | "title" | "createdAt" | "updatedAt"
	> {}

/**
 * Sequelize model representing a Coupon entity.
 *
 * @class Coupon
 * @extends {Model<CouponAttributes, CouponCreationAttributes>}
 * @implements {CouponAttributes}
 * @property {number} id - The unique identifier for the coupon.
 * @property {string} code - The unique code for the coupon.
 * @property {CouponTypes} type - The type of the coupon.
 * @property {number} value - The value of the coupon.
 * @property {number} maxUsage - The maximum number of times the coupon can be used.
 * @property {number} currentUsageCount - The current number of times the coupon has been used.
 * @property {Date} startPeriod - The start date of the coupon's validity.
 * @property {Date} endPeriod - The end date of the coupon's validity.
 * @property {boolean} isActive - Whether the coupon is currently active.
 * @property {string} [description] - A description of the coupon.
 * @property {string} [imgUrl] - A URL for an image associated with the coupon.
 * @property {string} [title] - The title of the coupon.
 * @property {Date} [createdAt] - The date and time the record was created.
 * @property {Date} [updatedAt] - The date and time the record was last updated.
 * @property {CouponUsage[]} [couponUsages] - Associated CouponUsage instances.
 */
export class Coupon
	extends Model<CouponAttributes, CouponCreationAttributes>
	implements CouponAttributes
{
	/**
	 * @property {number} id - The unique identifier for the coupon.
	 */
	public id!: number;
	/**
	 * @property {string} code - The unique code for the coupon.
	 */
	public code!: string;
	/**
	 * @property {CouponTypes} type - The type of the coupon (e.g., percentage, fixed amount).
	 */
	public type!: CouponTypes;
	/**
	 * @property {number} value - The value of the coupon.
	 */
	public value!: number;
	/**
	 * @property {number} maxUsage - The maximum number of times the coupon can be used.
	 */
	public maxUsage!: number;
	/**
	 * @property {number} currentUsageCount - The current number of times the coupon has been used.
	 */
	public currentUsageCount!: number;
	/**
	 * @property {Date} startPeriod - The start date of the coupon's validity.
	 */
	public startPeriod!: Date;
	/**
	 * @property {Date} endPeriod - The end date of the coupon's validity.
	 */
	public endPeriod!: Date;
	/**
	 * @property {boolean} isActive - Whether the coupon is currently active.
	 */
	public isActive!: boolean;
	/**
	 * @property {string} description - A description of the coupon.
	 */
	public description?: string;
	/**
	 * @property {string} imgUrl - A URL for an image associated with the coupon.
	 */
	public imgUrl?: string;
	/**
	 * @property {string} title - The title of the coupon.
	 */
	public title?: string;

	/**
	 * @property {Date} createdAt - The date and time the record was created.
	 */
	public readonly createdAt!: Date;
	/**
	 * @property {Date} updatedAt - The date and time the record was last updated.
	 */
	public readonly updatedAt!: Date;

	// Associations
	public getCouponUsages!: HasManyGetAssociationsMixin<CouponUsage>;
	/**
	 * @property {CouponUsage[]} [couponUsages] - Associated CouponUsage instances.
	 */
	public readonly couponUsages?: CouponUsage[];

	/**
	 * Initializes the Sequelize model definition for Coupon.
	 *
	 * @param {Sequelize} sequelize - The Sequelize instance.
	 * @returns {void}
	 */
	static initModel(sequelize: Sequelize) {
		Coupon.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
					autoIncrement: true,
				},
				code: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
				},
				type: {
					type: DataTypes.ENUM(...Object.values(CouponTypes)),
					allowNull: false,
				},
				value: {
					type: DataTypes.DECIMAL(10, 2),
					allowNull: false,
				},
				maxUsage: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					field: "maxUsage",
				},
				currentUsageCount: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					field: "currentUsageCount",
				},
				startPeriod: {
					type: DataTypes.DATE,
					allowNull: false,
					field: "startPeriod",
				},
				endPeriod: {
					type: DataTypes.DATE,
					allowNull: false,
					field: "endPeriod",
				},
				isActive: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: true,
					field: "isActive",
				},
				description: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				imgUrl: {
					type: DataTypes.STRING,
					allowNull: true,
					field: "imgUrl",
				},
				title: {
					type: DataTypes.STRING,
					allowNull: true,
				},
			},
			{
				sequelize,
				tableName: "coupons",
				timestamps: true,
				underscored: false,
			}
		);
	}

	/**
	 * Defines associations between the Coupon model and other models.
	 *
	 * @param {DbModels} models - The collection of all Sequelize models.
	 * @returns {void}
	 */
	static associate(models: DbModels) {
		Coupon.hasMany(models.CouponUsage, {
			foreignKey: "couponId",
			as: "couponUsages",
		});
	}
}
