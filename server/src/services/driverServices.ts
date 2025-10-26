/**
 * Driver service layer.
 *
 * Provides business logic for driver management including CRUD operations,
 * validation, and data access. Handles database interactions through Sequelize ORM
 * and enforces business rules for driver entities.
 */

import { Op } from "sequelize";
import db from "@models/index";
import { Driver, DriverAttributes } from "@models/driver";
import { CreateDriverDTO, UpdateDriverDTO } from "@my_types/driver";

/**
 * Configuration options for driver listing and filtering.
 *
 * Defines all available parameters for advanced driver queries,
 * including search, filtering, sorting, and pagination options.
 *
 * @property {string} [keywords] - Search term to filter drivers by fullname, phone number, or license number (case-insensitive partial match)
 * @property {string} [orderBy="createdAt"] - Field to sort results by
 * @property {"ASC"|"DESC"} [sortOrder="DESC"] - Sort direction
 * @property {number} [page] - Page number for pagination (1-based)
 * @property {number} [limit] - Number of records per page
 * @property {boolean} [isActive] - Filter by active status
 * @property {boolean} [isSuspended] - Filter by suspension status
 * @property {string} [licenseCategory] - Filter by license category
 * @property {Date} [hiredAfter] - Filter drivers hired after this date
 * @property {Date} [hiredBefore] - Filter drivers hired before this date
 */
interface ListOptions {
	keywords?: string;
	orderBy?: string;
	sortOrder?: "ASC" | "DESC";
	page?: number;
	limit?: number;
	isActive?: boolean;
	isSuspended?: boolean;
	licenseCategory?: string;
	hiredAfter?: Date;
	hiredBefore?: Date;
}

/**
 * Retrieves a driver by its unique identifier.
 *
 * @param id - Unique identifier of the driver
 * @param attributes - Optional array of attributes to select (for performance optimization)
 * @returns Promise resolving to the driver or null if not found
 */
export const getDriverById = async (
	id: number,
	...attributes: (keyof DriverAttributes)[]
): Promise<Driver | null> => {
	return attributes && attributes.length > 0
		? await db.Driver.findByPk(id, { attributes })
		: await db.Driver.findByPk(id);
};

/**
 * Retrieves a paginated and filtered list of drivers from the database.
 *
 * Provides comprehensive search capabilities including keyword filtering
 * across multiple fields, status filtering, date range filtering, custom ordering, and pagination.
 * Uses Sequelize's findAndCountAll for efficient data retrieval with counts.
 *
 * @param options - Configuration options for filtering, sorting, and pagination:
 *   - keywords: Search term to filter drivers by fullname, phone number, or license number (case-insensitive)
 *   - orderBy: Field to sort results by (default: "createdAt")
 *   - sortOrder: Sort direction "ASC" or "DESC" (default: "DESC")
 *   - page: Page number for pagination (1-based)
 *   - limit: Number of records per page
 *   - isActive: Filter by active employment status
 *   - isSuspended: Filter by license suspension status
 *   - licenseCategory: Filter by license category
 *   - hiredAfter: Filter drivers hired after this date
 *   - hiredBefore: Filter drivers hired before this date
 * @returns Promise resolving to object containing:
 *   - rows: Array of Driver records matching the criteria
 *   - count: Total number of records matching the filter (for pagination)
 * @throws {Error} When database query fails or invalid options provided
 *
 * @example
 * // Get first page of active drivers with keyword search
 * listDrivers({
 *   keywords: "John",
 *   isActive: true,
 *   page: 1,
 *   limit: 10,
 *   orderBy: "fullname",
 *   sortOrder: "ASC"
 * })
 */
export const listDrivers = async (
	options: ListOptions = {}
): Promise<{
	rows: Driver[];
	count: number;
}> => {
	const {
		keywords = "",
		orderBy = "createdAt",
		sortOrder = "DESC",
		page,
		limit,
		isActive,
		isSuspended,
		licenseCategory,
		hiredAfter,
		hiredBefore,
	} = options;

	// Build where conditions
	const where: any = {};

	// Keyword search on fullname, phoneNumber, and licenseNumber
	if (keywords) {
		where[Op.or] = [
			{ fullname: { [Op.like]: `%${keywords}%` } },
			{ phoneNumber: { [Op.like]: `%${keywords}%` } },
			{ licenseNumber: { [Op.like]: `%${keywords}%` } },
		];
	}

	// Status filters
	if (isActive !== undefined) {
		where.isActive = isActive;
	}

	if (isSuspended !== undefined) {
		where.isSuspended = isSuspended;
	}

	// License category filter
	if (licenseCategory) {
		where.licenseCategory = licenseCategory;
	}

	// Hire date range filters
	if (hiredAfter || hiredBefore) {
		where.hiredAt = {};
		if (hiredAfter) where.hiredAt[Op.gte] = hiredAfter;
		if (hiredBefore) where.hiredAt[Op.lte] = hiredBefore;
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

	return await db.Driver.findAndCountAll(queryOptions);
};

/**
 * Creates a new driver record.
 *
 * Validates that the driver doesn't already exist before creation.
 * Checks for duplicates based on fullname, license number, or phone number.
 * Throws an error if a duplicate driver is found.
 *
 * @param dto - Data transfer object containing driver creation data
 * @returns Promise resolving to the created driver
 * @throws {Object} Error with status 409 if driver already exists
 */
export const addDriver = async (
	dto: CreateDriverDTO
): Promise<Driver | null> => {
	const existing_driver = await db.Driver.findOne({
		where: {
			[Op.or]: [
				{ fullname: dto.fullname },
				{ licenseNumber: dto.licenseNumber },
				{ phoneNumber: dto.phoneNumber },
			],
		},
	});

	if (existing_driver) throw { status: 409, message: "Driver already exist." };
	
    const driver = await db.Driver.create(dto);
    return driver;
};

/**
 * Updates an existing driver record.
 *
 * Finds the driver by ID and applies the provided updates.
 * Only updates fields that are provided in the DTO.
 *
 * @param id - Unique identifier of the driver to update
 * @param dto - Data transfer object containing update data
 * @returns Promise resolving to the updated driver
 * @throws {Object} Error with status 404 if driver not found
 */
export const updateDriver = async (
	id: number,
	dto: UpdateDriverDTO
): Promise<Driver | null> => {
    const driver = await getDriverById(id);

    if (!driver) throw { status: 404 , message: `No driver found with id ${id}` };

    await driver.update(dto);
    return driver;
};

/**
 * Removes a driver record from the database.
 *
 * Permanently deletes the driver after verifying it exists.
 * Verifies deletion was successful by checking if driver still exists.
 * Consider adding cascade delete logic if drivers have dependencies.
 *
 * @param id - Unique identifier of the driver to remove
 * @returns Promise resolving when deletion is complete
 * @throws {Object} Error with status 404 if driver not found
 * @throws {Object} Error with status 500 if deletion verification fails
 */
export const deleteDriver = async (id: number): Promise<void> => {
    const driver = await getDriverById(id);
    if (!driver) throw { status: 404 , message: `No driver found with id ${id}` };

    await driver.destroy();

    // Verify deletion was successful
    const deletedDriver = await getDriverById(id);
    if (deletedDriver) {
        throw {
            status: 500,
            message: "Driver deletion failed - driver still exists."
        };
    }
};