// src/data/mockUserRatings.ts
import type { UserRating } from "@my-types/rating";
import { mockUserTrips } from "./mockUserTrips";

export const mockUserRatings: UserRating[] = [
  {
    id: "rating_101",
    tripId: "trip_001",
    trip: mockUserTrips[0]!,
    rating: 5,
    comment: "Tài xế rất thân thiện, xe sạch sẽ, đúng giờ xuất phát!",
    createdAt: "2025-11-20T16:00:00",
  },
  {
    id: "rating_102",
    tripId: "trip_002",
    trip: mockUserTrips[1]!,
    rating: 4,
    comment: "Chuyến đi ổn, nhưng đường kẹt xe nên hơi chậm",
    createdAt: "2025-11-21T09:30:00",
  },
];
