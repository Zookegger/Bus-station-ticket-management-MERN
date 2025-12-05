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
	price: number;
	totalFloors: number;
	totalSeats: number;
	seatLayout: string;
	createdAt: string;
	updatedAt: string;
}

export type SeatType = "available" | "aisle" | "disabled" | "occupied";
export type SeatLayout = SeatType[][][];

/**
 * DTO for creating a new Vehicle Type.
 */
export interface CreateVehicleTypeDTO {
	name: string;
	price: number;
	totalFloors: number; 
	totalSeats: number;
	seatLayout: string;
}

/**
 * DTO for updating an existing Vehicle Type.
 */
export interface UpdateVehicleTypeDTO {
	id: number;
	name?: string;
	price?: number;
	totalFloors?: number;
	totalSeats?: number;
	seatLayout?: string;
}