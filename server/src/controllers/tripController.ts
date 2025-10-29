/**
 * Trip management controller.
 *
 * Handles CRUD operations for trips including listing, creating,
 * updating, and searching trip records. All operations include
 * proper error handling and validation.
 */

import { NextFunction, Request, Response } from "express";
import { getParamNumericId } from "@utils/request";
import { CreateTripDTO, UpdateTripDTO } from "@my_types/trip";
import * as tripServices from "@services/tripServices";

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
			keywords,
			orderBy = "createdAt",
			sortOrder = "DESC",
			page,
			limit,
			vehicleId,
			routeId,
			status,
			startDate,
			endDate,
			minPrice,
			maxPrice,
		} = req.query;

		const options: any = {
			keywords: keywords as string,
			orderBy: orderBy as string,
			sortOrder: sortOrder as "ASC" | "DESC",
		};

		if (page !== undefined) options.page = parseInt(page as string);
		if (limit !== undefined) options.limit = parseInt(limit as string);
		if (vehicleId !== undefined)
			options.vehicleId = parseInt(vehicleId as string);
		if (routeId !== undefined) options.routeId = parseInt(routeId as string);
		if (status !== undefined) options.status = status as string;
		if (startDate !== undefined) options.startDate = startDate as string;
		if (endDate !== undefined) options.endDate = endDate as string;
		if (minPrice !== undefined)
			options.minPrice = parseFloat(minPrice as string);
		if (maxPrice !== undefined)
			options.maxPrice = parseFloat(maxPrice as string);

		const trips = await tripServices.searchTrip(options);
		res.status(200).json(trips);
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

		res.status(200).json({
			trip,
			message: "Trip added successfully.",
		});
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
				message: "No trip updated, Something went wrong or no new changes.",
			};
		}

		res.status(200).json({
			trip,
			message: "Trip updated successfully.",
		});
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
