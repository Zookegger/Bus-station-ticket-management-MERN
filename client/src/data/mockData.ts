// src/data/mockData.ts
import type {
  Order,
  DailyRevenue,
  TopRoute,
  WeeklyData,
  CancelData,
  VipCustomer,
  MonthlyComparison,
} from "@my-types/types";

export const mockOrders: Order[] = [
  {
    ticketId: "0208083-3343-449c-a8f6-9f51d14d5874",
    trip: "Thảo Cầm Viên Sài Gòn → Chợ Bến Thành",
    vehicle: "City Runner",
    customer: "Admin User",
    seat: "F12C1",
    price: 260000,
    bookingDate: "28/05/2025 19:06",
    status: "Paid",
  },
  {
    ticketId: "15c2-2606-6660-4543-abd5-8dbbcaca9e61",
    trip: "Hồ Tây → Bitexco Financial Tower",
    vehicle: "City Runner",
    customer: "Admin User",
    seat: "R2C3",
    price: 52000,
    bookingDate: "26/04/2025 13:00",
    status: "Paid",
  },
  {
    ticketId: "5d84-2575-3040-4a9a-b6bc-415d-77c3111",
    trip: "Thảo Cầm Viên Sài Gòn → Chợ Bến Thành",
    vehicle: "City Runner",
    customer: "Nguyễn Đức Trung",
    seat: "F1R1C2",
    price: 260000,
    bookingDate: "28/05/2025 18:39",
    status: "Paid",
  },
  {
    ticketId: "5f84d1fc-febe-4d92-8fe9-6a09501f971f",
    trip: "Hồ Tây → Bitexco Financial Tower",
    vehicle: "City Runner",
    customer: "Admin User",
    seat: "R3C1",
    price: 52000,
    bookingDate: "26/04/2025 13:11",
    status: "Cancelled",
  },
];

export const dailyRevenueData: DailyRevenue[] = [
  { date: "25/05/2025", revenue: 1200000 },
  { date: "26/05/2025", revenue: 1800000 },
  { date: "27/05/2025", revenue: 2200000 },
  { date: "28/05/2025", revenue: 3525300 },
  { date: "05/06/2025", revenue: 3025300 },
];

export const topRoutesData: TopRoute[] = [
  { route: "Thảo Cầm Viên Sài Gòn → Chợ Bến Thành", revenue: 2800000 },
  { route: "Hồ Tây → Bitexco Financial Tower", revenue: 520000 },
  { route: "Bến Nhà Rồng → Chợ Bến Thành", revenue: 260000 },
];

export const weeklyData: WeeklyData[] = [
  { day: "T2", revenue: 520000 },
  { day: "T3", revenue: 780000 },
  { day: "T4", revenue: 650000 },
  { day: "T5", revenue: 910000 },
  { day: "T6", revenue: 1300000 },
  { day: "T7", revenue: 1950000 },
  { day: "CN", revenue: 2210000 },
];

export const cancelData: CancelData[] = [
  { route: "SG → BT", cancelled: 2, total: 15 },
  { route: "HT → BX", cancelled: 1, total: 8 },
  { route: "BNR → BT", cancelled: 0, total: 5 },
];

export const vipData: VipCustomer[] = [
  { name: "Nguyễn Văn A", total: 5200000 },
  { name: "Trần Thị B", total: 3800000 },
  { name: "Lê Văn C", total: 2900000 },
  { name: "Phạm D", total: 1800000 },
  { name: "Hoàng E", total: 1200000 },
];

export const comparisonData: MonthlyComparison[] = [
  { month: "Tháng 4", current: 28500000, previous: 22100000 },
  { month: "Tháng 5", current: 35253000, previous: 28500000 },
];
