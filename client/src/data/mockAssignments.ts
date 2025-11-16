import { type AssignmentRecord } from "@my-types/assignment";

export const MOCK_ASSIGNMENTS: AssignmentRecord[] = [
  {
    id: "1",
    tripId: "t1",
    driverId: "1",
    driverName: "John Doe",
    vehicle: "59A-12345",
    assignedAt: "30/05/2025",
    status: "assigned",
  },
  {
    id: "2",
    tripId: "t2",
    driverId: "2",
    driverName: "John Doe",
    vehicle: "51H-67890",
    assignedAt: "22/05/2025",
    status: "completed",
  },
];
