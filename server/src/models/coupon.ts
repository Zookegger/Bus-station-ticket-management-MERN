import { CouponTypes } from "@my_types/coupon";
import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface CouponAttributes {
	id: number;
	code: string;
	type: CouponTypes;
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
		"description" | "imgUrl" | "title" | "createdAt" | "updatedAt"
	> {}

export class Coupon
	extends Model<CouponAttributes | CouponCreationAttributes>
	implements CouponAttributes
{
	public id!: number;
	public code!: string;
	public type!: CouponTypes;
	public startPeriod!: Date;
	public endPeriod!: Date;
	public isActive!: boolean;
	public description?: string;
	public imgUrl?: string;
	public title?: string;

	public readonly createdAt?: Date;
	public readonly updatedAt?: Date;

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
				},
				type: {
					type: DataTypes.ENUM(...Object.values(CouponTypes)),
					allowNull: false,
				},
				startPeriod: {
					type: DataTypes.DATE,
					allowNull: false,
				},
				endPeriod: {
					type: DataTypes.DATE,
					allowNull: false,
				},
				isActive: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
				},
				description: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				imgUrl: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				title: {
					type: DataTypes.STRING,
					allowNull: true,
				},
			},
			{ sequelize, tableName: "coupons", timestamps: true }
		);
	}
}
