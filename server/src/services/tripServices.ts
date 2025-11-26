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
	TripStatus,
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
	vehicleTypeId?: number | undefined;
	routeId?: number | undefined;
	status?: "Scheduled" | "Departed" | "Completed" | "Cancelled" | undefined;
	startDate?: Date | string | undefined;
	endDate?: Date | string | undefined;
	minPrice?: number | undefined;
	maxPrice?: number | undefined;
	fromLocation?: string; // Mapped from 'from'
	toLocation?: string; // Mapped from 'to'
	date?: string;
	checkSeatAvailability?: boolean;
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
		vehicleTypeId,
		routeId,
		status,
		startDate,
		endDate,
		minPrice,
		maxPrice,
		fromLocation,
		toLocation,
		date,
		checkSeatAvailability = false,
		// minSeats = 1,
	} = options;

	const where: any = {};

	// --- 1. Route Filtering Logic (The Fix) ---
	// If from/to locations are provided, we must first find which Routes match.
	let validRouteIds: number[] | null = null;

	if (fromLocation || toLocation) {
		// Find all stops that match the 'From' location
		const fromStops = fromLocation
			? await db.RouteStop.findAll({
					include: [
						{
							model: db.Location,
							as: "location",
							where: { name: { [Op.like]: `%${fromLocation}%` } },
						},
					],
					attributes: ["routeId", "stopOrder"],
			  })
			: null;

		// Find all stops that match the 'To' location
		const toStops = toLocation
			? await db.RouteStop.findAll({
					include: [
						{
							model: db.Location,
							as: "location",
							where: { name: { [Op.like]: `%${toLocation}%` } },
						},
					],
					attributes: ["routeId", "stopOrder"],
			  })
			: null;

		const matchedIds = new Set<number>();

		if (fromLocation && toLocation && fromStops && toStops) {
			// If BOTH provided, Route must have both stops AND From.Order < To.Order
			fromStops.forEach((fs) => {
				// Is there a corresponding 'To' stop on the same route with a higher order?
				const hasValidDest = toStops.some(
					(ts) =>
						ts.routeId === fs.routeId && ts.stopOrder > fs.stopOrder
				);
				if (hasValidDest) matchedIds.add(fs.routeId);
			});
		} else if (fromLocation && fromStops) {
			// Only From provided
			fromStops.forEach((fs) => matchedIds.add(fs.routeId));
		} else if (toLocation && toStops) {
			// Only To provided
			toStops.forEach((ts) => matchedIds.add(ts.routeId));
		}

		validRouteIds = Array.from(matchedIds);

		// If we filtered by location but found NO routes, return empty immediately
		if (validRouteIds.length === 0) {
			return { rows: [], count: 0 };
		}
	}

	// Apply the Route ID filter to the main query
	if (validRouteIds !== null) {
		where.routeId = { [Op.in]: validRouteIds };
	}
	// --------------------------------------------

	// 2. Standard Filters
	if (vehicleId) where.vehicleId = vehicleId;
	if (routeId) where.routeId = routeId; // Note: This might conflict with location filter if user sends both
	if (status) where.status = status;

	// 3. Date Filters
	if (date) {
		const targetDate = new Date(date);
		const nextDay = new Date(targetDate);
		nextDay.setDate(targetDate.getDate() + 1);
		where.startTime = {
			[Op.gte]: targetDate,
			[Op.lt]: nextDay,
		};
	} else if (startDate || endDate) {
		where.startTime = {};
		if (startDate) where.startTime[Op.gte] = new Date(startDate);
		if (endDate) where.startTime[Op.lte] = new Date(endDate);
	}

	// 4. Price Filters
	if (minPrice || maxPrice) {
		where.price = {};
		if (minPrice) where.price[Op.gte] = minPrice;
		if (maxPrice) where.price[Op.lte] = maxPrice;
	}

	// 5. Keyword Search (Updated to remove invalid columns)
	if (keywords) {
		where[Op.or] = [
			{ description: { [Op.like]: `%${keywords}%` } },
			// We can search Route Name via Association (see include below)
			{ "$route.name$": { [Op.like]: `%${keywords}%` } },
		];
	}

	// 6. Build Includes
	const include: any[] = [
		{
			model: db.Route,
			as: "route",
			required: true, // Required for keyword search on route name
			include: [
				// Optional: Include stops to display location names in result
				{
					model: db.RouteStop,
					as: "stops",
					include: [{ model: db.Location, as: "location" }],
				},
			],
		},
		{
			model: db.Vehicle,
			as: "vehicle",
			required: false,
			include: [
				{
					model: db.VehicleType,
					as: "vehicleType",
					...(vehicleTypeId ? { where: { id: vehicleTypeId } } : {}),
				},
			],
			...(vehicleTypeId ? { required: true } : {}),
		},
	];

	// 7. Seat Availability (Pure Sequelize)
	if (checkSeatAvailability) {
		include.push({
			model: db.Seat,
			as: "seats",
			attributes: [],
			where: { status: SeatStatus.AVAILABLE },
			required: true, // INNER JOIN: Filters out trips with 0 seats
			duplicating: false,
		});
	}

	// Return Trip Include
	include.push({
		model: db.Trip,
		as: "returnTrip",
		required: false,
		...(status ? { where: { status } } : {}),
		include: [
			{
				model: db.Route,
				as: "route",
				include: [
					{ model: db.RouteStop, as: "stops", include: ["location"] },
				],
			},
			...(checkSeatAvailability
				? [
						{
							model: db.Seat,
							as: "seats",
							attributes: [],
							where: { status: SeatStatus.AVAILABLE },
							required: true, // If return trip exists, it must have seats
						},
				  ]
				: []),
		],
	});

	const queryOptions: any = {
		where,
		include,
		order: [[orderBy, sortOrder]],
		distinct: true,
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
	let trip: Trip;

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
		trip = await db.Trip.create(createData, { transaction });

		// Generate seats based on vehicle type configuration
		if (!trip.isTemplate) {
			await generateSeatsForTrip(
				trip.id,
				vehicle.vehicleType,
				transaction
			);

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
				returnStartTime: null,
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
	} catch (err) {
		await transaction.rollback();
		throw err;
	}

	// Post-transaction actions (queues).
	// These are separated so that a failure here doesn't roll back the created trip.
	try {
		const tripsToProcess = [trip];
		if (trip.returnTripId) {
			const returnTrip = await db.Trip.findByPk(trip.returnTripId);
			if (returnTrip) tripsToProcess.push(returnTrip);
		}

		// Process Queues for ALL involved trips (Outbound + Return)
		for (const t of tripsToProcess) {
			if (!t.isTemplate) {
				// 1. Trigger Auto Driver Assignment
				const strategy = SchedulingStrategies.AVAILABILITY;
				await tripSchedulingQueue.add("assign-driver", {
					tripId: t.id,
					strategy,
				});

				// 2. Update Vehicle Status (Busy)
				const delay = new Date(t.startTime).getTime() - Date.now();
				if (delay > 0) {
					await enqueueVehicleStatus(
						{ vehicleId: t.vehicleId, status: VehicleStatus.BUSY },
						delay
					);
				}
			}
		}
	} catch (queueError) {
		// Log the error, but don't throw, as the trip is already created.
		// A monitoring system should watch for queue failures.
		logger.error(
			`Failed to enqueue post-trip-creation tasks for trip ID ${trip.id}:`,
			queueError
		);
	}

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

	const transaction = await db.sequelize.transaction();
	try {
		// 1. Update the Outbound Trip inside transaction
		await trip.update(updateData, { transaction });

		// 2. Propagate to Return Trip if exists
		if (trip.returnTripId) {
			const returnTripUpdateData: any = {};

			// If user changed the explicit return time, update the linked trip's startTime
			if (dto.returnStartTime) {
				returnTripUpdateData.startTime = new Date(dto.returnStartTime);
			}

			// If user changed vehicle, propagate to return trip (common case)
			if (dto.vehicleId !== undefined) {
				returnTripUpdateData.vehicleId = dto.vehicleId;
			}

			// If user cancelled the outbound, propagate cancellation to return trip
			if (dto.status === TripStatus.CANCELLED) {
				returnTripUpdateData.status = TripStatus.CANCELLED;
			}

			if (Object.keys(returnTripUpdateData).length > 0) {
				await db.Trip.update(returnTripUpdateData, {
					where: { id: trip.returnTripId },
					transaction,
				});
			}
		}

		await transaction.commit();

		// Return fresh trip data after commit
		return await trip.reload();
	} catch (err) {
		await transaction.rollback();
		throw err;
	}
};

/**
 * Removes a trip record from the database.
 *
 * Permanently deletes the trip after verifying it exists.
 * If the trip has a linked return trip, that return trip is also deleted.
 * Releases all seats associated with both trips.
 *
 * @param id - Unique identifier of the trip to remove
 * @returns Promise resolving when deletion is complete
 * @throws {Object} Error with status 404 if trip not found
 */
export const deleteTrip = async (id: number): Promise<void> => {
	// 1. Fetch the trip to check for links
	const trip = await getTripById(id);

	if (!trip) {
		throw { status: 404, message: `No trip found with id ${id}` };
	}

	// Prevent deletion if there are any booked seats for this trip
	const hasBookedSeat = trip.seats?.some(
		(s) => s.status === SeatStatus.BOOKED
	);
	if (hasBookedSeat) {
		throw {
			status: 409,
			message:
				"Trip has active bookings and cannot be deleted. Refund bookings or wait until the trip is completed before deleting.",
		};
	}

	const transaction = await db.sequelize.transaction();

	try {
		// 2. Define a list of Trip IDs to delete (Current Trip + Linked Return Trip)
		const tripIdsToDelete = [id];

		if (trip.returnTripId) {
			tripIdsToDelete.push(trip.returnTripId);
		}

		// 3. Release/Destroy Seats for ALL involved trips
		await db.Seat.destroy({
			where: {
				tripId: { [Op.in]: tripIdsToDelete },
			},
			transaction,
		});

		// 4. Delete the Trips
		await db.Trip.destroy({
			where: {
				id: { [Op.in]: tripIdsToDelete },
			},
			transaction,
		});

		await transaction.commit();

		// 5. Verify deletion (Optional, but good for safety)
		const check = await db.Trip.count({ where: { id } });
		if (check > 0) {
			throw { status: 500, message: "Trip deletion failed." };
		}
	} catch (err) {
		await transaction.rollback();
		throw err;
	}
};
