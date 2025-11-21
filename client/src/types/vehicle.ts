/**
 * Data Transfer Object for creating a new Vehicle.
 *
 * Used when receiving data from clients (e.g., API POST requests)
 * to create a new vehicle record.
 *
 * @interface CreateVehicleDTO
 * @property {string} numberPlate - Unique license plate number of the vehicle.
 * @property {number} vehicleTypeId - ID of the associated vehicle type.
 * @property {string | null} [manufacturer] - Manufacturer or brand of the vehicle.
 * @property {string | null} [model] - Model name or code of the vehicle.
 */
import type { VehicleType } from "./vehicleType";

/**
 * Client-side type definitions for Vehicles.
 * Based on server/src/types/vehicle.ts
 */

/**
 * Enum for the status of a vehicle.
 * @enum {string}
 * @property {string} ACTIVE - The vehicle is active and available for trips.
 * @property {string} INACTIVE - The vehicle is inactive and not available for trips.
 * @property {string} MAINTENANCE - The vehicle is under maintenance.
 */
export type VehicleStatus = typeof VehicleStatus[number];

export const VehicleStatus = ["ACTIVE", "INACTIVE", "MAINTENANCE", "BUSY"] as const;

/**
 * Represents a vehicle on the client-side.
 */
export interface Vehicle {
	id: number;
	numberPlate: string;
	vehicleTypeId: number;
	manufacturer?: string | null;
	model?: string | null;
	createdAt: string; // ISO Date string
	updatedAt: string; // ISO Date string
	vehicleType?: VehicleType;
}

/**
 * Data Transfer Object for creating a new Vehicle.
 *
 * Used when receiving data from clients (e.g., API POST requests)
 * to create a new vehicle record.
 *
 * @interface CreateVehicleDTO
 * @property {string} numberPlate - Unique license plate number of the vehicle.
 * @property {number} vehicleTypeId - ID of the associated vehicle type.
 * @property {string | null} [manufacturer] - Manufacturer or brand of the vehicle.
 * @property {string | null} [model] - Model name or code of the vehicle.
 */
export interface CreateVehicleDTO {
	numberPlate: string;
	status: VehicleStatus;
	vehicleTypeId: number;
	manufacturer?: string | null;
	model?: string | null;
}

/**
 * Data Transfer Object for updating an existing Vehicle.
 *
 * Used for PUT/PATCH requests where only specific fields may be modified.
 * The `id` is required to identify which record to update.
 *
 * @interface UpdateVehicleDTO
 * @property {number} id - ID of the vehicle to update.
 * @property {string} [numberPlate] - Updated license plate number.
 * @property {number} [vehicleTypeId] - Updated vehicle type ID.
 * @property {string | null} [manufacturer] - Updated manufacturer.
 * @property {string | null} [model] - Updated model.
 */
export interface UpdateVehicleDTO {
	id: number;
	numberPlate?: string;
	status?: VehicleStatus;
	vehicleTypeId?: number;
	manufacturer?: string | null;
	model?: string | null;
}

/**
 * Data Transfer Object for updating an existing Vehicle.
 *
 * Used for PUT/PATCH requests where only specific fields may be modified.
 * The `id` is required to identify which record to update.
 *
 * @interface UpdateVehicleDTO
 * @property {number} id - ID of the vehicle to update.
 * @property {string} [numberPlate] - Updated license plate number.
 * @property {number} [vehicleTypeId] - Updated vehicle type ID.
 * @property {string | null} [manufacturer] - Updated manufacturer.
 * @property {string | null} [model] - Updated model.
 */
export interface UpdateVehicleDTO {
	id: number;
	numberPlate?: string;
	vehicleTypeId?: number;
	manufacturer?: string | null;
	model?: string | null;
}
