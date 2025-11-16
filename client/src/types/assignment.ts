export interface TripRecord {
  id: string;
  startPoint: string;
  endPoint: string;
  startTime: string;
  endTime: string;
  date: string;
  vehicle?: string;
  status: "pending" | "assigned" | "completed" | "cancelled";
}

export interface AssignmentRecord {
  id: string;
  tripId: string;
  driverId: string;
  driverName: string;
  vehicle?: string;
  assignedAt: string;
  status: "assigned" | "completed" | "cancelled";
  trip?: TripRecord;
  driver?: {
    id: string;
    fullName: string;
    phone: string;
    rating: number;
  };
}
