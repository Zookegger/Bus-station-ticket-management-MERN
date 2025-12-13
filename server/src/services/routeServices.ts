/**
 * Route service layer.
 *
 * Provides business logic for route management including CRUD operations,
 * validation, and data access. Handles database interactions through Sequelize ORM
 * and enforces business rules for route entities.
 */

import { Op, Sequelize } from "sequelize";
import db from "@models/index";
import { Route } from "@models/route";
import { RouteStop } from "@models/routeStop";
import { CreateRouteDTO, UpdateRouteDTO } from "@my_types/route";
import logger from "@utils/logger";

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
 * @property {string} [startName] - Filter by starting location name
 * @property {string} [destinationName] - Filter by destination location name
 * @property {number} [minPrice] - Filter by minimum price
 * @property {number} [maxPrice] - Filter by maximum price
 */
interface ListOptions {
	keywords?: string;
	orderBy?: string;
	sortOrder?: "ASC" | "DESC";
	page?: number;
	limit?: number;
	startName?: string;
	destinationName?: string;
	minPrice?: number;
	maxPrice?: number;
}

/**
 * Retrieves a route by its unique identifier.
 *
 * @param id - Unique identifier of the route
 * @returns Promise resolving to the route or null if not found
 */
export const getRouteById = async (id: number): Promise<Route | null> => {
	return await db.Route.findByPk(id, {
		include: [
			{
				model: db.RouteStop,
				as: "stops",
				include: [
					{
						model: db.Location,
						as: "locations",
					},
				],
			},
		],
		order: [["stops", "stopOrder", "ASC"]],
	});
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
		startName,
		destinationName,
		minPrice,
		maxPrice,
	} = options;

	const where: any = {
		[Op.and]: [],
	};

	// Filter by starting location
	if (startName) {
		where[Op.and].push(
			Sequelize.literal(
				`EXISTS (
					SELECT 1
					FROM route_stops rs
					JOIN locations l ON rs.locationId = l.id
					WHERE
						rs.routeId = "Route"."id" AND
						rs.stopOrder = 0 AND
						l.name = :startName
				)`
			)
		);
	}

	// Filter by destination location
	if (destinationName) {
		where[Op.and].push(
			Sequelize.literal(
				`EXISTS (
					SELECT 1
					FROM route_stops rs
					JOIN locations l ON rs.locationId = l.id
					WHERE
						rs.routeId = "Route"."id" AND
						l.name = :destinationName AND
						rs.stopOrder = (
							SELECT MAX(stopOrder)
							FROM routeStops
							WHERE routeId = "Route"."id"
						)
				)`
			)
		);
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

	const query_options: any = {
		// Use the constructed where clause. If it's empty, it will be ignored.
		where: where[Op.and].length > 0 ? where : undefined,
		// Replacements are used to safely inject values into the literal subqueries
		replacements: {
			startName,
			destinationName,
		},
		// Include all stops and their locations in the final result
		include: [
			{
				model: db.RouteStop,
				as: "stops",
				include: [
					{
						model: db.Location,
						as: "locations",
						// Keyword search on any location name within the route
						where: keywords
							? { name: { [Op.like]: `%${keywords}%` } }
							: undefined,
						required: !!keywords, // Make include required only if keywords are present
					},
				],
			},
		],
		order: [
			// Order the main route results
			[orderBy, sortOrder],
			// Ensure the included stops are always ordered correctly
			["stops", "stopOrder", "ASC"],
		],
		distinct: true, // Prevent duplicate routes when filtering by keywords
	};

	// Add pagination if provided
	if (page !== undefined && limit !== undefined) {
		query_options.offset = (page - 1) * limit;
		query_options.limit = limit;
	}

	return await db.Route.findAndCountAll(query_options);
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
export const addRoute = async (dto: CreateRouteDTO): Promise<Route | null> => {
	// 1. Validate that there are at least two stops (a start and a destination).
	if (!dto.stops || dto.stops.length < 2) {
		throw {
			status: 400,
			message: "A route must have at least a start and a destination.",
		};
	}

	// 2. Start a database transaction to ensure atomicity.
	const transaction = await db.sequelize.transaction();
	try {
		const stopsToCreate: any[] = [];

		// 3. Process each stop: find the location or create it if it doesn't exist.
		let stopOrder = 0;
		for (const stop_data of dto.stops) {
			// Use findOrCreate to prevent duplicate locations. It finds a location by name
			// or creates a new one if it's not found.
			const [location] = await db.Location.findOrCreate({
				where: { name: stop_data.name },
				defaults: {
					name: stop_data.name,
					address: stop_data.address,
					latitude: stop_data.latitude,
					longitude: stop_data.longitude,
				},
				transaction,
			});

			stopsToCreate.push({
				locationId: location.id,
				durationFromStart: stop_data.durationFromStart || 0,
				distanceFromStart: stop_data.distanceFromStart || 0,
				stopOrder: stopOrder++,
			});
		}

		// 4. Create the main route record.
		const route = await db.Route.create(
			{
				name: dto.name,
				distance: dto.distance!,
				duration: dto.duration!,
				price: dto.price!,
			},
			{ transaction }
		);

		// 5. Prepare and bulk-create the RouteStop entries.
		const finalStopsPayload = stopsToCreate.map((s) => ({
			...s,
			routeId: route.id,
		}));

		await db.RouteStop.bulkCreate(finalStopsPayload, { transaction });

		// 6. Commit the transaction if all operations succeed.
		await transaction.commit();

		// Retrieve and return the complete route data.
		const new_route = await getRouteById(route.id);
		if (!new_route) {
			// This should not happen if the transaction was successful.
			throw {
				status: 500,
				message: "Failed to retrieve newly created route.",
			};
		}
		return new_route;
	} catch (err) {
		await transaction.rollback();
		throw err;
	}
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
	const transaction = await db.sequelize.transaction();
	try {
		const route = await db.Route.findByPk(id, { transaction });

		if (!route) {
			throw { status: 404, message: `No route found with id ${id}` };
		}

		// Update the route's direct properties if they are provided.
		await route.update(
			{
				name: dto.name ?? route.name,
				distance: dto.distance!,
				duration: dto.duration!,
				price: dto.price!,
			},
			{
				transaction,
			}
		);

		if (dto.stops && dto.stops.length > 0) {
			// This block handles the logic for updating the route's stops.
			// It ensures that we only perform database writes if the stops have actually changed.

			// Step 1: Process the incoming DTO stops to get their corresponding location IDs.
			// For each stop, we find an existing location by name or create a new one.
			const new_location_ids: number[] = [];
			const stopsToCreate: any[] = [];

			for (const [index, stop_data] of dto.stops.entries()) {
				const [location] = await db.Location.findOrCreate({
					where: { name: stop_data.name },
					defaults: {
						name: stop_data.name,
						address: stop_data.address,
						latitude: stop_data.latitude,
						longitude: stop_data.longitude,
					}, // Use the provided data if creating a new location.
					transaction,
				});

				new_location_ids.push(location.id);

				// Prepare the payload here while we have access to 'stop_data'
				stopsToCreate.push({
					routeId: id,
					locationId: location.id,
					stopOrder: index,
					durationFromStart: stop_data.durationFromStart ?? 0,
					distanceFromStart: stop_data.distanceFromStart ?? 0,
				});

				logger.debug("Duration From Start", stop_data.durationFromStart);
				logger.debug("Distance From Start", stop_data.distanceFromStart);
			}

			// Step 2: Fetch the current stops for the route in their correct order.
			const current_stops = await db.RouteStop.findAll({
				where: { routeId: id },
				order: [["stopOrder", "ASC"]],
				transaction,
			});

			// Step 3: Extract the location IDs from the current stops.
			const current_location_ids = current_stops.map(
				(stop) => stop.locationId
			);

			// Step 4: Compare the current list of location IDs with the new list.
			// We convert both to JSON strings for a simple, order-sensitive comparison.
			const are_stops_the_same =
				JSON.stringify(current_location_ids) ===
				JSON.stringify(new_location_ids);

			if (!are_stops_the_same) {
				// First, remove all existing stops associated with this route.
				await db.RouteStop.destroy({
					where: { routeId: id },
					transaction,
				});

				await db.RouteStop.bulkCreate(stopsToCreate, {
					transaction,
				});
			}
		}

		await transaction.commit();

		const updated_route = await getRouteById(id);
		if (!updated_route) {
			throw { status: 500, message: "Failed to retrieve updated route." };
		}
		return updated_route;
	} catch (err) {
		await transaction.rollback();
		throw err;
	}
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
	const transaction = await db.sequelize.transaction();
	try {
		const route_to_delete = await db.Route.findByPk(id, { transaction });

		if (!route_to_delete) {
			throw { status: 404, message: `No route found with id ${id}` };
		}

		await route_to_delete.destroy({ transaction });

		// Verify deletion was successful
		const deletedRoute = await getRouteById(id);
		if (deletedRoute) {
			throw {
				status: 500,
				message: "Route deletion failed - route still exists.",
			};
		}
	} catch (err) {
		await transaction.rollback();
		throw err;
	}
};

/**
 * Finds or creates a reverse route for a given route ID.
 *
 * @param routeId - The ID of the route to reverse.
 * @returns Promise resolving to the reverse route.
 */
export const getOrCreateReverseRoute = async (
	routeId: number
): Promise<Route> => {
	const originalRoute = await getRouteById(routeId);
	if (!originalRoute || !originalRoute.stops) {
		throw { status: 404, message: "Original route not found." };
	}

	const originalStops = originalRoute.stops;
	if (originalStops.length < 2) {
		throw { status: 400, message: "Route must have at least 2 stops." };
	}

	// Create reversed list of location IDs
	const reversedLocationIds = originalStops
		.map((stop: RouteStop) => stop.locationId)
		.reverse();

	const startLocationId = reversedLocationIds[0];
	const endLocationId = reversedLocationIds[reversedLocationIds.length - 1];

	// Find potential matching routes (same start and end)
	// This is an optimization to avoid fetching all routes
	const potentialRoutes = await db.Route.findAll({
		include: [
			{
				model: db.RouteStop,
				as: "stops",
			},
		],
		where: Sequelize.literal(`
            EXISTS (SELECT 1 FROM route_stops WHERE routeId = Route.id AND stopOrder = 0 AND locationId = ${startLocationId})
            AND
            EXISTS (SELECT 1 FROM route_stops WHERE routeId = Route.id AND stopOrder = ${
				reversedLocationIds.length - 1
			} AND locationId = ${endLocationId})
        `),
	});

	// Check for exact match
	for (const route of potentialRoutes) {
		if (!route.stops) continue;
		const stops = route.stops.sort(
			(a: RouteStop, b: RouteStop) => a.stopOrder - b.stopOrder
		);
		const locationIds = stops.map((s: RouteStop) => s.locationId);

		if (
			JSON.stringify(locationIds) === JSON.stringify(reversedLocationIds)
		) {
			return route;
		}
	}

	// If not found, create new reverse route
	const transaction = await db.sequelize.transaction();
	try {
		const newRoute = await db.Route.create(
			{
				name: `${originalRoute.name} (Return)`,
				distance: originalRoute.distance ?? null,
				duration: originalRoute.duration ?? null,
				price: originalRoute.price ?? null,
			},
			{ transaction }
		);

		const routeStops = reversedLocationIds.map(
			(locationId: number, index: number) => ({
				routeId: newRoute.id,
				locationId,
				stopOrder: index,
			})
		);

		await db.RouteStop.bulkCreate(routeStops, { transaction });

		await transaction.commit();
		return (await getRouteById(newRoute.id))!;
	} catch (err) {
		await transaction.rollback();
		throw err;
	}
};
