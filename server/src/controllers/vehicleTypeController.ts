/**
 * Vehicle type management controller.
 *
 * Handles CRUD operations for vehicle types including listing, creating,
 * updating, and searching vehicle type records. All operations include
 * proper error handling and validation.
 */

import { NextFunction, Request, Response } from "express";
import * as vehicleTypeServices from "@services/vehicleTypeServices";
import {
	CreateVehicleTypeDTO,
	UpdateVehicleTypeDTO,
} from "@my_types/vehicleType";
import { getParamNumericId } from "@utils/request";

/**
 * Retrieves all vehicle types with comprehensive filtering, sorting, and pagination.
 *
 * Supports keyword search, price range filtering, seat capacity filtering,
 * floor count filtering, custom ordering, and pagination for vehicle type listings.
 * Used for populating dropdowns, admin panels, and vehicle type selection interfaces.
 *
 * @param req - Express request object containing optional query parameters:
 *   - keywords: Search term for vehicle type names
 *   - orderBy: Field to sort by (default: "createdAt")
 *   - sortOrder: Sort direction "ASC" or "DESC" (default: "DESC")
 *   - page: Page number for pagination (1-based)
 *   - limit: Number of items per page
 *   - minPrice: Minimum price filter
 *   - maxPrice: Maximum price filter
 *   - minSeats: Minimum total seats filter
 *   - maxSeats: Maximum total seats filter
 *   - minFloors: Minimum floors filter
 *   - maxFloors: Maximum floors filter
 * @param res - Express response object returning { rows: VehicleType[], count: number }
 * @param next - Express next function for error handling
 *
 * @route GET /vehicle-types
 * @access Public/Admin
 *
 * @throws {Error} When database query fails or invalid parameters provided
 * @returns JSON response with vehicle types data and total count
 */
export const SearchVehicleTypes = async (
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
			minPrice,
			maxPrice,
			minSeats,
			maxSeats,
			minFloors,
			maxFloors,
		} = req.query;

		const options: any = {
			keywords: keywords as string,
			orderBy: orderBy as string,
			sortOrder: sortOrder as "ASC" | "DESC",
		};
		if (page !== undefined) options.page = parseInt(page as string);
		if (limit !== undefined) options.limit = parseInt(limit as string);
		if (minPrice !== undefined)
			options.minPrice = parseInt(minPrice as string);
		if (maxPrice !== undefined)
			options.maxPrice = parseInt(maxPrice as string);
		if (minSeats !== undefined)
			options.minSeats = parseInt(minSeats as string);
		if (maxSeats !== undefined)
			options.maxSeats = parseInt(maxSeats as string);
		if (minFloors !== undefined)
			options.minFloors = parseInt(minFloors as string);
		if (maxFloors !== undefined)
			options.maxFloors = parseInt(maxFloors as string);

		const vehicle_types = await vehicleTypeServices.listVehicleTypes(
			options
		);
		res.status(200).json(vehicle_types);
	} catch (err) {
		next(err);
	}
};

/**
 * Creates a new vehicle type record.
 *
 * Validates input data and creates a new vehicle type in the database.
 * Used by administrators to add new vehicle categories to the system.
 *
 * @param req - Express request object containing vehicle type creation data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /vehicle-types
 * @access Admin
 *
 * @throws {Error} When creation fails or validation errors occur
 */
export const AddVehicleType = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const new_vehicle_type: CreateVehicleTypeDTO = req.body;

		const vehicle_type = await vehicleTypeServices.addVehicleType(
			new_vehicle_type
		);
		if (!vehicle_type) {
			throw {
				status: 500,
				message: "No vehicle type added, Something went wrong",
			};
		}

		res.status(200).json({
			vehicle_type,
			message: "Vehicle type added successfully",
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Updates an existing vehicle type record.
 *
 * Modifies vehicle type information based on provided ID and update data.
 * Supports partial updates where only specified fields are changed.
 *
 * @param req - Express request object containing vehicle type ID and update data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route PUT /vehicle-types
 * @access Admin
 *
 * @throws {Error} When update fails or vehicle type not found
 */
export const UpdateVehicleType = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);
		const updated_vehicle_type: UpdateVehicleTypeDTO = req.body;

		const vehicle_type = await vehicleTypeServices.updateVehicleType(
			id,
			updated_vehicle_type
		);
		if (!vehicle_type) {
			throw {
				status: 500,
				message:
					"No vehicle type updated, Something went wrong or no new changes",
			};
		}

		res.status(200).json({
			vehicle_type,
			message: "Vehicle type updated successfully",
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Deletes a vehicle type by ID.
 *
 * Permanently removes a vehicle type record from the system.
 * Returns appropriate status codes based on operation outcome.
 *
 * @param req - Express request object containing vehicle type ID in URL parameters
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route DELETE /vehicle-types/:id
 * @access Admin
 *
 * @throws {Error} When vehicle type not found or deletion fails
 * @returns JSON response with success message
 */
export const RemoveVehicleType = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		await vehicleTypeServices.removeVehicleType(id);

		res.status(200).json({
			success: true,
			message: "Vehicle type deleted successfully",
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Searches for a specific vehicle type by ID.
 *
 * Retrieves detailed information for a single vehicle type record.
 * Used for displaying vehicle type details and editing operations.
 *
 * @param req - Express request object containing vehicle type ID
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route GET /vehicle-types/search
 * @access Public/Admin
 *
 * @throws {Error} When vehicle type not found or query fails
 */
export const GetVehicleTypeById = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		const vehicle_type = await vehicleTypeServices.getVehicleTypeById(id);

		if (!vehicle_type) {
			throw { status: 500, message: "No vehicle type found" };
		}

		res.status(200).json(vehicle_type);
	} catch (err) {
		next(err);
	}
};
