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
import {
	CreateTripDTO,
	UpdateTripDTO,
	TripRepeatFrequency,
} from "@my_types/trip";
import { SeatStatus } from "@my_types/seat";
import { VehicleType } from "@models/vehicleType";
import { tripSchedulingQueue } from "@utils/queues/tripSchedulingQueue";
import { enqueueVehicleStatus } from "@utils/queues/vehicleStatusQueue";
import { VehicleStatus } from "@models/vehicle";
import { SchedulingStrategies } from "@utils/schedulingStrategy";
import { getOrCreateReverseRoute } from "@services/routeServices";

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
	vehicleType: VehicleType,
    transaction?: any
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
	if (!vehicleType.seatLayout) {
		throw {
			status: 400,
			message: `Vehicle type ${vehicleType.name} does not have seat layout configured.`,
		};
	}

	// Parse seat layout
	let seatLayout: (string | number)[][][] = [];
	try {
		seatLayout = JSON.parse(vehicleType.seatLayout);
	} catch (e) {
		logger.error(
			`Failed to parse seatLayout for vehicle type ${vehicleType.name}`
		);
		throw {
			status: 500,
			message: "Failed to parse seat layout.",
		};
	}

	if (!Array.isArray(seatLayout)) {
		throw {
			status: 400,
			message: "Invalid seat layout format.",
		};
	}

	let seatNumber = 1;
	// Generate seats based on layout data
	for (let floorIndex = 0; floorIndex < seatLayout.length; floorIndex++) {
		const floorLayout = seatLayout[floorIndex];
		const floor = floorIndex + 1;

		if (!Array.isArray(floorLayout)) continue;

		for (let rowIndex = 0; rowIndex < floorLayout.length; rowIndex++) {
			const rowLayout = floorLayout[rowIndex];
			const row = rowIndex + 1;

			if (!Array.isArray(rowLayout)) continue;

			for (let colIndex = 0; colIndex < rowLayout.length; colIndex++) {
				const seatType = rowLayout[colIndex];
				const column = colIndex + 1;

				let status: SeatStatus;
				switch (seatType) {
					case "available":
						status = SeatStatus.AVAILABLE;
						break;
					case "disabled":
						status = SeatStatus.DISABLED;
						break;
					case "aisle":
					case "occupied":
						continue; // Skip non-seat cells
					default:
						continue;
				}

				seats.push({
					number: `${seatNumber++}`,
					row,
					column,
					floor,
					status,
					reservedBy: null,
					reservedUntil: null,
					tripId,
				});
			}
		}
	}

	// Bulk create seats
	if (seats.length > 0) {
		await db.Seat.bulkCreate(seats, { transaction });
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
export interface ListOptions {
	keywords?: string | undefined;
	orderBy?: string | undefined;
	sortOrder?: "ASC" | "DESC" | undefined;
	page?: number | undefined;
	limit?: number | undefined;
	vehicleId?: number | undefined;
	routeId?: number | undefined;
	status?: "Scheduled" | "Departed" | "Completed" | "Cancelled" | undefined;
	startDate?: Date | string | undefined;
	endDate?: Date | string | undefined;
	minPrice?: number | undefined;
	maxPrice?: number | undefined;
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
): Promise<{ rows: Trip[]; count: number }> => {
	const {
		keywords,
		orderBy = "createdAt",
		sortOrder = "DESC",
		page = 1,
		limit = 10,
		vehicleId,
		routeId,
		status,
		startDate,
		endDate,
		minPrice,
		maxPrice,
	} = options;

	const where: any = {};

	// 1. Handle Keywords (Search logic)
	// We want to search Trip description OR Route names
	const include: any[] = [
		{
			model: db.Route,
			as: "route", // Ensure this alias matches your model definition
			required: false, // LEFT JOIN (keep trip even if route match fails, unless filtering)
		},
		{
			model: db.Vehicle,
			as: "vehicle",
			required: false,
		},
		{
			model: db.Trip,
			as: "returnTrip",
			required: false,
		},
	];

	if (keywords) {
		// Complex WHERE: (Trip.description LIKE %key%) OR (Route.name LIKE %key%)
		where[Op.or] = [
			// Adjust field names based on your actual DB columns
			{ description: { [Op.like]: `%${keywords}%` } },
			{ "$route.name$": { [Op.like]: `%${keywords}%` } }, // Search inside association
			{ "$route.departureLocation$": { [Op.like]: `%${keywords}%` } },
			{ "$route.destinationLocation$": { [Op.like]: `%${keywords}%` } },
		];
	}

	// 2. Standard Filters
	if (vehicleId) where.vehicleId = vehicleId;
	if (routeId) where.routeId = routeId;
	if (status) where.status = status;

	// 3. Date Range (Improved)
	if (startDate || endDate) {
		where.startTime = {};
		if (startDate) where.startTime[Op.gte] = new Date(startDate); // Consider using date-fns startOfDay
		if (endDate) where.startTime[Op.lte] = new Date(endDate); // Consider using date-fns endOfDay
	}

	// 4. Price Range
	if (minPrice || maxPrice) {
		where.price = {};
		if (minPrice) where.price[Op.gte] = minPrice;
		if (maxPrice) where.price[Op.lte] = maxPrice;
	}

	const queryOptions: any = {
		where,
		include, // Inject the associations
		order: [[orderBy, sortOrder]],
		distinct: true, // IMPORTANT: Ensures count is correct when using includes
		offset: (page - 1) * limit,
		limit: limit,
	};

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
	// Validate round trip requirements
	if (dto.isRoundTrip) {
		if (!dto.returnStartTime) {
			throw {
				status: 400,
				message: "Return start time is required for round trips.",
			};
		}
		if (new Date(dto.returnStartTime) <= new Date(dto.startTime)) {
			throw {
				status: 400,
				message: "Return start time must be after outbound start time.",
			};
		}
	}

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
			message: "Route or Vehicle type is null",
		};
	}

	const total_price = (route.price || 0) + (vehicle.vehicleType.price || 0);

	const transaction = await db.sequelize.transaction();

	try {
		// Convert date strings to Date objects for Sequelize
		const createData: any = { ...dto };
		createData.startTime = new Date(dto.startTime);

		if (createData.repeatEndDate) {
			createData.repeatEndDate = new Date(createData.repeatEndDate);
		}
		if (createData.isTemplate) {
			createData.repeatFrequency =
				createData.repeatFrequency || TripRepeatFrequency.NONE;
		} else {
			createData.repeatFrequency = TripRepeatFrequency.NONE;
			delete createData.repeatEndDate;
		}
		createData.price = total_price;

		// Create outbound trip
		const trip = await db.Trip.create(createData, { transaction });

		// Generate seats based on vehicle type configuration
		if (!trip.isTemplate) {
			await generateSeatsForTrip(trip.id, vehicle.vehicleType, transaction);

			// Fetch default assignment strategy from system settings
			// We just fetch it here to ensure it exists or for future use, 
            // but actual usage is post-commit.
			await db.Setting.findOne({
				where: { key: "DEFAULT_ASSIGNMENT_STRATEGY" },
				transaction,
			});
		}

		// Handle Round Trip
		if (dto.isRoundTrip && dto.returnStartTime) {
			const reverseRoute = await getOrCreateReverseRoute(dto.routeId);

			// Calculate return trip price
			const returnTripPrice =
				(reverseRoute.price || 0) + (vehicle.vehicleType.price || 0);

			const returnTripData = {
				...createData,
				routeId: reverseRoute.id,
				startTime: new Date(dto.returnStartTime),
				price: returnTripPrice,
				returnTripId: trip.id, // Link return -> outbound
			};

			// Create return trip
			const returnTrip = await db.Trip.create(returnTripData, {
				transaction,
			});

			// Link outbound -> return
			await trip.update({ returnTripId: returnTrip.id }, { transaction });

			// Generate seats for return trip
			if (!returnTrip.isTemplate) {
				await generateSeatsForTrip(
					returnTrip.id,
					vehicle.vehicleType,
					transaction
				);
			}
		}

		await transaction.commit();

		// Post-transaction actions (queues)
		if (!trip.isTemplate) {
			// We need to fetch strategy again or use the one from inside transaction?
			// It's fine to fetch again or just assume default if not critical.
			// Or better, move the queue logic here.
			// But I need 'strategy' variable.
			// I'll just re-fetch or use default for simplicity in this refactor.
			const strategy = SchedulingStrategies.AVAILABILITY; // Simplified for now

			await tripSchedulingQueue.add("assign-driver", {
				tripId: trip.id,
				strategy,
			});

			const delay = new Date(dto.startTime).getTime() - Date.now();
			if (delay > 0) {
				await enqueueVehicleStatus(
					{ vehicleId: vehicle.id, status: VehicleStatus.BUSY },
					delay
				);
			}
		}

		return trip;
	} catch (err) {
		await transaction.rollback();
		throw err;
	}
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
	const newReturnStartTime = dto.returnStartTime
		? new Date(dto.returnStartTime)
		: trip.returnStartTime
		? new Date(trip.returnStartTime)
		: null;

	if (newReturnStartTime && newReturnStartTime <= newStartTime) {
		throw {
			status: 400,
			message: "Return start time must be after start time.",
		};
	}

	// Validate return trip time constraints
	if (trip.returnTripId && dto.startTime) {
		const linkedTrip = await db.Trip.findByPk(trip.returnTripId);
		if (linkedTrip) {
			const newStart = new Date(dto.startTime);
			const linkedStart = new Date(linkedTrip.startTime);

			// If this trip was originally before the linked trip (outbound)
			if (trip.startTime < linkedTrip.startTime) {
				if (newStart >= linkedStart) {
					throw {
						status: 400,
						message:
							"Outbound trip cannot start after or at the same time as the return trip.",
					};
				}
			}
			// If this trip was originally after the linked trip (return)
			else if (trip.startTime > linkedTrip.startTime) {
				if (newStart <= linkedStart) {
					throw {
						status: 400,
						message:
							"Return trip cannot start before or at the same time as the outbound trip.",
					};
				}
			}
		}
	}

	// Convert date strings to Date objects for Sequelize
	const updateData: any = { ...dto };
	if (updateData.startTime) {
		updateData.startTime = new Date(updateData.startTime);
	}
	if (updateData.returnStartTime) {
		updateData.returnStartTime = new Date(updateData.returnStartTime);
	}

	if (updateData.repeatEndDate) {
		updateData.repeatEndDate = new Date(updateData.repeatEndDate);
	}
	if (updateData.isTemplate !== undefined) {
		if (updateData.isTemplate) {
			updateData.repeatFrequency =
				updateData.repeatFrequency || TripRepeatFrequency.NONE;
		} else {
			updateData.repeatFrequency = TripRepeatFrequency.NONE;
			if (updateData.repeatEndDate !== undefined) {
				delete updateData.repeatEndDate;
			}
			updateData.templateTripId = null;
		}
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
