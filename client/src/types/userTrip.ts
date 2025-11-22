// Chỉ lấy những trạng thái mà người dùng cần biết + quan tâm
export type UserTripStatus =
  | "COMPLETED" // Đã hoàn thành → có thể đánh giá
  | "CANCELLED" // Bị hủy → hiển thị thông báo
  | "ONGOING" // Đang diễn ra
  | "UPCOMING" // Sắp tới
  | "DELAYED"; // Bị trễ

// Type đơn giản hóa dành riêng cho người dùng xem và đánh giá
export interface UserTrip {
  id: string;
  from: string; // Ví dụ: "Quận 1, TP.HCM"
  to: string; // Ví dụ: "Sân bay Tân Sơn Nhất"
  fromShort?: string; // Optional: "Q1, HCM"
  toShort?: string; // "TSN"

  departureTime: string; // ISO string hoặc Date string
  arrivalTime?: string; // Có thể không có nếu chưa biết

  price: number; // VND

  driverName: string;
  driverPhone: string;
  driverAvatar?: string; // URL ảnh tài xế (nếu có)

  vehiclePlate: string; // Biển số xe
  vehicleType: string; // "Sedan 4 chỗ", "SUV 7 chỗ",...

  status: UserTripStatus;

  // Để biết chuyến này đã được đánh giá chưa
  hasRated?: boolean;
  rating?: number; // Nếu đã đánh giá thì hiện sao
  ratingId?: string; // ID của rating nếu cần sửa
}
