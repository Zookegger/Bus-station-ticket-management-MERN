/**
 * Trip service layer.
 *
 * Provides business logic for trip management including CRUD operations,
 * validation, and data access. Handles database interactions through Sequelize ORM
 * and enforces business rules for trip entities.
 */

import { Op } from "sequelize";
import logger from "@utils/logger";
import db from "@models/index";
import { Trip } from "@models/trip";
import { CreateTripDTO, UpdateTripDTO } from "@my_types/trip";
import { SeatStatus } from "@my_types/seat";
import { VehicleType } from "@models/vehicleType";

/**
 * Generates seats for a trip based on vehicle type configuration.
 *
 * This function supports two seat generation modes:
 *
 * 1. **Detailed Layout Mode**: If `vehicleType.seatsPerFloor` is provided and valid,
 *    it is parsed as a matrix (array of arrays) representing each floor's seat arrangement.
 *    Each entry in the matrix is a row, and each value in the row is a seat position (truthy for seat, falsy for empty).
 *    - If `vehicleType.rowsPerFloor` is provided, it is validated against the number of rows in each floor's layout.
 *    - Seats are created at every truthy position, with row/column/floor info and a label (e.g., 'A1', 'B2').
 *
 * 2. **Simple Generation Mode**: If no detailed layout is provided, seats are generated using total seat count,
 *    total floors, and total columns. If `vehicleType.rowsPerFloor` is provided, it is used to determine the number
 *    of rows per floor; otherwise, rows are derived as `ceil(seatsOnFloor / totalColumns)`.
 *    - Seats are distributed in a grid (rows × columns) for each floor, with labels matching frontend expectations.
 *    - Stops placing seats when the quota for the floor is reached (handles partial rows).
 *
 * Both modes create seat records with proper numbering, layout positioning (row, column, floor), and associate them
 * with the given trip. The function ensures consistency with frontend seat map rendering and supports multi-floor vehicles.
 *
 * @param tripId - ID of the trip to generate seats for
 * @param vehicleType - Vehicle type containing seat layout configuration
 * @throws {Error} When seat generation fails or vehicle type lacks seat data
 */
async function generateSeatsForTrip(
	tripId: number,
	vehicleType: VehicleType
): Promise<void> {
	const seats: Array<{
		number: string;
		row?: number;
		column?: number;
		floor?: number;
		status: SeatStatus;
		reservedBy?: string | null;
		reservedUntil?: Date | null;
		tripId: number;
	}> = [];

	// Check if vehicle type has seat layout information
	if (!vehicleType.totalSeats || vehicleType.totalSeats <= 0) {
		throw {
			status: 400,
			message: `Vehicle type ${vehicleType.name} does not have seat layout configured.`,
		};
	}

	// Parse seat layout if available
	let seatsPerFloorLayout: any[][] | null = null;
	let rowsPerFloorConfig: number[] | null = null;

	if (vehicleType.seatsPerFloor) {
		try {
			const parsed = JSON.parse(vehicleType.seatsPerFloor);
			seatsPerFloorLayout = Array.isArray(parsed) ? parsed : null;
		} catch (e) {
			logger.warn(`Failed to parse seatsPerFloor for vehicle type ${vehicleType.name}`);
		}
	}

	if (vehicleType.rowsPerFloor) {
		try {
			const parsed = JSON.parse(vehicleType.rowsPerFloor);
			rowsPerFloorConfig = Array.isArray(parsed) 
				? parsed.map((r: any) => Number(r) || 0)
				: null;
		} catch (e) {
			logger.warn(`Failed to parse rowsPerFloor for vehicle type ${vehicleType.name}`);
		}
	}

	const totalFloors = vehicleType.totalFloors || 1;
	const totalColumns = vehicleType.totalColumns || 4;

	// Generate seats based on layout data
	if (seatsPerFloorLayout && Array.isArray(seatsPerFloorLayout)) {
		// Validate rowsPerFloorConfig against detailed layout if provided
		if (rowsPerFloorConfig && rowsPerFloorConfig.length > 0) {
			for (let floorIndex = 0; floorIndex < seatsPerFloorLayout.length; floorIndex++) {
				const floorData = seatsPerFloorLayout[floorIndex];
				if (Array.isArray(floorData)) {
					const actualRows = floorData.length;
					const expectedRows = rowsPerFloorConfig[floorIndex] || 0;
					if (expectedRows && actualRows !== expectedRows) {
						logger.warn(
							`rowsPerFloor mismatch on floor ${floorIndex + 1}: expected ${expectedRows}, layout has ${actualRows}`
						);
					}
				}
			}
		}

		// Use detailed layout data
		for (let floorIndex = 0; floorIndex < seatsPerFloorLayout.length; floorIndex++) {
			const floorData = seatsPerFloorLayout[floorIndex];
			const floor = floorIndex + 1;

			if (Array.isArray(floorData)) {
				// Floor data is an array of rows
				for (let rowIndex = 0; rowIndex < floorData.length; rowIndex++) {
					const rowData = floorData[rowIndex];
					const row = rowIndex + 1;

					if (Array.isArray(rowData)) {
						// Row data is an array of seat positions
						for (let colIndex = 0; colIndex < rowData.length; colIndex++) {
							const seatExists = rowData[colIndex];
							if (seatExists) {
								const column = colIndex + 1;
								seats.push({
									number: `${String.fromCharCode(64 + row)}${column}`,
									row,
									column,
									floor,
									status: SeatStatus.AVAILABLE,
									reservedBy: null,
									reservedUntil: null,
									tripId,
								});
							}
						}
					}
				}
			}
		}
	} else {
		// Simple seat generation based on total count
		const totalSeats = vehicleType.totalSeats;
		const seatsPerFloorCount = Math.ceil(totalSeats / totalFloors);

		// Build rowsPerFloorConfig if not provided: derive from seatsPerFloor and totalColumns
		const effectiveRowsPerFloor: number[] = rowsPerFloorConfig && rowsPerFloorConfig.length >= totalFloors
			? rowsPerFloorConfig.slice(0, totalFloors)
			: Array.from({ length: totalFloors }, (_, floorIdx) => {
					const seatsOnFloor = floorIdx === totalFloors - 1
						? totalSeats - seatsPerFloorCount * floorIdx
						: seatsPerFloorCount;
					return Math.ceil(seatsOnFloor / totalColumns);
			  });

		for (let floorIdx = 0; floorIdx < totalFloors; floorIdx++) {
			const floor = floorIdx + 1;
			const seatsOnThisFloor = floorIdx === totalFloors - 1
				? totalSeats - seatsPerFloorCount * floorIdx
				: seatsPerFloorCount;

			const rowsForThisFloor = effectiveRowsPerFloor[floorIdx] || Math.ceil(seatsOnThisFloor / totalColumns);
			const columnsForThisFloor = Math.ceil(seatsOnThisFloor / rowsForThisFloor);

			let placed = 0;
			for (let rowIdx = 0; rowIdx < rowsForThisFloor && placed < seatsOnThisFloor; rowIdx++) {
				const row = rowIdx + 1;
				for (let col = 1; col <= columnsForThisFloor && placed < seatsOnThisFloor; col++) {
					const seatLabel = `${String.fromCharCode(64 + row)}${col}`;
					const floorPrefix = totalFloors > 1 ? `F${floor}-` : "";

					const seatData: {
						number: string;
						row: number;
						column: number;
						floor?: number;
						status: SeatStatus;
						reservedBy: null;
						reservedUntil: null;
						tripId: number;
					} = {
						number: `${floorPrefix}${seatLabel}`,
						row,
						column: col,
						status: SeatStatus.AVAILABLE,
						reservedBy: null,
						reservedUntil: null,
						tripId,
					};

					if (totalFloors > 1) {
						seatData.floor = floor;
					}

					seats.push(seatData);
					placed++;
				}
			}
		}
	}

	// Bulk create seats
	if (seats.length > 0) {
		await db.Seat.bulkCreate(seats);
	}
}

/**
 * Configuration options for trip listing and filtering.
 *
 * Defines all available parameters for advanced trip queries,
 * including search, filtering, sorting, and pagination options.
 *
 * @property {string} [keywords] - Search term to filter trips (case-insensitive partial match)
 * @property {string} [orderBy="createdAt"] - Field to sort results by
 * @property {"ASC"|"DESC"} [sortOrder="DESC"] - Sort direction
 * @property {number} [page] - Page number for pagination (1-based)
 * @property {number} [limit] - Number of records per page
 * @property {number} [vehicleId] - Filter by vehicle ID
 * @property {number} [routeId] - Filter by route ID
 * @property {'Scheduled' | 'Departed' | 'Completed' | 'Cancelled'} [status] - Filter by trip status
 * @property {Date | string} [startDate] - Filter trips starting from this date
 * @property {Date | string} [endDate] - Filter trips ending before this date
 * @property {number} [minPrice] - Filter by minimum price
 * @property {number} [maxPrice] - Filter by maximum price
 */
interface ListOptions {
	keywords?: string;
	orderBy?: string;
	sortOrder?: "ASC" | "DESC";
	page?: number;
	limit?: number;
	vehicleId?: number;
	routeId?: number;
	status?: "Scheduled" | "Departed" | "Completed" | "Cancelled";
	startDate?: Date | string;
	endDate?: Date | string;
	minPrice?: number;
	maxPrice?: number;
}

/**
 * Retrieves a trip by its unique identifier.
 *
 * @param id - Unique identifier of the trip
 * @returns Promise resolving to the trip or null if not found
 */
export const getTripById = async (id: number): Promise<Trip | null> => {
	return await db.Trip.findByPk(id);
};

/**
 * Retrieves a paginated and filtered list of trips from the database.
 *
 * Provides comprehensive search capabilities including keyword filtering,
 * vehicle/route-based filtering, status filtering, date range filtering,
 * price range filtering, custom ordering, and pagination.
 * Uses Sequelize's findAndCountAll for efficient data retrieval with counts.
 *
 * @param options - Configuration options for filtering, sorting, and pagination:
 *   - keywords: Search term to filter trips
 *   - orderBy: Field to sort results by (default: "createdAt")
 *   - sortOrder: Sort direction "ASC" or "DESC" (default: "DESC")
 *   - page: Page number for pagination (1-based)
 *   - limit: Number of records per page
 *   - vehicleId: Filter by vehicle ID
 *   - routeId: Filter by route ID
 *   - status: Filter by trip status
 *   - startDate: Filter trips starting from this date
 *   - endDate: Filter trips ending before this date
 *   - minPrice: Filter by minimum price
 *   - maxPrice: Filter by maximum price
 * @returns Promise resolving to object containing:
 *   - rows: Array of Trip records matching the criteria
 *   - count: Total number of records matching the filter (for pagination)
 * @throws {Error} When database query fails or invalid options provided
 *
 * @example
 * // Get first page of scheduled trips for a specific vehicle
 * searchTrip({
 *   vehicleId: 5,
 *   status: 'Scheduled',
 *   page: 1,
 *   limit: 10,
 *   orderBy: "startTime",
 *   sortOrder: "ASC"
 * })
 */
export const searchTrip = async (
	options: ListOptions = {}
): Promise<{
	rows: Trip[];
	count: number;
}> => {
	const {
		orderBy = "createdAt",
		sortOrder = "DESC",
		page,
		limit,
		vehicleId,
		routeId,
		status,
		startDate,
		endDate,
		minPrice,
		maxPrice,
	} = options;

	const where: any = {};

	// Filter by vehicle
	if (vehicleId !== undefined) {
		where.vehicleId = vehicleId;
	}

	// Filter by route
	if (routeId !== undefined) {
		where.routeId = routeId;
	}

	// Filter by status
	if (status !== undefined) {
		where.status = status;
	}

	// Filter by date range
	if (startDate !== undefined || endDate !== undefined) {
		where.startTime = {};
		if (startDate !== undefined) {
			where.startTime[Op.gte] = new Date(startDate);
		}
		if (endDate !== undefined) {
			where.startTime[Op.lte] = new Date(endDate);
		}
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

	return await db.Trip.findAndCountAll(queryOptions);
};

/**
 * Creates a new trip record.
 *
 * Validates that the vehicle and route exist before creation.
 * Optionally validates that the vehicle is not already assigned to another trip
 * at the same time (implement as needed).
 *
 * @param dto - Data transfer object containing trip creation data
 * @returns Promise resolving to the created trip
 * @throws {Object} Error with status 400 if validation fails
 */
export const addTrip = async (dto: CreateTripDTO): Promise<Trip | null> => {
	// Validate that route exists
	const route = await db.Route.findByPk(dto.routeId);
	if (!route) {
		throw {
			status: 400,
			message: `Route with ID ${dto.routeId} does not exist.`,
		};
	}

	// Validate that startTime is in the future (optional business rule)
	const startTime = new Date(dto.startTime);
	if (startTime < new Date()) {
		throw {
			status: 400,
			message: "Start time must be in the future.",
		};
	}

	// Validate that endTime is after startTime if provided
	if (dto.endTime) {
		const endTime = new Date(dto.endTime);
		if (endTime <= startTime) {
			throw {
				status: 400,
				message: "End time must be after start time.",
			};
		}
	}

	// Validate that vehicle exists and has vehicle type with seat layout
	const vehicle = await db.Vehicle.findByPk(dto.vehicleId, {
		include: [
			{
				model: db.VehicleType,
				as: "vehicleType",
			},
		],
	});

	if (!vehicle) {
		throw {
			status: 400,
			message: `Vehicle with ID ${dto.vehicleId} does not exist.`,
		};
	}

	if (!vehicle.vehicleType) {
		throw {
			status: 400,
			message: `Vehicle ${dto.vehicleId} does not have an associated vehicle type.`,
		};
	}


	if (!route.price || !vehicle.vehicleType.price) {
		throw {
			status: 500,
			message: 'Route or Vehicle type is null'
		}
	}

	const total_price = route.price + vehicle.vehicleType.price; 

	// Convert date strings to Date objects for Sequelize
	const createData: CreateTripDTO = { ...dto };
	createData.startTime = new Date(dto.startTime);
	if (createData.endTime) {
		createData.endTime = new Date(createData.endTime);
	}
	createData.price = total_price;

	// Create trip
	const trip = await db.Trip.create(createData);

	// Generate seats based on vehicle type configuration
	await generateSeatsForTrip(trip.id, vehicle.vehicleType);

	return trip;
};

/**
 * Updates an existing trip record.
 *
 * Finds the trip by ID and applies the provided updates.
 * Only updates fields that are provided in the DTO.
 * Validates business rules like endTime > startTime.
 *
 * @param id - Unique identifier of the trip to update
 * @param dto - Data transfer object containing update data
 * @returns Promise resolving to the updated trip
 * @throws {Object} Error with status 404 if trip not found
 * @throws {Object} Error with status 400 if validation fails
 */
export const updateTrip = async (
	id: number,
	dto: UpdateTripDTO
): Promise<Trip | null> => {
	const trip = await getTripById(id);

	if (!trip) {
		throw { status: 404, message: `No trip found with id ${id}` };
	}

	// Validate vehicle exists if being updated
	if (dto.vehicleId !== undefined) {
		const vehicle = await db.Vehicle.findByPk(dto.vehicleId);
		if (!vehicle) {
			throw {
				status: 400,
				message: `Vehicle with ID ${dto.vehicleId} does not exist.`,
			};
		}
	}

	// Validate route exists if being updated
	if (dto.routeId !== undefined) {
		const route = await db.Route.findByPk(dto.routeId);
		if (!route) {
			throw {
				status: 400,
				message: `Route with ID ${dto.routeId} does not exist.`,
			};
		}
	}

	// Validate time constraints
	const newStartTime = dto.startTime
		? new Date(dto.startTime)
		: trip.startTime;
	const newEndTime = dto.endTime
		? new Date(dto.endTime)
		: trip.endTime
		? new Date(trip.endTime)
		: null;

	if (newEndTime && newEndTime <= newStartTime) {
		throw {
			status: 400,
			message: "End time must be after start time.",
		};
	}

	// Convert date strings to Date objects for Sequelize
	const updateData: any = { ...dto };
	if (updateData.startTime) {
		updateData.startTime = new Date(updateData.startTime);
	}
	if (updateData.endTime) {
		updateData.endTime = new Date(updateData.endTime);
	}

	await trip.update(updateData);
	return trip;
};

/**
 * Removes a trip record from the database.
 *
 * Permanently deletes the trip after verifying it exists.
 * Before deletion, releases all seats associated with the trip by setting
 * their tripId to null and making them available for reassignment.
 * Verifies deletion was successful by checking if trip still exists.
 *
 * @param id - Unique identifier of the trip to remove
 * @returns Promise resolving when deletion is complete
 * @throws {Object} Error with status 404 if trip not found
 * @throws {Object} Error with status 500 if deletion verification fails
 */
export const deleteTrip = async (id: number): Promise<void> => {
	const trip = await getTripById(id);

	if (!trip) {
		throw { status: 404, message: `No trip found with id ${id}` };
	}

	// Release all seats associated with this trip
	// Set tripId to null and mark seats available
	await db.Seat.update(
		{
			tripId: null,
			status: SeatStatus.AVAILABLE,
			reservedBy: null,
			reservedUntil: null,
		},
		{
			where: {
				tripId: id,
			},
		}
	);

	await trip.destroy();

	// Verify deletion was successful
	const deletedTrip = await getTripById(id);
	if (deletedTrip) {
		throw {
			status: 500,
			message: "Trip deletion failed - trip still exists.",
		};
	}
};
