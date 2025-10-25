/**
 * Seat management controller.
 *
 * Handles seat retrieval and state update operations. Seat creation and deletion
 * are not handled here as they occur automatically during trip creation and are
 * prohibited for data integrity reasons.
 */

import { NextFunction, Request, Response } from "express";
import { getParamNumericId } from "@utils/request";
import { UpdateSeatDTO, SeatFilterDTO } from "@my_types/seat";
import * as seatServices from "@services/seatServices";

/**
 * Retrieves seats with comprehensive filtering, sorting, and pagination.
 *
 * Supports filtering by trip ID, vehicle ID, availability status, and active status.
 * Used for displaying seat layouts, available seats, and managing seat assignments.
 *
 * @param req - Express request object containing optional query parameters:
 *   - tripId: Filter by trip ID
 *   - vehicleId: Filter by vehicle ID
 *   - isAvailable: Filter by availability status (true/false)
 *   - isActive: Filter by active status (true/false)
 *   - orderBy: Field to sort by (default: "number")
 *   - sortOrder: Sort direction "ASC" or "DESC" (default: "ASC")
 *   - page: Page number for pagination (1-based)
 *   - limit: Number of items per page
 * @param res - Express response object returning { rows: Seat[], count: number }
 * @param next - Express next function for error handling
 *
 * @route GET /seats
 * @access Public/Admin
 *
 * @throws {Error} When database query fails or invalid parameters provided
 * @returns JSON response with seats data and total count
 */
export const SearchSeat = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const {
			tripId,
			vehicleId,
			status,
			orderBy = "number",
			sortOrder = "ASC",
			page,
			limit,
		} = req.query;

		const filters: SeatFilterDTO = {};

		if (tripId !== undefined) filters.tripId = parseInt(tripId as string);
		if (vehicleId !== undefined) filters.vehicleId = parseInt(vehicleId as string);
	if (status !== undefined) filters.status = status as any;

		const options: any = {
			orderBy: orderBy as string,
			sortOrder: sortOrder as "ASC" | "DESC",
		};

		if (page !== undefined) options.page = parseInt(page as string);
		if (limit !== undefined) options.limit = parseInt(limit as string);

		const seats = await seatServices.searchSeats(filters, options);
		res.status(200).json(seats);
	} catch (err) {
		next(err);
	}
};

/**
 * Updates an existing seat's state or assignment.
 *
 * Modifies seat availability, active status, or trip assignment.
 * Used for booking seats, releasing seats, or managing seat maintenance.
 *
 * @param req - Express request object containing seat ID and update data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route PUT /seats/:id
 * @access Admin
 *
 * @throws {Error} When update fails or seat not found
 */
export const UpdateSeat = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		const updated_seat: UpdateSeatDTO = req.body;

		const seat = await seatServices.updateSeat(id, updated_seat);
		if (!seat) {
			throw {
				status: 500,
				message:
					"No seat updated, Something went wrong or no new changes.",
			};
		}

		res.status(200).json({
			seat,
			message: "Seat updated successfully.",
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Retrieves a specific seat by ID with full details.
 *
 * Fetches detailed information for a single seat record including
 * associated trip, vehicle, and route information.
 *
 * @param req - Express request object containing seat ID
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route GET /seats/:id
 * @access Public/Admin
 *
 * @throws {Error} When seat not found or query fails
 */
export const GetSeatById = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		const seat = await seatServices.getSeatById(id);

		if (!seat) {
			throw { status: 404, message: "No seat found." };
		}

		res.status(200).json(seat);
	} catch (err) {
		next(err);
	}
};