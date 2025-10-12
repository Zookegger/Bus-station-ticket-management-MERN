/**
 * Data Transfer Object for creating a new Route.
 *
 * Used when receiving data from clients (e.g., API POST requests)
 * to create a new route record.
 *
 * @interface CreateRouteDTO
 * @property {number} startId - ID of the starting location.
 * @property {number} destinationId - ID of the destination location.
 * @property {number | null} [distance] - Distance of the route in kilometers.
 * @property {number | null} [duration] - Duration of the route in hours.
 * @property {number | null} [price] - Price of the route.
 */
export interface CreateRouteDTO {
	startId: number;
	destinationId: number;
	distance?: number | null;
	duration?: number | null;
	price?: number | null;
}

/**
 * Data Transfer Object for updating an existing Route.
 *
 * Used for PUT/PATCH requests where only specific fields may be modified.
 * The `id` is required to identify which record to update.
 *
 * @interface UpdateRouteDTO
 * @property {number} id - ID of the route to update.
 * @property {number} [startId] - Updated starting location ID.
 * @property {number} [destinationId] - Updated destination location ID.
 * @property {number | null} [distance] - Updated distance.
 * @property {number | null} [duration] - Updated duration.
 * @property {number | null} [price] - Updated price.
 */
export interface UpdateRouteDTO {
	id: number;
	startId?: number;
	destinationId?: number;
	distance?: number | null;
	duration?: number | null;
	price?: number | null;
}
