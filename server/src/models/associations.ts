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
import { Notification } from "./notification";

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
};
