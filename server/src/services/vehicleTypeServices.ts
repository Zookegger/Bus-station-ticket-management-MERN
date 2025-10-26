/**
 * Vehicle type service layer.
 *
 * Provides business logic for vehicle type management including CRUD operations,
 * validation, and data access. Handles database interactions through Sequelize ORM
 * and enforces business rules for vehicle type entities.
 */

import { Op } from "sequelize";
import db from "@models/index";
import { VehicleType, VehicleTypeAttributes } from "@models/vehicleType";
import {
	CreateVehicleTypeDTO,
	UpdateVehicleTypeDTO,
} from "@my_types/vehicleType";

/**
 * Configuration options for vehicle type listing and filtering.
 *
 * Defines all available parameters for advanced vehicle type queries,
 * including search, filtering, sorting, and pagination options.
 *
 * @property {string} [keywords] - Search term to filter vehicle type names (case-insensitive partial match)
 * @property {string} [orderBy="createdAt"] - Field to sort results by
 * @property {"ASC"|"DESC"} [sortOrder="DESC"] - Sort direction
 * @property {number} [page] - Page number for pagination (1-based)
 * @property {number} [limit] - Number of records per page
 * @property {number} [minPrice] - Minimum price to filter by
 * @property {number} [maxPrice] - Maximum price to filter by
 * @property {number} [minSeats] - Minimum total seats to filter by
 * @property {number} [maxSeats] - Maximum total seats to filter by
 * @property {number} [minFloors] - Minimum number of floors to filter by
 * @property {number} [maxFloors] - Maximum number of floors to filter by
 */
interface ListOptions {
    keywords?: string;
    orderBy?: string;
    sortOrder?: "ASC" | "DESC";
    page?: number;
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
    minSeats?: number;
    maxSeats?: number;
    minFloors?: number;
    maxFloors?: number;
}

/**
 * Retrieves a vehicle type by its unique identifier.
 *
 * @param id - Unique identifier of the vehicle type
 * @param attributes - Optional array of attributes to select (for performance optimization)
 * @returns Promise resolving to the vehicle type or null if not found
 */
export const getVehicleTypeById = async (
	id: number,
	...attributes: (keyof VehicleTypeAttributes)[]
): Promise<VehicleType | null> => {
	return (attributes && attributes.length > 0) ? await db.VehicleType.findByPk(id, { attributes }) : await db.VehicleType.findByPk(id);
};

/**
 * Retrieves a paginated and filtered list of vehicle types from the database.
 *
 * Provides comprehensive search capabilities including keyword filtering,
 * range filtering for price, seats, and floors, custom ordering, and pagination.
 * Uses Sequelize's findAndCountAll for efficient data retrieval with counts.
 *
 * @param options - Configuration options for filtering, sorting, and pagination:
 *   - keywords: Search term to filter vehicle type names (case-insensitive)
 *   - orderBy: Field to sort results by (default: "createdAt")
 *   - sortOrder: Sort direction "ASC" or "DESC" (default: "DESC")
 *   - page: Page number for pagination (1-based)
 *   - limit: Number of records per page
 *   - minPrice: Minimum price to filter by
 *   - maxPrice: Maximum price to filter by
 *   - minSeats: Minimum total seats to filter by
 *   - maxSeats: Maximum total seats to filter by
 *   - minFloors: Minimum number of floors to filter by
 *   - maxFloors: Maximum number of floors to filter by
 * @returns Promise resolving to object containing:
 *   - rows: Array of VehicleType records matching the criteria
 *   - count: Total number of records matching the filter (for pagination)
 * @throws {Error} When database query fails or invalid options provided
 *
 * @example
 * // Get first page of vehicle types with price range
 * listVehicleTypes({
 *   keywords: "bus",
 *   minPrice: 100000,
 *   maxPrice: 200000,
 *   page: 1,
 *   limit: 10,
 *   orderBy: "name",
 *   sortOrder: "ASC"
 * })
 */
export const listVehicleTypes = async (options: ListOptions = {}
): Promise<{
	rows: VehicleType[];
	count: number;
}> => {
    const { 
        keywords = "", 
        orderBy = "createdAt", 
        sortOrder = "DESC",
        page,
        limit,
        minPrice,
        maxPrice,
        minSeats, 
        maxSeats,
        minFloors,
        maxFloors
    } = options;

	// Build where conditions
    const where: any = {};
    
    // Keyword search on name
    if (keywords) {
        where.name = { [Op.like]: `%${keywords}%` };
    }
    
    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price[Op.gte] = minPrice;
        if (maxPrice !== undefined) where.price[Op.lte] = maxPrice;
    }
    
    // Total seats range filter
    if (minSeats !== undefined || maxSeats !== undefined) {
        where.totalSeats = {};
        if (minSeats !== undefined) where.totalSeats[Op.gte] = minSeats;
        if (maxSeats !== undefined) where.totalSeats[Op.lte] = maxSeats;
    }
    
    // Total floors range filter
    if (minFloors !== undefined || maxFloors !== undefined) {
        where.totalFloors = {};
        if (minFloors !== undefined) where.totalFloors[Op.gte] = minFloors;
        if (maxFloors !== undefined) where.totalFloors[Op.lte] = maxFloors;
    }

    const queryOptions: any = {
        where: Object.keys(where).length > 0 ? where : undefined,
        order: [[orderBy, sortOrder]]
    };

    // Add pagination if provided
    if (page !== undefined && limit !== undefined) {
        queryOptions.offset = (page - 1) * limit;
        queryOptions.limit = limit;
    }

	return await db.VehicleType.findAndCountAll(queryOptions);
};

/**
 * Creates a new vehicle type record.
 *
 * Validates that the vehicle type name doesn't already exist before creation.
 * Throws an error if a duplicate name is found.
 *
 * @param dto - Data transfer object containing vehicle type creation data
 * @returns Promise resolving to the created vehicle type
 * @throws {Object} Error with status 409 if vehicle type already exists
 */
export const addVehicleType = async (
	dto: CreateVehicleTypeDTO
): Promise<VehicleType | null> => {
	const existing_vehicle_type = await db.VehicleType.findOne({
		where: {
			name: dto.name,
		},
	});

	if (existing_vehicle_type)
		throw { status: 409, message: "Vehicle type already exist." };

	const vehicle_type = await db.VehicleType.create(dto);
	return vehicle_type;
};

/**
 * Updates an existing vehicle type record.
 *
 * Finds the vehicle type by ID and applies the provided updates.
 * Only updates fields that are provided in the DTO.
 *
 * @param id - Unique identifier of the vehicle type to update
 * @param dto - Data transfer object containing update data
 * @returns Promise resolving to the updated vehicle type
 * @throws {Object} Error with status 404 if vehicle type not found
 */
export const updateVehicleType = async (
	id: number,
	dto: UpdateVehicleTypeDTO
): Promise<VehicleType | null> => {
	const vehicle_type = await getVehicleTypeById(id);

	if (!vehicle_type)
		throw { status: 404, message: `No vehicle type found with id ${id}` };

	await vehicle_type.update(dto);
	return vehicle_type;
};

/**
 * Removes a vehicle type record from the database.
 *
 * Permanently deletes the vehicle type after verifying it exists.
 * Verifies deletion was successful by checking if vehicle type still exists.
 * Consider adding cascade delete logic if vehicle types have dependencies.
 *
 * @param id - Unique identifier of the vehicle type to remove
 * @returns Promise resolving when deletion is complete
 * @throws {Object} Error with status 404 if vehicle type not found
 * @throws {Object} Error with status 500 if deletion verification fails
 */
export const removeVehicleType = async (id: number): Promise<void> => {
	const vehicle_type = await getVehicleTypeById(id);

	if (!vehicle_type)
		throw { status: 404, message: `No vehicle type found with id ${id}` };

	await vehicle_type.destroy();

	// Verify deletion was successful
	const deletedVehicleType = await getVehicleTypeById(id);
	if (deletedVehicleType) {
		throw {
			status: 500,
			message: "Vehicle type deletion failed - vehicle type still exists."
		};
	}
};
