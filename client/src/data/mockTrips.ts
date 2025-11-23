import { type TripRecord } from "@my-types/assignment";

export const MOCK_TRIPS: TripRecord[] = [
  {
    id: "t1",
    startPoint: "Hồ Tây → Vincom Mega Mall Royal City",
    endPoint: "Vincom Mega Mall Royal City",
    startTime: "06:30 PM",
    endTime: "06:40 PM",
    date: "30/05/2025",
    status: "assigned",
  },
  {
    id: "t2",
    startPoint: "Thảo Cầm Viên Sài Gòn → Chợ Bến Thành",
    endPoint: "Chợ Bến Thành",
    startTime: "05:00 PM",
    endTime: "06:00 PM",
    date: "22/05/2025",
    status: "assigned",
  },
  {
    id: "t3",
    startPoint: "Sân bay Tân Sơn Nhất → Bitexco",
    endPoint: "Bitexco",
    startTime: "08:00 AM",
    endTime: "08:45 AM",
    date: "01/06/2025",
    status: "pending",
  },
];
