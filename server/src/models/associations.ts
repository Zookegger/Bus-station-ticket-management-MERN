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
import { Payment } from "@models/payment";
import { PaymentMethod } from "@models/paymentMethod";
import { PaymentTicket } from "@models/paymentTicket";
import { Coupon } from "@models/coupon";
import { CouponUsage } from "@models/couponUsage";
import { Order } from "./orders";

/**
 * Defines all model associations/relationships.
 * This file should be imported after all models are initialized.
 */
export const defineAssociations = () => {
	// ==========================================
	// USER & AUTHENTICATION ASSOCIATIONS
	// ==========================================

	User.hasMany(RefreshToken, {
		foreignKey: "userId",
		as: "refreshTokens",
		onDelete: "CASCADE",
	});

	User.hasMany(Notification, {
		foreignKey: "userId",
		as: "notifications",
	});

	User.hasMany(Ticket, {
		foreignKey: "userId",
		as: "tickets",
	});

	RefreshToken.belongsTo(User, {
		foreignKey: "userId",
		as: "user",
	});

	// This is still useful for querying all tickets by a user directly
	User.hasMany(Ticket, { foreignKey: "userId", as: "tickets" });
	Ticket.belongsTo(User, { foreignKey: "userId", as: "user" });

	// ==========================================
	// VEHICLE, ROUTE, TRIP, SEAT, DRIVER
	// ==========================================
	VehicleType.hasMany(Vehicle, {
		foreignKey: "vehicleTypeId",
		as: "vehicles",
		onDelete: "SET NULL",
	});
	Vehicle.belongsTo(VehicleType, {
		foreignKey: "vehicleTypeId",
		as: "vehicleType",
	});

	Vehicle.hasMany(Trip, { foreignKey: "vehicleId", as: "trips" });
	Trip.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });

	Route.belongsTo(Location, { foreignKey: "startId", as: "startLocation" });
	Route.belongsTo(Location, {
		foreignKey: "destinationId",
		as: "destinationLocation",
	});
	Location.hasMany(Route, {
		as: "routesStartingHere",
		foreignKey: "startId",
	});
	Location.hasMany(Route, {
		as: "routesEndingHere",
		foreignKey: "destinationId",
	});

	Route.hasMany(Trip, { foreignKey: "routeId", as: "trips" });
	Trip.belongsTo(Route, { foreignKey: "routeId", as: "route" });

	Trip.hasMany(Seat, { foreignKey: "tripId", as: "seats" });
	Seat.belongsTo(Trip, { foreignKey: "tripId", as: "trip" });

	Seat.hasOne(Ticket, { foreignKey: "seatId", as: "ticket" });
	Ticket.belongsTo(Seat, { foreignKey: "seatId", as: "seat" });

	TripDriverAssignment.belongsTo(Trip, { foreignKey: "tripId", as: "trip" });
	TripDriverAssignment.belongsTo(Driver, {
		foreignKey: "driverId",
		as: "driver",
	});
	Trip.hasMany(TripDriverAssignment, {
		foreignKey: "tripId",
		as: "driverAssignments",
	});
	Driver.hasMany(TripDriverAssignment, {
		foreignKey: "driverId",
		as: "tripAssignments",
	});

	// ==========================================
	// ORDER-CENTRIC ASSOCIATIONS
	// ==========================================

	// User <-> Order
	User.hasMany(Order, { foreignKey: "userId", as: "orders" });
	Order.belongsTo(User, { foreignKey: "userId", as: "user" });

	// Order <-> Ticket
	Order.hasMany(Ticket, { foreignKey: "orderId", as: "tickets" });
	Ticket.belongsTo(Order, { foreignKey: "orderId", as: "order" });

	// Order <-> Payment
	Order.hasOne(Payment, { foreignKey: "orderId", as: "payment" });
	Payment.belongsTo(Order, { foreignKey: "orderId", as: "order" });

	// Payment <-> PaymentMethod
	PaymentMethod.hasMany(Payment, {
		foreignKey: "paymentMethodId",
		as: "payments",
	});
	Payment.belongsTo(PaymentMethod, {
		foreignKey: "paymentMethodId",
		as: "paymentMethod",
	});

	// Many-to-Many: Payment <-> Ticket through PaymentTicket
	// This can be useful for complex refund/partial payment scenarios
	Payment.belongsToMany(Ticket, {
		through: PaymentTicket,
		foreignKey: "paymentId",
		otherKey: "ticketId",
		as: "tickets",
	});

	Ticket.belongsToMany(Payment, {
		through: PaymentTicket,
		foreignKey: "ticketId",
		otherKey: "paymentId",
		as: "payments",
	});

	PaymentTicket.belongsTo(Payment, { foreignKey: "paymentId" });
	PaymentTicket.belongsTo(Ticket, { foreignKey: "ticketId" });
	Payment.hasMany(PaymentTicket, { foreignKey: "paymentId" });
	Ticket.hasMany(PaymentTicket, { foreignKey: "ticketId" });

	// ==========================================
	// COUPON & USAGE ASSOCIATIONS
	// ==========================================

	// Coupon <-> CouponUsage
	Coupon.hasMany(CouponUsage, { foreignKey: "couponId", as: "couponUsages" });
	CouponUsage.belongsTo(Coupon, { foreignKey: "couponId", as: "coupon" });

	// User <-> CouponUsage
	User.hasMany(CouponUsage, { foreignKey: "userId", as: "couponUsages" });
	CouponUsage.belongsTo(User, { foreignKey: "userId", as: "user" });

	// Order <-> CouponUsage
	Order.hasOne(CouponUsage, { foreignKey: "orderId", as: "couponUsage" });
	CouponUsage.belongsTo(Order, { foreignKey: "orderId", as: "order" });
};
