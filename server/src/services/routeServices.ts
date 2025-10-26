/**
 * Route service layer.
 *
 * Provides business logic for route management including CRUD operations,
 * validation, and data access. Handles database interactions through Sequelize ORM
 * and enforces business rules for route entities.
 */

import { Op } from "sequelize";
import db from "@models/index";
import { Route } from "@models/route";
import { CreateRouteDTO, UpdateRouteDTO } from "@my_types/route";

/**
 * Configuration options for route listing and filtering.
 *
 * Defines all available parameters for advanced route queries,
 * including search, filtering, sorting, and pagination options.
 *
 * @property {string} [keywords] - Search term to filter routes (case-insensitive partial match)
 * @property {string} [orderBy="createdAt"] - Field to sort results by
 * @property {"ASC"|"DESC"} [sortOrder="DESC"] - Sort direction
 * @property {number} [page] - Page number for pagination (1-based)
 * @property {number} [limit] - Number of records per page
 * @property {number} [startId] - Filter by starting location ID
 * @property {number} [destinationId] - Filter by destination location ID
 * @property {number} [minPrice] - Filter by minimum price
 * @property {number} [maxPrice] - Filter by maximum price
 */
interface ListOptions {
	keywords?: string;
	orderBy?: string;
	sortOrder?: "ASC" | "DESC";
	page?: number;
	limit?: number;
	startId?: number;
	destinationId?: number;
	minPrice?: number;
	maxPrice?: number;
}

/**
 * Retrieves a route by its unique identifier.
 *
 * @param id - Unique identifier of the route
 * @returns Promise resolving to the route or null if not found
 */
export const getRouteById = async (
	id: number
): Promise<Route | null> => {
	return await db.Route.findByPk(id);
};

/**
 * Retrieves a paginated and filtered list of routes from the database.
 *
 * Provides comprehensive search capabilities including keyword filtering,
 * location-based filtering, price range filtering, custom ordering, and pagination.
 * Uses Sequelize's findAndCountAll for efficient data retrieval with counts.
 *
 * @param options - Configuration options for filtering, sorting, and pagination:
 *   - keywords: Search term to filter routes
 *   - orderBy: Field to sort results by (default: "createdAt")
 *   - sortOrder: Sort direction "ASC" or "DESC" (default: "DESC")
 *   - page: Page number for pagination (1-based)
 *   - limit: Number of records per page
 *   - startId: Filter by starting location ID
 *   - destinationId: Filter by destination location ID
 *   - minPrice: Filter by minimum price
 *   - maxPrice: Filter by maximum price
 * @returns Promise resolving to object containing:
 *   - rows: Array of Route records matching the criteria
 *   - count: Total number of records matching the filter (for pagination)
 * @throws {Error} When database query fails or invalid options provided
 *
 * @example
 * // Get first page of routes with price range
 * searchRoute({
 *   minPrice: 100,
 *   maxPrice: 500,
 *   page: 1,
 *   limit: 10,
 *   orderBy: "price",
 *   sortOrder: "ASC"
 * })
 */
export const searchRoute = async (
	options: ListOptions = {}
): Promise<{
	rows: Route[];
	count: number;
}> => {
	const {
		keywords = "",
		orderBy = "createdAt",
		sortOrder = "DESC",
		page,
		limit,
		startId,
		destinationId,
		minPrice,
		maxPrice,
	} = options;

	const where: any = {};

	if (keywords) {
		where[Op.or] = [
			{ "$StartLocation.name$": { [Op.like]: `%${keywords}%` } },
			{ "$DestinationLocation.name$": { [Op.like]: `%${keywords}%` } },
		];
	}

	// Filter by starting location
	if (startId !== undefined) {
		where.startId = startId;
	}

	// Filter by destination location
	if (destinationId !== undefined) {
		where.destinationId = destinationId;
	}

	// Filter by price range
	if (minPrice !== undefined || maxPrice !== undefined) {
		where.price = {};
		if (minPrice !== undefined) {
			where.price[Op.gte] = minPrice;
		}
		if (maxPrice !== undefined) {
			where.price[Op.lte] = maxPrice;
		}
	}

	const queryOptions: any = {
		where: Object.keys(where).length > 0 ? where : undefined,
		order: [[orderBy, sortOrder]],
	};

	// Add pagination if provided
	if (page !== undefined && limit !== undefined) {
		queryOptions.offset = (page - 1) * limit;
		queryOptions.limit = limit;
	}

	return await db.Route.findAndCountAll(queryOptions);
};

/**
 * Creates a new route record.
 *
 * Validates that the route doesn't already exist (same start and destination)
 * before creation. Throws an error if a duplicate route is found.
 *
 * @param dto - Data transfer object containing route creation data
 * @returns Promise resolving to the created route
 * @throws {Object} Error with status 400 if route with same start and destination already exists
 * @throws {Object} Error with status 400 if start and destination are the same
 */
export const addRoute = async (
	dto: CreateRouteDTO
): Promise<Route | null> => {
	// Validate that start and destination are different
	if (dto.startId === dto.destinationId) {
		throw {
			status: 400,
			message: "Start and destination locations must be different.",
		};
	}

	// Check if route already exists
	const existing_route = await db.Route.findOne({
		where: {
			startId: dto.startId,
			destinationId: dto.destinationId,
		},
	});

	if (existing_route) {
		throw {
			status: 400,
			message: "Route with this start and destination already exists.",
		};
	}

	const route = await db.Route.create(dto);
	return route;
};

/**
 * Updates an existing route record.
 *
 * Finds the route by ID and applies the provided updates.
 * Only updates fields that are provided in the DTO.
 * Validates that start and destination are different if both are provided.
 *
 * @param id - Unique identifier of the route to update
 * @param dto - Data transfer object containing update data
 * @returns Promise resolving to the updated route
 * @throws {Object} Error with status 404 if route not found
 * @throws {Object} Error with status 400 if start and destination are the same
 */
export const updateRoute = async (
	id: number,
	dto: UpdateRouteDTO
): Promise<Route | null> => {
	const route = await getRouteById(id);

	if (!route) {
		throw { status: 404, message: `No route found with id ${id}` };
	}

	// Validate that start and destination are different if both are being updated
	const newStartId = dto.startId ?? route.startId;
	const newDestinationId = dto.destinationId ?? route.destinationId;

	if (newStartId === newDestinationId) {
		throw {
			status: 400,
			message: "Start and destination locations must be different.",
		};
	}

	await route.update(dto);
	return route;
};

/**
 * Removes a route record from the database.
 *
 * Permanently deletes the route after verifying it exists.
 * Verifies deletion was successful by checking if route still exists.
 * Consider adding cascade delete logic if routes have dependencies.
 *
 * @param id - Unique identifier of the route to remove
 * @returns Promise resolving when deletion is complete
 * @throws {Object} Error with status 404 if route not found
 * @throws {Object} Error with status 500 if deletion verification fails
 */
export const deleteRoute = async (id: number): Promise<void> => {
	const route = await getRouteById(id);

	if (!route) {
		throw { status: 404, message: `No route found with id ${id}` };
	}

	await route.destroy();

	// Verify deletion was successful
	const deletedRoute = await getRouteById(id);
	if (deletedRoute) {
		throw {
			status: 500,
			message: "Route deletion failed - route still exists.",
		};
	}
};