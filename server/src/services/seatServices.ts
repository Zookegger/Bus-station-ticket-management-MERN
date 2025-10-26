/**
 * Seat service layer.
 *
 * Provides business logic for seat management including retrieval and state updates.
 * Handles database interactions through Sequelize ORM and enforces business rules
 * for seat entities. Seat creation and deletion are not handled here as they occur
 * automatically during trip creation and are prohibited for data integrity.
 */

import db from "@models/index";
import { Seat } from "@models/seat";
import { UpdateSeatDTO, SeatFilterDTO, SeatStatus } from "@my_types/seat";

/**
 * Configuration options for seat listing and filtering.
 *
 * Defines all available parameters for advanced seat queries,
 * including filtering by trip, vehicle, availability, and pagination.
 *
 * @property {string} [orderBy="number"] - Field to sort results by
 * @property {"ASC"|"DESC"} [sortOrder="ASC"] - Sort direction
 * @property {number} [page] - Page number for pagination (1-based)
 * @property {number} [limit] - Number of records per page
 */
interface ListOptions {
	orderBy?: string;
	sortOrder?: "ASC" | "DESC";
	page?: number;
	limit?: number;
}

/**
 * Retrieves a seat by its unique identifier.
 *
 * @param id - Unique identifier of the seat
 * @returns Promise resolving to the seat or null if not found
 */
export const getSeatById = async (id: number): Promise<Seat | null> => {
	return await db.Seat.findByPk(id, {
		include: [
			{
				model: db.Trip,
				as: "trip",
				include: [
					{
						model: db.Vehicle,
						as: "vehicle",
						include: [
							{
								model: db.VehicleType,
								as: "vehicleType",
							},
						],
					},
					{
						model: db.Route,
						as: "route",
						include: [
							{
								model: db.Location,
								as: "startLocation",
							},
							{
								model: db.Location,
								as: "destinationLocation",
							},
						],
					},
				],
			},
		],
	});
};

/**
 * Retrieves seats based on filter criteria with optional pagination.
 *
 * Supports filtering by trip ID, vehicle ID, availability status, and active status.
 * Includes related trip, vehicle, and route information for comprehensive seat data.
 *
 * @param filters - Filter criteria for seats
 * @param options - Pagination and sorting options
 * @returns Promise resolving to object with seats array and total count
 */
export const searchSeats = async (
	filters: SeatFilterDTO,
	options: ListOptions = {}
): Promise<{ rows: Seat[]; count: number }> => {
	const { orderBy = "number", sortOrder = "ASC", page, limit } = options;

	const where: any = {};

	// Filter by seat lifecycle status (preferred)
	if (filters.status !== undefined) {
		where.status = filters.status;
	}

	// Filter by trip ID
	if (filters.tripId !== undefined) {
		where.tripId = filters.tripId;
	}

	const queryOptions: any = {
		where: Object.keys(where).length > 0 ? where : undefined,
		order: [[orderBy, sortOrder]],
		include: [
			{
				model: db.Trip,
				as: "trip",
				where:
					filters.vehicleId !== undefined
						? { vehicleId: filters.vehicleId }
						: undefined,
				required: filters.vehicleId !== undefined, // INNER JOIN when filtering by vehicleId
				include: [
					{
						model: db.Vehicle,
						as: "vehicle",
						include: [
							{
								model: db.VehicleType,
								as: "vehicleType",
							},
						],
					},
					{
						model: db.Route,
						as: "route",
						include: [
							{
								model: db.Location,
								as: "startLocation",
							},
							{
								model: db.Location,
								as: "destinationLocation",
							},
						],
					},
				],
			},
		],
	};

	// Add pagination if provided
	if (page !== undefined && limit !== undefined) {
		queryOptions.offset = (page - 1) * limit;
		queryOptions.limit = limit;
	}

	return await db.Seat.findAndCountAll(queryOptions);
};

/**
 * Updates an existing seat's state or assignment.
 *
 * Finds the seat by ID and applies the provided updates.
 * Only allows updating availability, active status, and trip assignment.
 * Validates that the seat exists and enforces business rules.
 *
 * @param id - Unique identifier of the seat to update
 * @param dto - Data transfer object containing update data
 * @returns Promise resolving to the updated seat
 * @throws {Object} Error with status 404 if seat not found
 * @throws {Object} Error with status 400 if attempting to assign to invalid trip
 */
export const updateSeat = async (
	id: number,
	dto: UpdateSeatDTO
): Promise<Seat | null> => {
	const seat = await getSeatById(id);

	if (!seat) {
		throw { status: 404, message: `No seat found with id ${id}` };
	}

	// If assigning to a trip, validate that the trip exists
	if (dto.tripId !== undefined && dto.tripId !== null) {
		const trip = await db.Trip.findByPk(dto.tripId);
		if (!trip) {
			throw { status: 400, message: `Invalid trip ID: ${dto.tripId}` };
		}
	}

	// If status is being set to 'available', ensure current status allows it
	if (dto.status === "available") {
		if (seat.status === SeatStatus.DISABLED || seat.status === SeatStatus.MAINTENANCE) {
			throw { status: 400, message: "Cannot mark a disabled/maintenance seat as available." };
		}
	}

	const allowed: any = {};
	if (dto.status !== undefined) allowed.status = dto.status;
	if (dto.tripId !== undefined) allowed.tripId = dto.tripId;

	await seat.update(allowed);
	return await getSeatById(id); // Return updated seat with associations
};
