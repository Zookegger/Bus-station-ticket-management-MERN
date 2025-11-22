// src/mock/ratings.ts
import type { Rating } from "@my-types/rating";

export const mockRatings: Rating[] = [
  {
    id: "1",
    trip: "Thành Phố Hồ Chí Minh - Thành Phố Đà Lạt",
    tripDate: "2025-06-11T03:46:00.000Z",
    userEmail: "hoanganht@example.com",
    rating: 9,
    comment: "Tài xế thân thiện, xe sạch sẽ, đúng giờ!",
    createdAt: "2025-06-11T10:30:00Z",
  },
  {
    id: "2",
    trip: "Thành Phố Hồ Chí Minh - Thành Phố Đà Lạt",
    tripDate: "2025-06-10T03:46:00.000Z",
    userEmail: "thinh15v@gmail.com",
    rating: 8,
    comment: "Xe hơi cũ nhưng chạy ổn",
    createdAt: "2025-06-10T11:15:00Z",
  },
  {
    id: "3",
    trip: "Thành Phố Hồ Chí Minh - Thành Phố Đà Lạt",
    tripDate: "2025-06-09T03:46:00.000Z",
    userEmail: "nguyenhuy@example.com",
    rating: 7,
    createdAt: "2025-06-09T09:20:00Z",
  },
  {
    id: "4",
    trip: "Thành Phố Hồ Chí Minh - Thành Phố Đà Lạt",
    tripDate: "2025-06-08T03:46:00.000Z",
    userEmail: "lequocuong@example.com",
    rating: 6,
    comment: "Chậm hơn dự kiến 30 phút",
    createdAt: "2025-06-08T14:00:00Z",
  },
  {
    id: "5",
    trip: "Thành Phố Hồ Chí Minh - Thành Phố Đà Lạt",
    tripDate: "2025-06-07T03:46:00.000Z",
    userEmail: "maithixuan@example.com",
    rating: 9,
    createdAt: "2025-06-07T16:45:00Z",
  },
  // ... thêm nhiều hơn nếu cần
];
