export interface Rating {
  id: string;
  trip: string; // Ví dụ: "Thành Phố Hồ Chí Minh - Thành Phố Đà Lạt"
  tripDate: string; // ISO string hoặc date
  userEmail: string;
  rating: number; // 1 đến 10 (theo ảnh là 10 sao)
  comment?: string;
  createdAt: string;
}

// src/types/userRating.ts
import type { UserTrip } from "./userTrip";

export interface UserRating {
  id: string;
  tripId: string;
  trip: UserTrip; // Dùng luôn UserTrip để hiển thị thông tin chuyến
  rating: number; // 1-5
  comment?: string;
  createdAt: string; // ISO string
}
