/**
 * Route management controller.
 *
 * Handles CRUD operations for routes including listing, creating,
 * updating, and searching route records. All operations include
 * proper error handling and validation.
 */

import { NextFunction, Request, Response } from "express";
import { getParamNumericId } from "@utils/request";
import { CreateRouteDTO, UpdateRouteDTO } from "@my_types/route";
import * as routeServices from "@services/routeServices";
import { emitCrudChange } from "@services/realtimeEvents";

/**
 * Retrieves all routes with comprehensive filtering, sorting, and pagination.
 *
 * Supports filtering by start/destination locations, price range, custom ordering,
 * and pagination for route listings. Used for populating dropdowns, admin panels,
 * and route selection interfaces.
 *
 * @param req - Express request object containing optional query parameters:
 *   - keywords: Search term for routes
 *   - orderBy: Field to sort by (default: "createdAt")
 *   - sortOrder: Sort direction "ASC" or "DESC" (default: "DESC")
 *   - page: Page number for pagination (1-based)
 *   - limit: Number of items per page
 *   - startId: Filter by starting location ID
 *   - destinationId: Filter by destination location ID
 *   - minPrice: Filter by minimum price
 *   - maxPrice: Filter by maximum price
 * @param res - Express response object returning { rows: Route[], count: number }
 * @param next - Express next function for error handling
 *
 * @route GET /routes
 * @access Public/Admin
 *
 * @throws {Error} When database query fails or invalid parameters provided
 * @returns JSON response with routes data and total count
 */
export const SearchRoute = async (
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
			startName,
			destinationName,
			minPrice,
			maxPrice,
		} = req.query;

		const options: any = {
            keywords: keywords as string,
            orderBy: orderBy as string,
            sortOrder: sortOrder as "ASC" | "DESC",
            startName: startName as string,
            destinationName: destinationName as string,
        };

		if (page !== undefined) options.page = parseInt(page as string);
		if (limit !== undefined) options.limit = parseInt(limit as string);
		if (minPrice !== undefined) options.minPrice = parseFloat(minPrice as string);
		if (maxPrice !== undefined) options.maxPrice = parseFloat(maxPrice as string);

		const routes = await routeServices.searchRoute(options);
		res.status(200).json(routes.rows);
	} catch (err) {
		next(err);
	}
};

/**
 * Creates a new route record.
 *
 * Validates input data and creates a new route in the database.
 * Used by administrators to add new routes to the system.
 *
 * @param req - Express request object containing route creation data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route POST /routes
 * @access Admin
 *
 * @throws {Error} When creation fails or validation errors occur
 */
export const AddRoute = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const dto: CreateRouteDTO = req.body; 

		const new_route = await routeServices.addRoute(dto);
		if (!new_route) {
			throw {
				status: 500,
				message: "No route added, Something went wrong.",
			};
		}

		const user = (req as any).user;
		emitCrudChange(
			"route",
			"create",
			new_route,
			user ? { id: user.id, name: user.userName } : undefined
		);

		res.status(201).json(new_route);
	} catch (err) {
		next(err);
	}
};

/**
 * Updates an existing route record.
 *
 * Modifies route information based on provided ID and update data.
 * Supports partial updates where only specified fields are changed.
 *
 * @param req - Express request object containing route ID and update data
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route PUT /routes/:id
 * @access Admin
 *
 * @throws {Error} When update fails or route not found
 */
export const UpdateRoute = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		const updated_route: UpdateRouteDTO = req.body;

		const route = await routeServices.updateRoute(id, updated_route);

		const user = (req as any).user;
		emitCrudChange(
			"route",
			"update",
			route,
			user ? { id: user.id, name: user.userName } : undefined
		);

		res.status(200).json(route);
	} catch (err) {
		next(err);
	}
};

/**
 * Deletes a route by ID.
 *
 * Permanently removes a route record from the system.
 * Returns appropriate status codes based on operation outcome.
 *
 * @param req - Express request object containing route ID in URL parameters
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route DELETE /routes/:id
 * @access Admin
 *
 * @throws {Error} When route not found or deletion fails
 * @returns JSON response with success message
 */
export const DeleteRoute = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		await routeServices.deleteRoute(id);

		const user = (req as any).user;
		emitCrudChange(
			"route",
			"delete",
			{ id },
			user ? { id: user.id, name: user.userName } : undefined
		);

		res.status(200).json({
			success: true,
			message: "Route deleted successfully.",
		});
	} catch (err) {
		next(err);
	}
};

/**
 * Retrieves a specific route by ID.
 *
 * Fetches detailed information for a single route record.
 * Used for displaying route details and editing operations.
 *
 * @param req - Express request object containing route ID
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * @route GET /routes/:id
 * @access Public/Admin
 *
 * @throws {Error} When route not found or query fails
 */
export const GetRouteById = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const id = getParamNumericId(req);

		const route = await routeServices.getRouteById(id);

		if (!route) {
			throw { status: 404, message: "No route found." };
		}

		res.status(200).json(route);
	} catch (err) {
		next(err);
	}
};