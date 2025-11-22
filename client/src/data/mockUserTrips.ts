// src/data/mockUserTrips.ts

import type { UserTrip } from "@my-types/userTrip";

export const mockUserTrips: UserTrip[] = [
  {
    id: "trip_001",
    from: "Quận 1, TP.HCM",
    to: "Sân bay Tân Sơn Nhất",
    fromShort: "Q1",
    toShort: "TSN",
    departureTime: "2025-11-20T14:30:00",
    arrivalTime: "2025-11-20T15:10:00",
    price: 285000,
    driverName: "Nguyễn Văn Hùng",
    driverPhone: "0908 123 456",
    vehiclePlate: "51H-12345",
    vehicleType: "Toyota Camry",
    status: "COMPLETED",
    hasRated: true,
    rating: 5,
    ratingId: "rating_101",
  },
  {
    id: "trip_002",
    from: "Gò Vấp, TP.HCM",
    to: "Quận 7, TP.HCM",
    departureTime: "2025-11-21T08:00:00",
    price: 195000,
    driverName: "Trần Thị Lan",
    driverPhone: "0912 345 678",
    vehiclePlate: "51G-67890",
    vehicleType: "Honda CR-V",
    status: "COMPLETED",
    hasRated: false, // ← Người dùng chưa đánh giá → hiện nút "Đánh giá ngay"
  },
  {
    id: "trip_003",
    from: "Bình Thạnh",
    to: "Quận 3, TP.HCM",
    departureTime: "2025-11-18T17:30:00",
    price: 85000,
    driverName: "Lê Minh Tuấn",
    driverPhone: "0933 567 890",
    vehiclePlate: "51F-55555",
    vehicleType: "Mazda 3",
    status: "CANCELLED",
  },
  {
    id: "trip_004",
    from: "Thủ Đức",
    to: "Bến xe Miền Đông",
    departureTime: "2025-11-22T07:00:00",
    price: 120000,
    driverName: "Phạm Quốc Anh",
    driverPhone: "0987 654 321",
    vehiclePlate: "51H-99999",
    vehicleType: "Kia Carnival",
    status: "UPCOMING",
  },
];

// Chỉ lấy những chuyến đã hoàn thành + chưa đánh giá → để hiện ở trang RateTrip
export const mockTripsToRate = mockUserTrips.filter(
  (t) => t.status === "COMPLETED" && !t.hasRated
);
