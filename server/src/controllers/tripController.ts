/**
 * Trip management controller.
 *
 * Handles CRUD operations for trips including listing, creating,
 * updating, and searching trip records. All operations include
 * proper error handling and validation.
 */
import { User } from "@models/user";
import { NextFunction, Request, Response } from "express";
import { getParamNumericId } from "@utils/request";
import { CreateTripDTO, UpdateTripDTO } from "@my_types/trip";
import * as tripServices from "@services/tripServices";
import * as tripSchedulingServices from "@services/tripSchedulingServices";
import { emitCrudChange } from "@services/realtimeEvents";
import logger from "@utils/logger";

/**
 * Retrieves all trips with comprehensive filtering, sorting, and pagination.
 *
 * Supports filtering by vehicle, route, status, date range, price range,
 * custom ordering, and pagination for trip listings. Used for populating
 * schedules, admin panels, and trip selection interfaces.
 *
 * @param req - Express request object containing optional query parameters:
 *   - keywords: Search term for trips
 *   - orderBy: Field to sort by (default: "createdAt")
 *   - sortOrder: Sort direction "ASC" or "DESC" (default: "DESC")
 *   - page: Page number for pagination (1-based)
 *   - limit: Number of items per page
 *   - vehicleId: Filter by vehicle ID
 *   - routeId: Filter by route ID
 *   - status: Filter by trip status (Scheduled, Departed, Completed, Cancelled)
 *   - startDate: Filter trips starting from this date
 *   - endDate: Filter trips ending before this date
 *   - minPrice: Filter by minimum price
 *   - maxPrice: Filter by maximum price
 * @param res - Express response object returning { rows: Trip[], count: number }
 * @param next - Express next function for error handling
 *
 * @route GET /trips
 * @access Public/Admin
 *
 * @throws {Error} When database query fails or invalid parameters provided
 * @returns JSON response with trips data and total count
 */
export const SearchTrip = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const {
			from,
			to,
			date,
			keywords,
			orderBy = "createdAt",
			sortOrder = "DESC",
			page = "1",
			limit = "10",
			vehicleTypeId,
			vehicleId,
			routeId,
			status,
			startDate,
			endDate,
			minPrice,
			maxPrice,
			checkSeatAvailability, // Expecting "true" or "false" string
			// minSeats,
		} = req.query;

		logger.debug(`From: ${from}`);
		logger.debug(`To: ${to}`);
		
		if (date) {
			logger.debug(`Date: ${new Date(date!.toString())}`);
		}

		// Validate Status
		const allowed_statuses = [
			"Scheduled",
			"Departed",
			"Completed",
			"Cancelled",
		] as const;
		type AllowedStatus = (typeof allowed_statuses)[number];
		const status_value =
			typeof status === "string" &&
			(allowed_statuses as readonly string[]).includes(status)
				? (status as AllowedStatus)
				: undefined;

		// Determine if we should check availability
		// Default: FALSE for admin lists, TRUE for user searches (booking flow)
		// If explicit param provided, use that. Else infer from context.
		const isBookingSearch = !!(from || to || date);
		const shouldCheckAvailability =
			checkSeatAvailability !== undefined
				? checkSeatAvailability === "true"
				: isBookingSearch;

		const options: tripServices.ListOptions = {
			keywords: keywords as string,
			orderBy: orderBy as string,
			sortOrder: sortOrder as "ASC" | "DESC",
			page: parseInt(page as string),
			limit: parseInt(limit as string),
			...(vehicleId && { vehicleId: parseInt(vehicleId as string) }),
			...(vehicleTypeId && {
				vehicleTypeId: parseInt(vehicleTypeId as string),
			}),
			...(routeId && { routeId: parseInt(routeId as string) }),
			...(status_value && { status: status_value }),
			...(startDate && { startDate: startDate as string }),
			...(endDate && { endDate: endDate as string }),
			...(minPrice && { minPrice: parseFloat(minPrice as string) }),
			...(maxPrice && { maxPrice: parseFloat(maxPrice as string) }),

			// Location mappings
			...(from && { fromLocation: from as string }),
			...(to && { toLocation: to as string }),
			...(date && { date: date as string }),

			// New Options
			checkSeatAvailability: shouldCheckAvailability,
			// minSeats: minSeats ? parseInt(minSeats as string) : 1,
		};

		const { rows, count } = isBookingSearch
			? await tripServices.searchTripsForUser(options)
			: await tripServices.searchTripsForAdmin(options);

		res.status(200).json({
			success: true,
			data: rows,
			pagination: {
				totalItems: count,
				totalPages: Math.ceil(count / options.limit!),
				currentPage: options.page,
				itemsPerPage: options.limit,
			},
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Creates a new trip record.
 *
 * Validates input data and creates a new trip in the database.
 * Used by administrators to schedule new trips in the system.
 *
 * @param req - Express request object containing trip creation data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /trips
 * @access Admin
 *
 * @throws {Error} When creation fails or validation errors occur
 */
export const AddTrip = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const new_trip: CreateTripDTO = req.body;

		const trip = await tripServices.addTrip(new_trip);
		if (!trip) {
			throw {
				status: 500,
				message: "No trip added, Something went wrong.",
			};
		}

		res.status(201).json(trip);

		// Emit CRUD change to admins
		try {
			const actor: User | undefined = req.user as User;
			emitCrudChange(
				"trip",
				"create",
				{ id: trip.id, routeId: trip.routeId },
				actor ? { id: String(actor.id), name: `${actor.firstName} ${actor.lastName}` } : undefined
			);
		} catch (e) {
			// ignore emit errors
		}
	} catch (err) {
		next(err);
	}
};

/**
 * Updates an existing trip record.
 *
 * Modifies trip information based on provided ID and update data.
 * Supports partial updates where only specified fields are changed.
 *
 * @param req - Express request object containing trip ID and update data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route PUT /trips/:id
 * @access Admin
 *
 * @throws {Error} When update fails or trip not found
 */
export const UpdateTrip = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		const updated_trip: UpdateTripDTO = req.body;

		const trip = await tripServices.updateTrip(id, updated_trip);
		if (!trip) {
			throw {
				status: 500,
				message:
					"No trip updated, Something went wrong or no new changes.",
			};
		}

		res.status(200).json(trip);

		// Emit CRUD change to admins
		try {
			const actor: User | undefined = req.user as User;
			emitCrudChange(
				"trip",
				"update",
				{ id: trip.id },
				actor ? { id: String(actor.id), name: `${actor.firstName} ${actor.lastName}` } : undefined
			);
		} catch (e) {
			// ignore
		}
	} catch (err) {
		next(err);
	}
};

/**
 * Deletes a trip by ID.
 *
 * Permanently removes a trip record from the system.
 * Returns appropriate status codes based on operation outcome.
 *
 * @param req - Express request object containing trip ID in URL parameters
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route DELETE /trips/:id
 * @access Admin
 *
 * @throws {Error} When trip not found or deletion fails
 * @returns JSON response with success message
 */
export const DeleteTrip = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		await tripServices.deleteTrip(id);

		res.status(200).json({
			success: true,
			message: "Trip deleted successfully.",
		});

		// Emit CRUD change to admins
		try {
			const actor: User | undefined = req.user as User;
			emitCrudChange(
				"trip",
				"delete",
				{ id },
				actor ? { id: String(actor.id), name: `${actor.firstName} ${actor.lastName}` } : undefined
			);
		} catch (e) {
			// ignore
		}
	} catch (err) {
		next(err);
	}
};

/**
 * Retrieves a specific trip by ID.
 *
 * Fetches detailed information for a single trip record.
 * Used for displaying trip details and editing operations.
 *
 * @param req - Express request object containing trip ID
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route GET /trips/:id
 * @access Public/Admin
 *
 * @throws {Error} When trip not found or query fails
 */
export const GetTripById = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		const trip = await tripServices.getTripById(id);

		if (!trip) {
			throw { status: 404, message: "No trip found." };
		}

		res.status(200).json(trip);
	} catch (err) {
		next(err);
	}
};

/**
 * Manually assign or reassign a driver to a trip.
 * Validates driver availability and updates trip status to SCHEDULED.
 *
 * @param req - Express request object containing trip ID in URL and driver ID in body
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /trips/:id/assign-driver
 * @access Admin
 *
 * @throws {Error} When assignment fails or validation errors occur
 * @returns JSON response with assignment schedule data
 */
export const ManuallyAssignDriver = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const tripId = getParamNumericId(req);
		const { driverId } = req.body;
		const assignedBy: User = req.user as User;

		if (!assignedBy)
			throw { status: 401, success: false, message: "Unauthorized" };

		const schedule = await tripSchedulingServices.manualAssignDriver(
			tripId,
			driverId,
			assignedBy.id
		);

		res.status(200).json({ schedule });
	} catch (err) {
		next(err);
	}
};

/**
 * Trigger auto-assignment for a trip using the configured strategy.
 * Automatically selects and assigns an available driver to the trip.
 *
 * @param req - Express request object containing trip ID in URL
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /trips/:id/auto-assign
 * @access Admin
 *
 * @throws {Error} When auto-assignment fails or no driver is available
 * @returns JSON response with assignment schedule data
 */
export const TriggerAutoAssignment = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const tripId = getParamNumericId(req);

		const schedule = await tripSchedulingServices.autoAssignDriver(tripId);

		res.status(200).json({ schedule });
	} catch (err) {
		next(err);
	}
};

/**
 * Unassign driver from a trip and reset trip status to PENDING.
 * Removes the driver assignment and makes the trip available for reassignment.
 *
 * @param req - Express request object containing trip ID in URL
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route DELETE /trips/:id/assign-driver
 * @access Admin
 *
 * @throws {Error} When trip not found or unassignment fails
 * @returns JSON response with success message
 */
export const UnassignDriver = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const tripId = getParamNumericId(req);

		await tripSchedulingServices.unassignDriver(tripId);

		res.status(200).json({ message: "Driver unassigned successfully" });
	} catch (err) {
		next(err);
	}
};

/**
 * Cancels a trip.
 *
 * @param req - Express request object containing trip ID in URL
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route PATCH /trips/:id/cancel
 * @access Admin
 */
export const CancelTrip = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const tripId = getParamNumericId(req);

		const trip = await tripServices.cancelTrip(tripId);

		res.status(200).json({
			message: "Trip cancelled successfully.",
			trip,
		});

		// Emit CRUD change to admins
		try {
			const actor: User | undefined = req.user as User;
			emitCrudChange(
				"trip",
				"update",
				{ id: trip.id, status: trip.status },
				actor ? { id: String(actor.id), name: `${actor.firstName} ${actor.lastName}` } : undefined
			);
		} catch (e) {
			// ignore emit errors
		}
	} catch (err) {
		next(err);
	}
};
