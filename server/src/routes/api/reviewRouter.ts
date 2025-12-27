import { Router } from "express";
import { ReviewController } from "@controllers/reviewController";
import { authenticateJwt, isAdmin } from "@middlewares/auth";
import { csrfUserProtectionRoute } from "@middlewares/csrf";

const router = Router();

router.post("/", csrfUserProtectionRoute, ReviewController.createReview);
router.get("/trip/:tripId", ReviewController.getReviewsByTrip);
router.get("/user/me", authenticateJwt, ReviewController.getReviewsByUser);
router.get("/user/unreviewed", authenticateJwt, ReviewController.getUnreviewedTrips);
router.put("/:id", authenticateJwt, csrfUserProtectionRoute, ReviewController.updateReview);
router.delete("/:id", authenticateJwt, csrfUserProtectionRoute, ReviewController.deleteReview);
router.get("/admin/all", authenticateJwt, isAdmin, ReviewController.getAllReviews);

export default router;
