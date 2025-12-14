/**
 * Trip service layer.
 *
 * Provides business logic for trip management including CRUD operations,
 * validation, and data access. Handles database interactions through Sequelize ORM
 * and enforces business rules for trip entities.
 */

import { Op, QueryTypes } from "sequelize";
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
import { TicketStatus } from "@my_types/ticket";
import { VehicleType } from "@models/vehicleType";
import { tripSchedulingQueue } from "@utils/queues/tripSchedulingQueue";
import { enqueueVehicleStatus } from "@utils/queues/vehicleStatusQueue";
import { VehicleStatus } from "@models/vehicle";
import { SchedulingStrategies } from "@utils/schedulingStrategy";
import { getOrCreateReverseRoute } from "@services/routeServices";
import * as paymentServices from "@services/paymentServices";
import { PaymentStatus } from "@my_types/payments";
import { Payment } from "@models/payment";
import { Ticket } from "@models/ticket";

/**
 * Generates seats for a trip based on vehicle type configuration.
 *
 * This function supports two seat generation modes:
 *
 * 1. **Detailed Layout Mode**: If `vehicleType.seatsPerFloor` is provided and valid,
 * it is parsed as a matrix (array of arrays) representing each floor's seat arrangement.
 * Each entry in the matrix is a row, and each value in the row is a seat position (truthy for seat, falsy for empty).
 * - If `vehicleType.rowsPerFloor` is provided, it is validated against the number of rows in each floor's layout.
 * - Seats are created at every truthy position, with row/column/floor info and a label (e.g., 'A1', 'B2').
 *
 * 2. **Simple Generation Mode**: If no detailed layout is provided, seats are generated using total seat count,
 * total floors, and total columns. If `vehicleType.rowsPerFloor` is provided, it is used to determine the number
 * of rows per floor; otherwise, rows are derived as `ceil(seatsOnFloor / totalColumns)`.
 * - Seats are distributed in a grid (rows × columns) for each floor, with labels matching frontend expectations.
 * - Stops placing seats when the quota for the floor is reached (handles partial rows).
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
	fromLocationId?: number | undefined;
	toLocationId?: number | undefined;
	date?: string;
	checkSeatAvailability?: boolean;
	minSeats?: number | undefined;
}

/**
 * Retrieves a trip by its unique identifier.
 *
 * @param id - Unique identifier of the trip
 * @returns Promise resolving to the trip or null if not found
 */
export const getTripById = async (id: number): Promise<Trip | null> => {
	return await db.Trip.findByPk(id, {
		include: [
			{
				model: db.Vehicle,
				as: "vehicle",
				include: [{ model: db.VehicleType, as: "vehicleType" }],
			},
			{
				model: db.Route,
				as: "route",
				include: [
					{
						model: db.RouteStop,
						as: "stops",
						include: [{ model: db.Location, as: "locations" }],
					},
				],
			},
			{ model: db.Seat, as: "seats" },
			{ model: db.Driver, as: "drivers" },
		],
	});
};

/**
 * Retrieves a paginated and filtered list of trips for ADMIN use.
 *
 * Focuses on operational data, allows filtering by all fields,
 * and does NOT perform dynamic price/time adjustments based on stops.
 */
export const searchTripsForAdmin = async (
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
	} = options;

	const where: any = {};

	// 1. Standard Filters
	if (vehicleId) where.vehicleId = vehicleId;
	if (routeId) where.routeId = routeId;
	if (status) where.status = status;

	// 2. Date Filters
	if (startDate || endDate) {
		where.startTime = {};
		if (startDate) where.startTime[Op.gte] = new Date(startDate);
		if (endDate) where.startTime[Op.lte] = new Date(endDate);
	}

	// 3. Price Filters
	if (minPrice || maxPrice) {
		where.price = {};
		if (minPrice) where.price[Op.gte] = minPrice;
		if (maxPrice) where.price[Op.lte] = maxPrice;
	}

	// 4. Keyword Search
	if (keywords) {
		where[Op.or] = [
			{ description: { [Op.like]: `%${keywords}%` } },
			{ "$route.name$": { [Op.like]: `%${keywords}%` } },
		];
	}

	// 5. Build Includes
	const include: any[] = [
		{
			model: db.Route,
			as: "route",
			required: true,
			include: [
				{
					model: db.RouteStop,
					as: "stops",
					include: [{ model: db.Location, as: "locations" }],
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
		{
			model: db.Driver,
			as: "drivers",
			required: false,
		},
		{
			model: db.Trip,
			as: "returnTrip",
			required: false,
			include: [
				{
					model: db.Route,
					as: "route",
				},
			],
		},
	];

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
 * Retrieves a list of trips for USER booking.
 *
 * Focuses on availability, dynamic pricing based on stops,
 * and strictly filters for scheduled trips with available seats.
 */
export const searchTripsForUser = async (
	options: ListOptions = {}
): Promise<{ rows: Trip[]; count: number }> => {
	const {
		fromLocation,
		toLocation,
		date,
		minPrice,
		maxPrice,
		vehicleTypeId,
		orderBy = "startTime",
		sortOrder = "ASC",
		page = 1,
		limit = 10,
		minSeats,
	} = options;

	// 1. Resolve partial location names to IDs
	let fromId = options.fromLocationId;
	if (!fromId && fromLocation) {
		if (!isNaN(Number(fromLocation))) {
			fromId = parseInt(fromLocation, 10);
		} else {
			const loc = await db.Location.findOne({
				where: { name: { [Op.like]: `%${fromLocation}%` } },
				attributes: ["id"],
			});
			fromId = loc?.id;
		}
	}

	let toId = options.toLocationId;
	if (!toId && toLocation) {
		if (!isNaN(Number(toLocation))) {
			toId = parseInt(toLocation, 10);
		} else {
			const loc = await db.Location.findOne({
				where: { name: { [Op.like]: `%${toLocation}%` } },
				attributes: ["id"],
			});
			toId = loc?.id;
		}
	}

	logger.debug(`Searching trips from ID: ${fromId} to ID: ${toId}`);

	const where: any = {
		status: TripStatus.SCHEDULED,
	};

	// 2. Filter for Available Seats (Fixes Pagination Bug)
	// We use a literal subquery instead of an INCLUDE to prevent row explosion
	// which breaks the LIMIT clause in Sequelize.
	const requiredSeats =
		typeof minSeats === "number" && minSeats > 0 ? minSeats : 1;
	const seatAvailabilityLiteral = db.sequelize.literal(
		`(SELECT COUNT(*) FROM seats WHERE seats.tripId = Trip.id AND seats.status = '${SeatStatus.AVAILABLE}') >= ${requiredSeats}`
	);

	// Ensure we don't overwrite other Op.and conditions if they exist later
	where[Op.and] = [seatAvailabilityLiteral];

	// Map to store route segment details for Post-Processing
	const routeSegmentMap = new Map<
		number,
		{
			originDur: number;
			originDist: number;
			destDur: number;
			destDist: number;
			ratio: number;
		}
	>();

	// -------------------------------------------------------------------------
	// 3. Dynamic Route & Price Filtering Logic
	// -------------------------------------------------------------------------
	if (fromId && toId) {
		const routes = (await db.sequelize.query(
			`
          SELECT 
             s1.routeId as "routeId",
             s1.durationFromStart as "originDur",
             s1.distanceFromStart as "originDist",
             s2.durationFromStart as "destDur",
             s2.distanceFromStart as "destDist",
             r.distance as "totalDist"
          FROM route_stops s1
          JOIN route_stops s2 ON s1.routeId = s2.routeId
          JOIN routes r ON s1.routeId = r.id
          WHERE s1.locationId = :fromId
            AND s2.locationId = :toId
            AND s1.stopOrder < s2.stopOrder
          `,
			{
				replacements: { fromId, toId },
				type: QueryTypes.SELECT,
			}
		)) as Array<{
			routeId: number;
			originDur: number;
			originDist: number;
			destDur: number;
			destDist: number;
			totalDist: number;
		}>;

		if (routes.length === 0) {
			return { rows: [], count: 0 };
		}

		const routeConditions: any[] = [];

		for (const r of routes) {
			const segmentDist = r.destDist - r.originDist;
			let ratio =
				r.totalDist > 0
					? Math.min(Math.max(segmentDist / r.totalDist, 0), 1.0)
					: 1.0;

			// Fallback: If ratio is 0 but we have a valid route distance, it implies missing stop distances.
			// Default to full price to avoid free tickets.
			if (ratio === 0 && r.totalDist > 0) {
				ratio = 1.0;
			}

			routeSegmentMap.set(r.routeId, {
				originDur: r.originDur,
				originDist: r.originDist,
				destDur: r.destDur,
				destDist: r.destDist,
				ratio,
			});

			const condition: any = { routeId: r.routeId };

			// Dynamic Price Filter
			if (minPrice || maxPrice) {
				condition.price = {};
				if (minPrice) condition.price[Op.gte] = minPrice / (ratio || 1);
				if (maxPrice) condition.price[Op.lte] = maxPrice / (ratio || 1);
			}

			// Dynamic Date Filter
			if (date) {
				const datePart =
					typeof date === "string"
						? date.substring(0, 10)
						: String(date).substring(0, 10);
				
				// Create date in local time (or assume input is YYYY-MM-DD)
				// We want to cover the full day in the server's timezone (or UTC if that's how it's stored)
				// Since the input is just a date string, we should construct the range carefully.
				// Using simple string concatenation for ISO format might assume UTC.
				
				const dayStart = new Date(`${datePart}T00:00:00`);
				const dayEnd = new Date(`${datePart}T23:59:59.999`);

				const shiftedStart = new Date(
					dayStart.getTime() - r.originDur * 60000
				);
				const shiftedEnd = new Date(
					dayEnd.getTime() - r.originDur * 60000
				);

				condition.startTime = {
					[Op.between]: [shiftedStart, shiftedEnd],
				};
			} else {
				const now = new Date();
				const minStartTime = new Date(
					now.getTime() - r.originDur * 60000
				);
				condition.startTime = { [Op.gte]: minStartTime };
			}

			routeConditions.push(condition);
		}

		where[Op.or] = routeConditions;
	} else {
		// Fallback Logic (Partial/No Location)
		if (fromId) {
			const validRoutes = await db.RouteStop.findAll({
				where: { locationId: fromId },
				attributes: ["routeId", "durationFromStart"],
			});
			if (validRoutes.length === 0) return { rows: [], count: 0 };

			const routeConditions = validRoutes.map((vr) => {
				const originDur = vr.durationFromStart || 0;
				routeSegmentMap.set(vr.routeId, {
					originDur,
					originDist: 0,
					destDur: 0,
					destDist: 0,
					ratio: 1,
				});

				const cond: any = { routeId: vr.routeId };
				if (date) {
					const datePart =
						typeof date === "string"
							? date.substring(0, 10)
							: String(date).substring(0, 10);
					const dayStart = new Date(`${datePart}T00:00:00`);
					const dayEnd = new Date(`${datePart}T23:59:59.999`);
					cond.startTime = {
						[Op.between]: [
							new Date(dayStart.getTime() - originDur * 60000),
							new Date(dayEnd.getTime() - originDur * 60000),
						],
					};
				} else {
					const now = new Date();
					cond.startTime = {
						[Op.gte]: new Date(now.getTime() - originDur * 60000),
					};
				}
				return cond;
			});
			where[Op.or] = routeConditions;

			if (minPrice || maxPrice) {
				where.price = {};
				if (minPrice) where.price[Op.gte] = minPrice;
				if (maxPrice) where.price[Op.lte] = maxPrice;
			}
		} else if (toId) {
			const validRoutes = await db.RouteStop.findAll({
				where: { locationId: toId },
				attributes: ["routeId"],
			});
			const ids = validRoutes.map((r) => r.routeId);
			if (ids.length === 0) return { rows: [], count: 0 };
			where.routeId = { [Op.in]: ids };

			if (date) {
				const datePart = String(date).substring(0, 10);
				where.startTime = {
					[Op.between]: [
						new Date(`${datePart}T00:00:00Z`),
						new Date(`${datePart}T23:59:59.999Z`),
					],
				};
			} else {
				where.startTime = { [Op.gte]: new Date() };
			}
			if (minPrice || maxPrice) {
				where.price = {};
				if (minPrice) where.price[Op.gte] = minPrice;
				if (maxPrice) where.price[Op.lte] = maxPrice;
			}
		} else {
			if (date) {
				const datePart = String(date).substring(0, 10);
				where.startTime = {
					[Op.between]: [
						new Date(`${datePart}T00:00:00Z`),
						new Date(`${datePart}T23:59:59.999Z`),
					],
				};
			} else {
				where.startTime = { [Op.gte]: new Date() };
			}
			if (minPrice || maxPrice) {
				where.price = {};
				if (minPrice) where.price[Op.gte] = minPrice;
				if (maxPrice) where.price[Op.lte] = maxPrice;
			}
		}
	}

	// 4. Build Includes
	// REMOVED: 'Seats' from this array to fix the pagination bug.
	const include: any[] = [
		{
			model: db.Route,
			as: "route",
			required: true,
			include: [
				{
					model: db.RouteStop,
					as: "stops",
					include: [{ model: db.Location, as: "locations" }],
				},
			],
		},
		{
			model: db.Vehicle,
			as: "vehicle",
			required: true,
			include: [
				{
					model: db.VehicleType,
					as: "vehicleType",
					...(vehicleTypeId ? { where: { id: vehicleTypeId } } : {}),
				},
			],
		},
		{
			model: db.Trip,
			as: "returnTrip",
			required: false,
			where: { status: "Scheduled" },
			include: [
				{
					model: db.Route,
					as: "route",
					include: [
						{
							model: db.RouteStop,
							as: "stops",
							include: [{ model: db.Location, as: "locations" }],
						},
					],
				},
				// We KEEP this for the return trip specifically so we don't return invalid return options
				{
					model: db.Seat,
					as: "seats",
					attributes: ["id"],
					where: { status: SeatStatus.AVAILABLE },
					required: false,
				},
			],
		},
	];

	const queryOptions: any = {
		where,
		include,
		order: [[orderBy, sortOrder]],
		distinct: true,
		offset: (page - 1) * limit,
		limit: limit,
	};

	const result = await db.Trip.findAndCountAll(queryOptions);

	// 5. Post-Processing: Update Display Values
	if (routeSegmentMap.size > 0 || (fromId && toId)) {
		result.rows.forEach((trip) => {
			// Filter invalid return trips (no seats)
			if (trip.returnTrip) {
				const returnSeats = (trip.returnTrip as any).seats;
				if (!returnSeats || returnSeats.length === 0) {
					trip.setDataValue("returnTrip" as any, null);
				}
			}

			const segment = routeSegmentMap.get(trip.routeId);

			// A. Update Main Trip Display
			if (segment) {
				const originalStart = new Date(trip.startTime);
				const newStartTime = new Date(
					originalStart.getTime() + segment.originDur * 60000
				);
				trip.setDataValue("startTime", newStartTime);

				const arrivalTime = new Date(
					originalStart.getTime() + segment.destDur * 60000
				);
				trip.setDataValue("arrivalTime" as any, arrivalTime);

				// if (segment.ratio !== 1 && fromId && toId) {
				// 	const originalPrice = Number(trip.price);
				// 	const newPrice = originalPrice * segment.ratio;
				// 	trip.setDataValue("price", parseFloat(newPrice.toFixed(2)));
				// }
			}

			// B. Update Return Trip Display
			if (trip.returnTrip && fromId && toId) {
				const returnRouteStops = trip.returnTrip.route?.stops || [];
				const returnStartStop = returnRouteStops.find(
					(s) => s.locationId === toId
				);
				const returnEndStop = returnRouteStops.find(
					(s) => s.locationId === fromId
				);

				if (returnStartStop && returnEndStop) {
					const retOriginDur = returnStartStop.durationFromStart || 0;
					const retDestDur = returnEndStop.durationFromStart || 0;

					const retOriginalStart = new Date(
						trip.returnTrip.startTime
					);
					const retNewStart = new Date(
						retOriginalStart.getTime() + retOriginDur * 60000
					);
					const retNewArrival = new Date(
						retOriginalStart.getTime() + retDestDur * 60000
					);

					trip.returnTrip.setDataValue("startTime", retNewStart);
					trip.returnTrip.setDataValue(
						"arrivalTime" as any,
						retNewArrival
					);

					const retTotalDist = trip.returnTrip.route?.distance || 0;
					const retSegDist =
						(returnEndStop.distanceFromStart || 0) -
						(returnStartStop.distanceFromStart || 0);

					let retRatio = 1;
					if (retTotalDist > 0) {
						retRatio = Math.min(
							Math.max(retSegDist / retTotalDist, 0),
							1.0
						);
						if (retRatio === 0) {
							retRatio = 1.0;
						}
					} else if (segment) {
						retRatio = segment.ratio;
					}

					// const retOriginalPrice = Number(trip.returnTrip.price);
					// const retNewPrice = retOriginalPrice * retRatio;
					// trip.returnTrip.setDataValue(
					// 	"price",
					// 	parseFloat(retNewPrice.toFixed(2))
					// );
				}
			}
		});
	}

	return result;
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

	const total_price =
		(Number(route.price) || 0) + (Number(vehicle.vehicleType.price) || 0);

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

/**
 * Cancels a trip and handles associated tickets.
 *
 * @param id - The ID of the trip to cancel.
 * @returns The cancelled trip.
 * @throws {Error} If the trip is not found or cannot be cancelled.
 */
export const cancelTrip = async (id: number): Promise<Trip> => {
	const transaction = await db.sequelize.transaction();
	try {
		const trip = await db.Trip.findByPk(id, {
			lock: transaction.LOCK.UPDATE,
			transaction,
		});

		if (!trip) {
			throw { status: 404, message: "Trip not found." };
		}

		if (
			trip.status === TripStatus.COMPLETED ||
			trip.status === TripStatus.CANCELLED
		) {
			throw { status: 400, message: `Trip is already ${trip.status}.` };
		}

		// Update trip status
		await trip.update({ status: TripStatus.CANCELLED }, { transaction });

		// Find all tickets associated with this trip
		const tickets = await db.Ticket.findAll({
			include: [
				{
					model: db.Seat,
					as: "seat",
					required: true,
					where: { tripId: id },
				},
				{
					model: db.Order,
					as: "order",
					include: [
						{
							model: db.Payment,
							as: "payment",
						},
					],
				},
			],
			lock: transaction.LOCK.UPDATE,
			transaction,
		});

		// Group tickets by orderId
		const ticketsByOrder = new Map<string, Ticket[]>();
		for (const ticket of tickets) {
			if (!ticketsByOrder.has(ticket.orderId)) {
				ticketsByOrder.set(ticket.orderId, []);
			}
			ticketsByOrder.get(ticket.orderId)?.push(ticket);
		}

		for (const [orderId, orderTickets] of ticketsByOrder) {
			const order = orderTickets[0]!.order; // All tickets have same order
			if (!order) continue;

			// Find completed payment
			// order.payment is likely an array due to hasMany
			const payments = order.payment as unknown as Payment[];
			const completedPayment = payments?.find(
				(p) => p.paymentStatus === PaymentStatus.COMPLETED
			);

			const bookedTickets = orderTickets.filter(
				(t) => t.status === TicketStatus.BOOKED
			);

			if (bookedTickets.length > 0 && completedPayment) {
				const refundAmount = bookedTickets.reduce(
					(sum, t) => sum + Number(t.finalPrice),
					0
				);

				if (refundAmount > 0) {
					try {
						await paymentServices.processRefund(
							{
								paymentId: completedPayment.id,
								amount: refundAmount,
								reason: `Trip ${id} cancelled`,
								performedBy: "System (Trip Cancellation)",
							},
							transaction
						);

						// Update tickets to REFUNDED
						await db.Ticket.update(
							{ status: TicketStatus.REFUNDED },
							{
								where: { id: bookedTickets.map((t) => t.id) },
								transaction,
							}
						);
					} catch (error) {
						logger.error(
							`Failed to refund order ${orderId} for trip ${id}:`,
							error
						);
						// If refund fails, we might still want to cancel the trip but log the error?
						// Or fail the whole transaction?
						// Failing the transaction ensures consistency.
						throw error;
					}
				}
			} else {
				// Just cancel tickets if not booked or no payment
				// (Already handled by loop below? No, I should handle it here)
				// Wait, the original code iterated all tickets.
			}

			// Update non-booked tickets to CANCELLED
			const otherTickets = orderTickets.filter(
				(t) => t.status !== TicketStatus.BOOKED
			);
			if (otherTickets.length > 0) {
				await db.Ticket.update(
					{ status: TicketStatus.CANCELLED },
					{
						where: { id: otherTickets.map((t) => t.id) },
						transaction,
					}
				);
			}
		}

		await transaction.commit();
		return trip;
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
};
