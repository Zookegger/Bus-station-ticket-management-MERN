/**
 * Vehicle service layer.
 *
 * Provides business logic for vehicle management including CRUD operations,
 * validation, and data access. Handles database interactions through Sequelize ORM
 * and enforces business rules for vehicle entities.
 */

import { Op } from "sequelize";
import db from "@models/index";
import { Vehicle, VehicleAttributes } from "@models/vehicle";
import { CreateVehicleDTO, UpdateVehicleDTO } from "@my_types/vehicle";

/**
 * Configuration options for vehicle listing and filtering.
 *
 * Defines all available parameters for advanced vehicle queries,
 * including search, filtering, sorting, and pagination options.
 *
 * @property {string} [keywords] - Search term to filter vehicles by number plate, vehicle type name, model, or manufacturer (case-insensitive partial match)
 * @property {string} [orderBy="createdAt"] - Field to sort results by
 * @property {"ASC"|"DESC"} [sortOrder="DESC"] - Sort direction
 * @property {number} [page] - Page number for pagination (1-based)
 * @property {number} [limit] - Number of records per page
 * @property {number} [vehicleTypeId] - Filter by specific vehicle type ID
 * @property {string} [manufacturer] - Filter by manufacturer name
 * @property {string} [model] - Filter by model name
 */
interface ListOptions {
	keywords?: string;
	orderBy?: string;
	sortOrder?: "ASC" | "DESC";
	page?: number;
	limit?: number;
	vehicleTypeId?: number;
	manufacturer?: string;
	model?: string;
}

/**
 * Retrieves a vehicle by its unique identifier.
 *
 * @param id - Unique identifier of the vehicle
 * @param attributes - Optional array of attributes to select (for performance optimization)
 * @returns Promise resolving to the vehicle or null if not found
 */
export const getVehicleById = async (
	id: number,
	...attributes: (keyof VehicleAttributes)[]
): Promise<Vehicle | null> => {
	return attributes && attributes.length > 0
		? await db.Vehicle.findByPk(id, { attributes })
		: await db.Vehicle.findByPk(id);
};

/**
 * Retrieves a paginated and filtered list of vehicles from the database.
 *
 * Provides comprehensive search capabilities including keyword filtering
 * across multiple fields, custom ordering, and pagination.
 * Uses Sequelize's findAndCountAll for efficient data retrieval with counts.
 *
 * @param options - Configuration options for filtering, sorting, and pagination:
 *   - keywords: Search term to filter vehicles by number plate, vehicle type name, model, or manufacturer (case-insensitive)
 *   - orderBy: Field to sort results by (default: "createdAt")
 *   - sortOrder: Sort direction "ASC" or "DESC" (default: "DESC")
 *   - page: Page number for pagination (1-based)
 *   - limit: Number of records per page
 *   - vehicleTypeId: Filter by specific vehicle type ID
 *   - manufacturer: Filter by manufacturer name
 *   - model: Filter by model name
 * @returns Promise resolving to object containing:
 *   - rows: Array of Vehicle records matching the criteria
 *   - count: Total number of records matching the filter (for pagination)
 * @throws {Error} When database query fails or invalid options provided
 *
 * @example
 * // Get first page of vehicles with keyword search
 * listVehicles({
 *   keywords: "ABC-123",
 *   page: 1,
 *   limit: 10,
 *   orderBy: "numberPlate",
 *   sortOrder: "ASC"
 * })
 */
export const listVehicles = async (
	options: ListOptions = {}
): Promise<{
	rows: Vehicle[];
	count: number;
}> => {
	const {
		keywords = "",
		orderBy = "createdAt",
		sortOrder = "DESC",
		page,
		limit,
		vehicleTypeId,
		manufacturer,
		model,
	} = options;

	const where: any = {};

	if (keywords) {
		where[Op.or] = [
			{ numberPlate: { [Op.like]: `%${keywords}%` } },
			{ "$VehicleType.name$": { [Op.like]: `%${keywords}%` } }, // If you have associations
			{ model: { [Op.like]: `%${keywords}%` } },
			{ manufacturer: { [Op.like]: `%${keywords}%` } },
		];
	}

	if (vehicleTypeId !== undefined) {
		where.vehicleTypeId = vehicleTypeId;
	}
	if (manufacturer) {
		where.manufacturer = { [Op.like]: `%${manufacturer}%` };
	}
	if (model) {
		where.model = { [Op.like]: `%${model}%` };
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

	return await db.Vehicle.findAndCountAll(queryOptions);
};

/**
 * Creates a new vehicle record.
 *
 * Validates that the vehicle number plate doesn't already exist before creation.
 * Throws an error if a duplicate number plate is found.
 *
 * @param dto - Data transfer object containing vehicle creation data
 * @returns Promise resolving to the created vehicle
 * @throws {Object} Error with status 400 if vehicle with number plate already exists
 */
export const addVehicle = async (
	dto: CreateVehicleDTO
): Promise<Vehicle | null> => {
	const existing_vehicle = await db.Vehicle.findOne({
		where: { numberPlate: dto.numberPlate },
	});

	if (existing_vehicle)
		throw {
			status: 400,
			message: "Vehicle with this number plate already exist.",
		};

	const vehicle = await db.Vehicle.create(dto);
	return vehicle;
};

/**
 * Updates an existing vehicle record.
 *
 * Finds the vehicle by ID and applies the provided updates.
 * Only updates fields that are provided in the DTO.
 *
 * @param id - Unique identifier of the vehicle to update
 * @param dto - Data transfer object containing update data
 * @returns Promise resolving to the updated vehicle
 * @throws {Object} Error with status 404 if vehicle not found
 */
export const updateVehicle = async (
	id: number,
	dto: UpdateVehicleDTO
): Promise<Vehicle | null> => {
	const vehicle = await getVehicleById(id);

	if (!vehicle)
		throw { status: 404, message: `No vehicle found with id ${id}` };

	await vehicle.update(dto);
	return vehicle;
};

/**
 * Removes a vehicle record from the database.
 *
 * Permanently deletes the vehicle after verifying it exists.
 * Verifies deletion was successful by checking if vehicle still exists.
 * Consider adding cascade delete logic if vehicles have dependencies.
 *
 * @param id - Unique identifier of the vehicle to remove
 * @returns Promise resolving when deletion is complete
 * @throws {Object} Error with status 404 if vehicle not found
 * @throws {Object} Error with status 500 if deletion verification fails
 */
export const removeVehicle = async (id: number): Promise<void> => {
	const vehicle = await getVehicleById(id);

	if (!vehicle)
		throw { status: 404, message: `No vehicle found with id ${id}` };

	await vehicle.destroy();

	// Verify deletion was successful
	const deletedVehicle = await getVehicleById(id);
	if (deletedVehicle) {
		throw {
			status: 500,
			message: "Vehicle deletion failed - vehicle still exists.",
		};
	}
};
