import { NextFunction, Request, Response } from "express";
import { getParamNumericId } from "@utils/request";
import * as locationServices from "@services/locationServices";
import { CreateLocationDTO, UpdateLocationDTO } from "@my_types/location";

/**
 * Location management controller.
 *
 * Handles CRUD operations for locations including creating, updating,
 * deleting, and retrieving location records. All operations include
 * proper error handling and validation.
 */

/**
 * Creates a new location record.
 *
 * Validates input data and creates a new location in the database.
 * Used by administrators to add new locations to the system.
 *
 * @param req - Express request object containing location creation data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /locations
 * @access Admin
 *
 * @throws {Error} When creation fails or validation errors occur
 */
export const AddLocation = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const new_location: CreateLocationDTO = req.body;
        const location = await locationServices.addLocation(new_location);
        if (!location) throw { status: 500, message: "No location added, Something went wrong." };

        res.status(200).json({ location, message: "Location added successfully" })
    } catch (err) {
        next(err);
    }
};

/**
 * Updates an existing location record.
 *
 * Modifies location information based on provided ID and update data.
 * Supports partial updates where only specified fields are changed.
 *
 * @param req - Express request object containing location ID and update data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route PUT /locations
 * @access Admin
 *
 * @throws {Error} When update fails or location not found
 */
export const UpdateLocation = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const id = getParamNumericId(req);

        const updated_location: UpdateLocationDTO = req.body;
        const location = await locationServices.updateLocation(id, updated_location);
        if (!location) throw { status: 500, message: "No location updated, Something went wrong or no new changes.", };

        res.status(200).json({ location, message: "Location updated successfully.", });
    } catch (err) {
        next(err);
    }
};

/**
 * Deletes a location by ID.
 *
 * Permanently removes a location record from the system.
 * Returns appropriate status codes based on operation outcome.
 *
 * @param req - Express request object containing location ID in URL parameters
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route DELETE /locations/:id
 * @access Admin
 *
 * @throws {Error} When location not found or deletion fails
 * @returns JSON response with success message
 */
export const DeleteLocation = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const id = getParamNumericId(req);

        await locationServices.removeLocation(id);

        res.status(200).json({
            success: true,
			message: "Location deleted successfully.",
        })
    } catch (err) {
        next(err);
    }
};

/**
 * Retrieves a specific location by ID.
 *
 * Retrieves detailed information for a single location record.
 * Used for displaying location details and editing operations.
 *
 * @param req - Express request object containing location ID
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route GET /locations/:id
 * @access Public/Admin
 *
 * @throws {Error} When location not found or query fails
 */
export const GetLocationById = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const id = getParamNumericId(req);
        const location = await locationServices.getLocationById(id);

        if (!location) throw { status: 404, message: `No location found with Id ${id}` }
        res.status(200).json(location);
    } catch (err) {
        next(err);
    }
};

const getParamsLonLat = (req: Request): { lon: number, lat: number} => {
	const lon: number = Number.parseInt(req.params.lon as string);
	const lat: number = Number.parseInt(req.params.lat as string);
	if (isNaN(lon)) {
		throw { status: 400, message: "Invalid lon parameter" };
	}

	if (isNaN(lat)) {
		throw { status: 400, message: "Invalid lat parameter" };
	}
	return { lon, lat };
};

export const GetLocationByCoordinates = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const coordinates = getParamsLonLat(req);
        const location = await locationServices.getLocationByCoordinates(coordinates.lon, coordinates.lat);

        if (!location) throw { status: 404, message: `No location found with coordinate lon:${coordinates.lon} lat:${coordinates.lat}` }
        res.status(200).json(location);
    } catch (err) {
        next(err);
    }
};

/**
 * Searches for locations with filtering and pagination.
 *
 * Retrieves a list of locations based on search criteria including
 * keywords, sorting, and pagination. Used for location listings and search interfaces.
 *
 * @param req - Express request object containing optional query parameters
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route GET /locations/search
 * @access Public/Admin
 *
 * @throws {Error} When query fails or invalid parameters provided
 */
export const searchLocation = async (
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
            name,
            address,
            long,
            lat,
        } = req.query;

        const options: any = {
            keywords: keywords as string,
            orderBy: orderBy as string,
            sortOrder: sortOrder as "ASC" | "DESC",
        };
        if (page !== undefined) options.page = parseInt(page as string);
        if (limit !== undefined) options.limit = parseInt(limit as string);
        if (name !== undefined) options.name = name as string;
        if (address !== undefined) options.address = address as string;
        if (long !== undefined) options.long = parseFloat(long as string);
        if (lat !== undefined) options.lat = parseFloat(lat as string);

        const locations = await locationServices.searchLocation(options);
        res.status(200).json(locations);
    } catch (err) {
        next(err);
    }
};