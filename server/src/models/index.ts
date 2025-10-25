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
import { defineAssociations } from "@models/associations";
import { Coupon } from "@models/coupon";
import { Payment } from "@models/payment";
import { PaymentMethod } from "@models/paymentMethod";
import { CouponUsage } from "@models/couponUsage";
import { Setting } from "@models/setting";
import { PaymentTicket } from "./paymentTicket";

/**
 * Centralized model registry and database connection.
 *
 * This object contains all initialized models and the Sequelize instance,
 * providing a single import point for database operations across the application.
 */
const db: {
	sequelize: Sequelize;
	setting: typeof Setting;
	user: typeof User;
	notification: typeof Notification;
	driver: typeof Driver;
	location: typeof Location;
	route: typeof Route;
	refreshToken: typeof RefreshToken;
	vehicle: typeof Vehicle;
	vehicleType: typeof VehicleType;
	trip: typeof Trip;
	seat: typeof Seat;
	ticket: typeof Ticket;
	tripDriverAssignment: typeof TripDriverAssignment;
	coupon: typeof Coupon;
	couponUsage: typeof CouponUsage;
	payment: typeof Payment;
	paymentMethod: typeof PaymentMethod;
	paymentTicket: typeof PaymentTicket;
} = {
	sequelize,
	setting: Setting,
	user: User,
	notification: Notification,
	driver: Driver,
	location: Location,
	route: Route,
	refreshToken: RefreshToken,
	vehicle: Vehicle,
	vehicleType: VehicleType,
	trip: Trip,
	seat: Seat,
	ticket: Ticket,
	tripDriverAssignment: TripDriverAssignment,
	coupon: Coupon,
	couponUsage: CouponUsage,
	payment: Payment,
	paymentMethod: PaymentMethod,
	paymentTicket: PaymentTicket
};

// Initialize models with Sequelize instance
Setting.initModel(sequelize);
User.initModel(sequelize);
Notification.initModel(sequelize);
Driver.initModel(sequelize);
Location.initModel(sequelize);
Route.initModel(sequelize);
RefreshToken.initModel(sequelize);
Vehicle.initModel(sequelize);
VehicleType.initModel(sequelize);
Trip.initModel(sequelize);
Seat.initModel(sequelize);
Ticket.initModel(sequelize);
TripDriverAssignment.initModel(sequelize);
Coupon.initModel(sequelize);
CouponUsage.initModel(sequelize);
Payment.initModel(sequelize);
PaymentMethod.initModel(sequelize);
PaymentTicket.initModel(sequelize);

defineAssociations();

export default db;
export { connectToDatabase } from '@models/setup';