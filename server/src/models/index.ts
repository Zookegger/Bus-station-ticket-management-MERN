/**
 * Database models initialization and configuration.
 *
 * This module sets up all Sequelize models, defines their relationships,
 * and provides database connection utilities. It serves as the central
 * point for model management and database operations.
 */

import { sequelize } from "@config/database";
import { Sequelize } from "sequelize";
import { User } from "@models/user";
import { RefreshToken } from "@models/refreshToken";
import { Vehicle } from "@models/vehicle";
import { VehicleType } from "@models/vehicleType";
import { Driver } from "@models/driver";
import { Location } from "@models/location";
import { Route } from "@models/route";
import { Trip } from "@models/trip";
import { Seat } from "@models/seat";
import { Ticket } from "@models/ticket";
import { TripDriverAssignment } from "@models/tripDriverAssignment";
import { Notification } from "@models/notification";
import { Coupon } from "@models/coupon";
import { Payment } from "@models/payment";
import { PaymentMethod } from "@models/paymentMethod";
import { CouponUsage } from "@models/couponUsage";
import { Setting } from "@models/setting";
import { Order } from "@models/orders";
import { PaymentTicket } from "@models/paymentTicket";

/**
 * Interface describing the shape of the 'db' object, which
 * holds all Sequelize models.
 */
export interface DbModels {
    sequelize: Sequelize;
    Setting: typeof Setting;
    User: typeof User;
    Notification: typeof Notification;
    Driver: typeof Driver;
    Location: typeof Location;
    Route: typeof Route;
    RefreshToken: typeof RefreshToken;
    Vehicle: typeof Vehicle;
    VehicleType: typeof VehicleType;
    Trip: typeof Trip;
    Seat: typeof Seat;
    Ticket: typeof Ticket;
    TripDriverAssignment: typeof TripDriverAssignment;
    Coupon: typeof Coupon;
    CouponUsage: typeof CouponUsage;
    Payment: typeof Payment;
    PaymentMethod: typeof PaymentMethod;
    PaymentTicket: typeof PaymentTicket;
    Order: typeof Order;
}

const models = {
	Setting,
	User,
	Notification,
	Driver,
	Location,
	Route,
	RefreshToken,
	Vehicle,
	VehicleType,
	Trip,
	Seat,
	Ticket,
	TripDriverAssignment,
	Coupon,
	CouponUsage,
	Payment,
	PaymentMethod,
	PaymentTicket,
	Order,
};

/**
 * Centralized model registry and database connection.
 *
 * This object contains all initialized models and the Sequelize instance,
 * providing a single import point for database operations across the application.
 */
const db: DbModels = {
	sequelize,
	...models,
};

// Initialize models
Object.values(models).forEach((model) => model.initModel(sequelize));

// Apply associations
Object.values(models).forEach((model) => {
	if (typeof model.associate === "function") {
		model.associate(db);
	}
});

export default db;
export { connectToDatabase } from '@models/setup';
