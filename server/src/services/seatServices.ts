/**
 * Seat service layer.
 *
 * Provides business logic for seat management including retrieval and state updates.
 * Handles database interactions through Sequelize ORM and enforces business rules
 * for seat entities. Seat creation and deletion are not handled here as they occur
 * automatically during trip creation and are prohibited for data integrity.
 */

import { Op } from "sequelize";
import db from "../models";
import { Seat, SeatAttributes } from "../models/seat";
import { UpdateSeatDTO, SeatFilterDTO } from "../types/seat";

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
export const getSeatById = async (
	id: number
): Promise<Seat | null> => {
	return await db.seat.findByPk(id, {
		include: [
			{
				model: db.trip,
				as: "trip",
				include: [
					{
						model: db.vehicle,
						as: "vehicle",
						include: [
							{
								model: db.vehicleType,
								as: "vehicleType"
							}
						]
					},
					{
						model: db.route,
						as: "route",
						include: [
							{
								model: db.location,
								as: "startLocation"
							},
							{
								model: db.location,
								as: "destinationLocation"
							}
						]
					}
				]
			}
		]
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
	const {
		orderBy = "number",
		sortOrder = "ASC",
		page,
		limit
	} = options;

	const where: any = {};

	// Filter by availability status
	if (filters.isAvailable !== undefined) {
		where.isAvailable = filters.isAvailable;
	}

	// Filter by active status
	if (filters.isActive !== undefined) {
		where.isActive = filters.isActive;
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
				model: db.trip,
				as: "trip",
				where: filters.vehicleId !== undefined ? { vehicleId: filters.vehicleId } : undefined,
				required: filters.vehicleId !== undefined, // INNER JOIN when filtering by vehicleId
				include: [
					{
						model: db.vehicle,
						as: "vehicle",
						include: [
							{
								model: db.vehicleType,
								as: "vehicleType"
							}
						]
					},
					{
						model: db.route,
						as: "route",
						include: [
							{
								model: db.location,
								as: "startLocation"
							},
							{
								model: db.location,
								as: "destinationLocation"
							}
						]
					}
				]
			}
		]
	};

	// Add pagination if provided
	if (page !== undefined && limit !== undefined) {
		queryOptions.offset = (page - 1) * limit;
		queryOptions.limit = limit;
	}

	return await db.seat.findAndCountAll(queryOptions);
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
		const trip = await db.trip.findByPk(dto.tripId);
		if (!trip) {
			throw { status: 400, message: `Invalid trip ID: ${dto.tripId}` };
		}
	}

	// Business rule: Only active seats can be made available
	if (dto.isAvailable === true && dto.isActive === false) {
		throw {
			status: 400,
			message: "Cannot make an inactive seat available. Activate the seat first."
		};
	}

	await seat.update(dto);
	return await getSeatById(id); // Return updated seat with associations
};