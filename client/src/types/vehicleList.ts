/**
 * Type definitions for Vehicle List components, based on the server's Vehicle model.
 * These types represent the data structure used in vehicle listing and management interfaces.
 */

/**
 * Represents a Vehicle entity as returned from the server API.
 * This matches the server's VehicleAttributes interface.
 *
 * @interface Vehicle
 * @property {number} id - Unique identifier of the vehicle.
 * @property {string} numberPlate - Unique license plate number of the vehicle.
 * @property {number} vehicleTypeId - Foreign key referencing the vehicle type.
 * @property {string | null} [manufacturer] - Manufacturer or brand of the vehicle.
 * @property {string | null} [model] - Model name or code of the vehicle.
 * @property {string} [createdAt] - Timestamp when the vehicle record was created (ISO string).
 * @property {string} [updatedAt] - Timestamp when the vehicle record was last updated (ISO string).
 */
export interface Vehicle {
	id: number;
	numberPlate: string;
	vehicleTypeId: number;
	manufacturer?: string | null;
	model?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

/**
 * Represents a Vehicle with its associated VehicleType information populated.
 * Used when displaying vehicle details that include the vehicle type name.
 *
 * @interface VehicleWithType
 * @property {number} id - Unique identifier of the vehicle.
 * @property {string} numberPlate - Unique license plate number of the vehicle.
 * @property {number} vehicleTypeId - Foreign key referencing the vehicle type.
 * @property {string | null} [manufacturer] - Manufacturer or brand of the vehicle.
 * @property {string | null} [model] - Model name or code of the vehicle.
 * @property {string} [createdAt] - Timestamp when the vehicle record was created (ISO string).
 * @property {string} [updatedAt] - Timestamp when the vehicle record was last updated (ISO string).
 * @property {VehicleTypeSummary} vehicleType - The associated vehicle type details.
 */
export interface VehicleWithType extends Omit<Vehicle, 'vehicleTypeId'> {
	vehicleType: VehicleTypeSummary;
}

/**
 * Summary representation of a VehicleType for use in vehicle listings.
 * Contains only the essential information needed for display.
 *
 * @interface VehicleTypeSummary
 * @property {number} id - Unique identifier of the vehicle type.
 * @property {string} name - Display name of the vehicle type (e.g., "Luxury Bus").
 * @property {number | null} [price] - Base price associated with this vehicle type.
 * @property {number | null} [totalSeats] - Total seat count for this vehicle type.
 */
export interface VehicleTypeSummary {
	id: number;
	name: string;
	price?: number | null;
	totalSeats?: number | null;
}

/**
 * Extended vehicle information for detailed views.
 * Includes additional fields that might be populated from related data or calculations.
 *
 * @interface VehicleDetail
 * @property {number} id - Unique identifier of the vehicle.
 * @property {string} numberPlate - Unique license plate number of the vehicle.
 * @property {number} vehicleTypeId - Foreign key referencing the vehicle type.
 * @property {string | null} [manufacturer] - Manufacturer or brand of the vehicle.
 * @property {string | null} [model] - Model name or code of the vehicle.
 * @property {string} [createdAt] - Timestamp when the vehicle record was created (ISO string).
 * @property {string} [updatedAt] - Timestamp when the vehicle record was last updated (ISO string).
 * @property {VehicleTypeSummary} vehicleType - The associated vehicle type details.
 * @property {string} [status] - Current status of the vehicle (derived field).
 * @property {string} [displayName] - Human-readable name for the vehicle.
 */
export interface VehicleDetail extends VehicleWithType {
	status?: string;
	displayName?: string;
}

/**
 * Query parameters for filtering and sorting vehicle lists.
 *
 * @interface VehicleListQuery
 * @property {string} [search] - Search term for filtering vehicles.
 * @property {number} [vehicleTypeId] - Filter by specific vehicle type.
 * @property {string} [status] - Filter by vehicle status.
 * @property {number} [page] - Page number for pagination.
 * @property {number} [limit] - Number of items per page.
 * @property {string} [sortBy] - Field to sort by.
 * @property {'asc' | 'desc'} [sortOrder] - Sort direction.
 */
export interface VehicleListQuery {
	search?: string;
	vehicleTypeId?: number;
	status?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

/**
 * Response structure for paginated vehicle list API calls.
 *
 * @interface VehicleListResponse
 * @property {VehicleWithType[]} data - Array of vehicles with type information.
 * @property {number} total - Total number of vehicles matching the query.
 * @property {number} page - Current page number.
 * @property {number} limit - Number of items per page.
 * @property {number} totalPages - Total number of pages.
 */
export interface VehicleListResponse {
	data: VehicleWithType[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}