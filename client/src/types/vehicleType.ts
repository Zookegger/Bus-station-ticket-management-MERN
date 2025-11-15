/**
 * Client-side type definitions for Vehicle Types.
 * Based on server/src/types/vehicleType.ts
 */

/**
 * Represents a vehicle type on the client-side.
 */
export interface VehicleType {
	id: number;
	name: string;
	price?: number | null;
	totalFloors?: number | null;
	totalColumns?: number | null;
	totalSeats?: number | null;
	rowsPerFloor?: string | null; // JSON string
	seatsPerFloor?: string | null; // JSON string
	createdAt: string; // ISO Date string
	updatedAt: string; // ISO Date string
}

/**
 * DTO for creating a new Vehicle Type.
 */
export interface CreateVehicleTypeDTO {
	name: string;
	price?: number | null;
	totalFloors?: number | null;
	totalColumns?: number | null;
	totalSeats?: number | null;
	rowsPerFloor?: string | null; // JSON string
	seatsPerFloor?: string | null; // JSON string
}

/**
 * DTO for updating an existing Vehicle Type.
 */
export interface UpdateVehicleTypeDTO {
	name?: string;
	price?: number | null;
	totalFloors?: number | null;
	totalColumns?: number | null;
	totalSeats?: number | null;
	rowsPerFloor?: string | null; // JSON string
	seatsPerFloor?: string | null; // JSON string
}