export type Vehicle = {
  id: number;
  name: string;
  licensePlate: string;
  status: string;
  vehicleType: string;
};

export type VehicleDetail = {
  id: number;
  name: string;
  vehicleType: string;
  licensePlate: string;
  seatCapacity: number;
  status: string;
  acquiredDate: string;
  lastUpdated: string;
  description: string;
  fuelType: string;
  yearOfManufacture: number;
  insuranceExpiry: string;
  maintenanceSchedule: string;
};
