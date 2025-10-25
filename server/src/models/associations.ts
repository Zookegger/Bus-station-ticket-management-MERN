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

	Notification.belongsTo(User, {
		foreignKey: "userId",
		as: "user",
	});

	Ticket.belongsTo(User, {
		foreignKey: "userId",
		as: "user",
	});

	// ==========================================
	// VEHICLE & VEHICLE TYPE ASSOCIATIONS
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

	Vehicle.hasMany(Trip, {
		foreignKey: "vehicleId",
		as: "trips",
	});

	Trip.belongsTo(Vehicle, {
		foreignKey: "vehicleId",
		as: "vehicle",
	});

	// ==========================================
	// LOCATION & ROUTE ASSOCIATIONS
	// ==========================================

	Route.belongsTo(Location, {
		foreignKey: "startId",
		as: "startLocation",
	});

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

	Route.hasMany(Trip, {
		foreignKey: "routeId",
		as: "trips",
	});

	Trip.belongsTo(Route, {
		foreignKey: "routeId",
		as: "route",
	});

	// ==========================================
	// TRIP & SEAT ASSOCIATIONS
	// ==========================================

	Trip.hasMany(Seat, {
		foreignKey: "tripId",
		as: "seats",
	});

	Seat.belongsTo(Trip, {
		foreignKey: "tripId",
		as: "trip",
	});

	// ==========================================
	// TICKET & SEAT ASSOCIATIONS
	// ==========================================

	Seat.hasOne(Ticket, {
		foreignKey: "seatId",
		as: "ticket",
	});

	Ticket.belongsTo(Seat, {
		foreignKey: "seatId",
		as: "seat",
	});

	// ==========================================
	// DRIVER & TRIP ASSIGNMENT ASSOCIATIONS
	// ==========================================

	TripDriverAssignment.belongsTo(Trip, {
		foreignKey: "tripId",
		as: "trip",
	});

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
	// PAYMENT & TICKET ASSOCIATIONS
	// ==========================================

	// Many-to-Many: Payment <-> Ticket through PaymentTicket
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

	// Direct associations for the junction table
	PaymentTicket.belongsTo(Payment, {
		foreignKey: "paymentId",
		as: "payment",
	});

	PaymentTicket.belongsTo(Ticket, {
		foreignKey: "ticketId",
		as: "ticket",
	});

	Payment.hasMany(PaymentTicket, {
		foreignKey: "paymentId",
		as: "paymentTickets",
	});

	Ticket.hasMany(PaymentTicket, {
		foreignKey: "ticketId",
		as: "paymentTickets",
	});

	// Payment Method associations
	PaymentMethod.hasMany(Payment, {
		foreignKey: "paymentMethodId",
		as: "payments",
	});

	Payment.belongsTo(PaymentMethod, {
		foreignKey: "paymentMethodId",
		as: "paymentMethod",
	});

	// ==========================================
	// COUPON & TICKET ASSOCIATIONS
	// ==========================================
	
	Ticket.belongsToMany(Coupon, {
		through: CouponUsage,
		foreignKey: "ticketId",
		otherKey: "couponId"
	});
	
	Coupon.belongsToMany(Ticket, {
		through: CouponUsage,
		foreignKey: "couponId",
		otherKey: "ticketId"
	});
};
