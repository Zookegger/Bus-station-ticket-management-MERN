import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { Ticket } from "./ticket";
import { Coupon } from "./coupon";

export interface CouponUsageAttributes {
	id: number;
	couponId: number;
	ticketId: number;
	discountAmount: number; // The actual monetary value discounted for this specific usage
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CouponUsageCreationAttributes
	extends Optional<CouponUsageAttributes, "createdAt" | "updatedAt"> {}

export class CouponUsage
	extends Model<CouponUsageAttributes | CouponUsageCreationAttributes>
	implements CouponUsageAttributes
{
	public id!: number;
	public ticketId!: number;
	public couponId!: number;
	public discountAmount!: number;

	public readonly createdAt?: Date;
	public readonly updatedAt?: Date;

	public ticket?: Ticket;
	public coupon?: Coupon;

	static initModel(sequelize: Sequelize) {
		CouponUsage.init(
			{
				id: {
					type: DataTypes.INTEGER.UNSIGNED,
					primaryKey: true,
                    autoIncrement: true,
					allowNull: false,
				},
				couponId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
				},
				ticketId: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
				},
				discountAmount: {
					type: DataTypes.DECIMAL,
					allowNull: false,
				},
			},
			{
				sequelize,
                tableName: 'coupon_usages',
                timestamps: true
			}
		);
	}
}
