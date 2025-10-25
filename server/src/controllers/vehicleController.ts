/**
 * Vehicle management controller.
 *
 * Handles CRUD operations for vehicles including listing, creating,
 * updating, and searching vehicle records. All operations include
 * proper error handling and validation.
 */

import { NextFunction, Request, Response } from "express";
import { getParamNumericId } from "@utils/request";
import { CreateVehicleDTO, UpdateVehicleDTO } from "@my_types/vehicle";
import * as vehicleServices from "@services/vehicleServices";

/**
 * Retrieves all vehicles with comprehensive filtering, sorting, and pagination.
 *
 * Supports keyword search across multiple fields, custom ordering, and pagination
 * for vehicle listings. Used for populating dropdowns, admin panels, and vehicle
 * selection interfaces.
 *
 * @param req - Express request object containing optional query parameters:
 *   - keywords: Search term for vehicle number plate, model, manufacturer, or vehicle type name
 *   - orderBy: Field to sort by (default: "createdAt")
 *   - sortOrder: Sort direction "ASC" or "DESC" (default: "DESC")
 *   - page: Page number for pagination (1-based)
 *   - limit: Number of items per page
 *   - vehicleTypeId: Filter by specific vehicle type ID
 *   - manufacturer: Filter by manufacturer name
 *   - model: Filter by model name
 * @param res - Express response object returning { rows: Vehicle[], count: number }
 * @param next - Express next function for error handling
 *
 * @route GET /vehicles
 * @access Public/Admin
 *
 * @throws {Error} When database query fails or invalid parameters provided
 * @returns JSON response with vehicles data and total count
 */
export const SearchVehicle = async (
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
			vehicleTypeId,
			manufacturer,
			model,
		} = req.query;

		const options: any = {
			keywords: keywords as string,
			orderBy: orderBy as string,
			sortOrder: sortOrder as "ASC" | "DESC",
		};
		if (page !== undefined) options.page = parseInt(page as string);
		if (limit !== undefined) options.limit = parseInt(limit as string);
		if (vehicleTypeId !== undefined)
			options.vehicleTypeId = parseInt(vehicleTypeId as string);
		if (manufacturer !== undefined)
			options.manufacturer = manufacturer as string;
		if (model !== undefined) options.model = model as string;

		const vehicles = await vehicleServices.listVehicles(options);
		res.status(200).json(vehicles);
	} catch (err) {
		next(err);
	}
};

/**
 * Creates a new vehicle record.
 *
 * Validates input data and creates a new vehicle in the database.
 * Used by administrators to add new vehicles to the system.
 *
 * @param req - Express request object containing vehicle creation data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /vehicles
 * @access Admin
 *
 * @throws {Error} When creation fails or validation errors occur
 */
export const AddVehicle = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const new_vehicle: CreateVehicleDTO = req.body;

		const vehicle = await vehicleServices.addVehicle(new_vehicle);
		if (!vehicle) {
			throw {
				status: 500,
				message: "No vehicle added, Something went wrong.",
			};
		}

		res.status(200).json({
			vehicle,
			message: "Vehicle added successfully.",
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Updates an existing vehicle record.
 *
 * Modifies vehicle information based on provided ID and update data.
 * Supports partial updates where only specified fields are changed.
 *
 * @param req - Express request object containing vehicle ID and update data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route PUT /vehicles
 * @access Admin
 *
 * @throws {Error} When update fails or vehicle not found
 */
export const UpdateVehicle = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		const updated_vehicle: UpdateVehicleDTO = req.body;

		const vehicle = await vehicleServices.updateVehicle(id, updated_vehicle);
		if (!vehicle) {
			throw {
				status: 500,
				message:
					"No vehicle updated, Something went wrong or no new changes.",
			};
		}

		res.status(200).json({
			vehicle,
			message: "Vehicle updated successfully.",
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Deletes a vehicle by ID.
 *
 * Permanently removes a vehicle record from the system.
 * Returns appropriate status codes based on operation outcome.
 *
 * @param req - Express request object containing vehicle ID in URL parameters
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route DELETE /vehicles/:id
 * @access Admin
 *
 * @throws {Error} When vehicle not found or deletion fails
 * @returns JSON response with success message
 */
export const RemoveVehicle = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		await vehicleServices.removeVehicle(id);

		res.status(200).json({
			success: true,
			message: "Vehicle deleted successfully.",
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Searches for a specific vehicle by ID.
 *
 * Retrieves detailed information for a single vehicle record.
 * Used for displaying vehicle details and editing operations.
 *
 * @param req - Express request object containing vehicle ID
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route GET /vehicles/search
 * @access Public/Admin
 *
 * @throws {Error} When vehicle not found or query fails
 */
export const GetVehicleById = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		const vehicle = await vehicleServices.getVehicleById(id);

		if (!vehicle) {
			throw { status: 500, message: "No vehicle found." };
		}

		res.status(200).json(vehicle);
	} catch (err) {
		next(err);
	}
};
