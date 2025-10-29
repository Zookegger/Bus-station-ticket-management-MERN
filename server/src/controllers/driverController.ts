/**
 * Driver management controller.
 *
 * Handles CRUD operations for drivers including listing, creating,
 * updating, and searching driver records. All operations include
 * proper error handling and validation.
 */

import { NextFunction, Request, Response } from "express";
import * as driverServices from "@services/driverServices";
import { getParamNumericId } from "@utils/request";
import { CreateDriverDTO, UpdateDriverDTO } from "@my_types/driver";

/**
 * Creates a new driver record.
 *
 * Validates input data and creates a new driver in the database.
 * Used by administrators to add new drivers to the system.
 *
 * @param req - Express request object containing driver creation data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /drivers
 * @access Admin
 *
 * @throws {Error} When creation fails or validation errors occur
 */
export const AddDriver = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const new_driver: CreateDriverDTO = req.body;

		const driver = await driverServices.addDriver(new_driver);
		if (!driver)
			throw {
				status: 500,
				message: "No driver added, Something went wrong.",
			};

		res.status(200).json({
			driver,
			message: "Driver added successfully.",
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Updates an existing driver record.
 *
 * Modifies driver information based on provided ID and update data.
 * Supports partial updates where only specified fields are changed.
 *
 * @param req - Express request object containing driver ID and update data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route PUT /drivers
 * @access Admin
 *
 * @throws {Error} When update fails or driver not found
 */
export const UpdateDriver = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		const updated_driver: UpdateDriverDTO = req.body;

		const driver = await driverServices.updateDriver(id, updated_driver);

		if (!driver)
			throw {
				status: 500,
				message: "No driver information updated, Something went wrong.",
			};

		res.status(200).json({
			driver,
			message: "Driver updated successfully.",
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Deletes a driver by ID.
 *
 * Permanently deletes a driver record from the system.
 * Returns appropriate status codes based on operation outcome.
 *
 * @param req - Express request object containing driver ID in URL parameters
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route DELETE /drivers/:id
 * @access Admin
 *
 * @throws {Error} When driver not found or deletion fails
 * @returns JSON response with success message
 */
/**
 * Deletes a driver by ID.
 *
 * Permanently removes a driver record from the system.
 * Returns appropriate status codes based on operation outcome.
 *
 * @param req - Express request object containing driver ID in URL parameters
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route DELETE /drivers/:id
 * @access Admin
 *
 * @throws {Error} When driver not found or deletion fails
 * @returns JSON response with success message
 */
export const DeleteDriver = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		await driverServices.deleteDriver(id);

		res.status(200).json({
			success: true,
			message: "Driver deleted successfully.",
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Retrieves all drivers with comprehensive filtering, sorting, and pagination.
 *
 * Supports keyword search across multiple fields, status filtering, license category filtering,
 * hire date range filtering, custom ordering, and pagination for driver listings.
 * Used for populating dropdowns, admin panels, and driver selection interfaces.
 *
 * @param req - Express request object containing optional query parameters:
 *   - keywords: Search term for driver fullname, phone number, or license number
 *   - orderBy: Field to sort by (default: "createdAt")
 *   - sortOrder: Sort direction "ASC" or "DESC" (default: "DESC")
 *   - page: Page number for pagination (1-based)
 *   - limit: Number of items per page
 *   - isActive: Filter by active employment status (true/false)
 *   - isSuspended: Filter by license suspension status (true/false)
 *   - licenseCategory: Filter by license category
 *   - hiredAfter: Filter drivers hired after this date (ISO format)
 *   - hiredBefore: Filter drivers hired before this date (ISO format)
 * @param res - Express response object returning { rows: Driver[], count: number }
 * @param next - Express next function for error handling
 *
 * @route GET /drivers
 * @access Public/Admin
 *
 * @throws {Error} When database query fails or invalid parameters provided
 * @returns JSON response with drivers data and total count
 */
export const SearchDriver = async (
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
			isActive,
			isSuspended,
			licenseCategory,
			hiredAfter,
			hiredBefore,
		} = req.query;

		const options: any = {
			keywords: keywords as string,
			orderBy: orderBy as string,
			sortOrder: sortOrder as "ASC" | "DESC",
		};
		if (page !== undefined) options.page = parseInt(page as string);
		if (limit !== undefined) options.limit = parseInt(limit as string);
		if (isActive !== undefined) options.isActive = isActive === "true";
		if (isSuspended !== undefined) options.isSuspended = isSuspended === "true";
		if (licenseCategory !== undefined) options.licenseCategory = licenseCategory as string;
		if (hiredAfter !== undefined) options.hiredAfter = new Date(hiredAfter as string);
		if (hiredBefore !== undefined) options.hiredBefore = new Date(hiredBefore as string);

		const drivers = await driverServices.listDrivers(options);
		res.status(200).json(drivers);
	} catch (err) {
		next(err);
	}
};

/**
 * Searches for a specific driver by ID.
 *
 * Retrieves detailed information for a single driver record.
 * Used for displaying driver details and editing operations.
 *
 * @param req - Express request object containing driver ID
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route GET /drivers/search
 * @access Public/Admin
 *
 * @throws {Error} When driver not found or query fails
 */
export const GetDriverById = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		const driver = await driverServices.getDriverById(id);

		if (!driver) {
			throw { status: 500, message: "No driver found." };
		}

		res.status(200).json(driver);
	} catch (err) {
		next(err);
	}
};
