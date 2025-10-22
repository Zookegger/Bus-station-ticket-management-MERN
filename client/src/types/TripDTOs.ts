export type TripItemDTO = {
	id: string; // Assuming UUID from API
	route: string;
	departure: string;
	arrival: string;
	price: string;
	status?: "Completed" | "Standby";
};

export type ApiTripDTO = {
	id: string;
	origin?: string;
	destination?: string;
	departureTime: string;
	arrivalTime: string;
	price: number;
	status?: string;
};