/**
 * Location service layer.
 *
 * Provides business logic for location management including CRUD operations,
 * validation, and data access. Handles database interactions through Sequelize ORM
 * and enforces business rules for location entities.
 */

import { Op } from "sequelize";
import db from "@models/index";
import { Location, LocationAttributes } from "@models/location";

/**
 * Configuration options for location listing and filtering.
 *
 * Defines all available parameters for advanced location queries,
 * including search, filtering, sorting, and pagination options.
 *
 * @property {string} [keywords] - Search term to filter location names and addresses (case-insensitive partial match)
 * @property {string} [orderBy="createdAt"] - Field to sort results by
 * @property {"ASC"|"DESC"} [sortOrder="DESC"] - Sort direction
 * @property {number} [page] - Page number for pagination (1-based)
 * @property {number} [limit] - Number of records per page
 * @property {string} [name] - Filter by specific location name
 * @property {string} [address] - Filter by specific address
 * @property {number} [long] - Filter by longitude coordinate
 * @property {number} [lat] - Filter by latitude coordinate
 */
interface ListOptions {
    keywords?: string;
    orderBy?: string;
    sortOrder?: "ASC" | "DESC";
    page?: number;
    limit?: number;
    name?: string;
    address?: string;
    long?: number;
    lat?: number;
}

/**
 * Retrieves a location by its unique identifier.
 *
 * @param id - Unique identifier of the location
 * @param attributes - Optional array of attributes to select (for performance optimization)
 * @returns Promise resolving to the location or null if not found
 */
export const getLocationById = async (
	id: number,
	...attributes: (keyof LocationAttributes)[]
): Promise<Location | null> => {
	return attributes && attributes.length > 0
		? await db.Location.findByPk(id, { attributes })
		: await db.Location.findByPk(id);
};

/**
 * Retrieves a location by its coordinates.
 *
 * Finds locations that match the exact longitude and latitude coordinates.
 *
 * @param x - Longitude coordinate
 * @param y - Latitude coordinate
 * @returns Promise resolving to locations matching the coordinates or null if not found
 * @throws {Object} Error with status 404 if no location found at coordinates
 */
export const getLocationByCoordinates = async (
	x: number,
	y: number
): Promise<{ rows: Location[]; count: number } | null> => {
	const location = db.Location.findAndCountAll({
		where: { [Op.and]: [{ longitude: x }, { latitude: y }] },
	});

    if (!location) throw { status: 404, message: "Location not found" }

    return location;
};

/**
 * Retrieves a paginated and filtered list of locations from the database.
 *
 * Provides comprehensive search capabilities including keyword filtering
 * across name and address fields, coordinate filtering, custom ordering, and pagination.
 * Uses Sequelize's findAndCountAll for efficient data retrieval with counts.
 *
 * @param options - Configuration options for filtering, sorting, and pagination:
 *   - keywords: Search term to filter location names and addresses (case-insensitive)
 *   - orderBy: Field to sort results by (default: "createdAt")
 *   - sortOrder: Sort direction "ASC" or "DESC" (default: "DESC")
 *   - page: Page number for pagination (1-based)
 *   - limit: Number of records per page
 *   - name: Filter by specific location name
 *   - address: Filter by specific address
 *   - long: Filter by longitude coordinate
 *   - lat: Filter by latitude coordinate
 * @returns Promise resolving to object containing:
 *   - rows: Array of Location records matching the criteria
 *   - count: Total number of records matching the filter (for pagination)
 * @throws {Error} When database query fails or invalid options provided
 *
 * @example
 * // Get first page of locations with keyword search
 * searchLocation({
 *   keywords: "downtown",
 *   page: 1,
 *   limit: 10,
 *   orderBy: "name",
 *   sortOrder: "ASC"
 * })
 */
export const searchLocation = async (options: ListOptions): Promise<{rows: Location[], count: number} | null> => {
    const {
        keywords = "",
        orderBy = "createdAt",
        sortOrder = "DESC",
        page,
        limit,
        name,
        address,
        long,
        lat,
    } = options;

    const where: any = {};

    if (keywords) {
        where[Op.or] = [
            { name: { [Op.like]: `%${keywords}%`} },
            { address: { [Op.like]: `%${keywords}%`} },
        ];
    }

    if (name) where.name = { [Op.like]: `%${keywords}%`}
    if (address) where.address = { [Op.like]: `%${keywords}%`}
    if (long) where.longitude = long;
    if (lat) where.latitude = lat;

    const queryOptions: any = {
        where: Object.keys(where).length > 0 ? where : undefined,
        order: [[orderBy, sortOrder]]
    };

    if (page !== undefined && limit !== undefined) {
        queryOptions.offset = (page - 1) * limit;
        queryOptions.limit = limit;
    }

    return await db.Location.findAndCountAll(queryOptions);
};
