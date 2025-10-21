export interface VehicleType {
  id: number;
  name: string;
  baseFare: number;
  totalSeats: number;
  totalFlooring: number;
  totalRow: number;
  totalColumn: number;
  description?: string;
}

export interface CreateVehicleTypeDTO {
  name: string;
  baseFare: number;
  totalSeats: number;
  totalFlooring: number;
  totalRow: number;
  totalColumn: number;
  description?: string;
}

export interface UpdateVehicleTypeDTO {
  name?: string;
  baseFare?: number;
  totalSeats?: number;
  totalFlooring?: number;
  totalRow?: number;
  totalColumn?: number;
  description?: string;
}

export interface Route {
  id: number;
  departure: string;
  destination: string;
  price: string;
}
